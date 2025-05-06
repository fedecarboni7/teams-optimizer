from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.database_utils import execute_with_retries, execute_write_with_retries, query_player, query_players
from app.db.models import Player, User
from app.db.schemas import PlayerCreate, PlayerResponse
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/reset", response_class=HTMLResponse)
async def reset_players(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
    if not current_user:
        return HTMLResponse("No hay un usuario autenticado", status_code=401)

    current_user_id = current_user.id

    def delete_players():
        db.query(Player).filter(Player.user_id == current_user_id).delete()
        db.commit()

    try:
        execute_write_with_retries(delete_players)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)
    
    return HTMLResponse("Jugadores eliminados correctamente")


@router.get("/player/{player_id}")
def get_player(
        player_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ) -> PlayerCreate:
    if not current_user:
        return HTMLResponse("No hay un usuario autenticado", status_code=401)
    try:
        player = execute_with_retries(query_player, db, player_id, current_user.id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)

    if player is None:
        return HTMLResponse("Player not found", status_code=404)
    return player


@router.put("/player/{player_id}")
def update_player(
        player_id: int,
        player: PlayerCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ) -> PlayerCreate:
    if not current_user:
        return HTMLResponse("No hay un usuario autenticado", status_code=401)
    try:
        db_player = execute_with_retries(query_player, db, player_id, current_user.id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)
    
    if db_player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    for key, value in player.model_dump().items():
        setattr(db_player, key, value)
    
    def update_and_commit():
        db.commit()
        db.refresh(db_player)

    try:
        execute_write_with_retries(update_and_commit)
    except OperationalError:
        return HTMLResponse("Error al realizar la actualización. Inténtalo de nuevo más tarde.", status_code=500)

    return db_player


@router.delete("/player/{player_id}", response_class=HTMLResponse)
def delete_player(
        player_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
    if not current_user:
        return HTMLResponse("No hay un usuario autenticado", status_code=401)

    try:
        player = execute_with_retries(query_player, db, player_id, current_user.id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)
    
    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    
    def delete_player():
        db.delete(player)
        db.commit()

    try:
        execute_write_with_retries(delete_player)
    except OperationalError:
        return HTMLResponse("Error al eliminar el jugador. Inténtalo de nuevo más tarde.", status_code=500)

    return HTMLResponse("Jugador eliminado correctamente")

@router.get("/players")
def get_players(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ) -> list[PlayerCreate]:
    if not current_user:
        return HTMLResponse("No hay un usuario autenticado", status_code=401)
    try:
        players = execute_with_retries(query_players, db, current_user.id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)
    
    return players

@router.post("/player", response_model=PlayerResponse)
def create_player(
        player: PlayerCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ) -> PlayerResponse:
    if not current_user:
        return HTMLResponse("No hay un usuario autenticado", status_code=401)
    db_player = Player(**player.model_dump(), user_id=current_user.id)
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@router.post("/players", response_model=list[PlayerResponse])
def save_players(
        players: list[PlayerCreate],
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        club_id: int = None
    ) -> list[PlayerResponse]:
    if not current_user:
        raise HTTPException(status_code=401, detail="No hay un usuario autenticado")
    
    try:
        # If club_id is provided, save players to club
        if club_id:
            # Query existing players in this club
            existing_players = db.query(Player).filter(Player.club_id == club_id).all()
        else:
            # Query existing players for this user
            existing_players = execute_with_retries(query_players, db, current_user.id)
            
        # Create a dict of existing players by name for quick lookup
        existing_players_dict = {player.name: player for player in existing_players}
        
        # List to hold all players that need to be added
        players_to_add = []
        # List to hold all updated players
        updated_players = []
        
        for player_data in players:
            # Check if player already exists (by name)
            existing_player = existing_players_dict.get(player_data.name)
            if existing_player:
                # Update existing player
                for key, value in player_data.model_dump().items():
                    setattr(existing_player, key, value)
                updated_players.append(existing_player)
            else:
                # Create new player
                if club_id:
                    players_to_add.append(Player(**player_data.model_dump(), club_id=club_id))
                else:
                    players_to_add.append(Player(**player_data.model_dump(), user_id=current_user.id))
        
        # Add all new players
        if players_to_add:
            db.add_all(players_to_add)
        
        # Commit all changes
        db.commit()
        
        # Refresh all objects
        for player in updated_players:
            db.refresh(player)
        for player in players_to_add:
            db.refresh(player)
            
        # Return all players that were updated or added
        return updated_players + players_to_add
    
    except OperationalError:
        raise HTTPException(status_code=500, detail="Error al acceder a la base de datos. Inténtalo de nuevo más tarde.")
