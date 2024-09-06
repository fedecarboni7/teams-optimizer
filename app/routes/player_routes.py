from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.database_utils import execute_with_retries, execute_write_with_retries, query_player
from app.db.models import Player, User
from app.db.schemas import PlayerCreate
from app.utils.auth import get_current_user
from app.utils.security import verify_token

router = APIRouter()

@router.get("/reset")
async def reset_players(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        return {"error": "No hay un usuario autenticado"}

    current_user_id = current_user.id

    def delete_players():
        db.query(Player).filter(Player.user_id == current_user_id).delete()
        db.commit()

    try:
        execute_write_with_retries(delete_players)
    except OperationalError:
        return {"error": "Error al acceder a la base de datos. Inténtalo de nuevo más tarde."}
    
    return {"ok": True}


@router.get("/player/{player_id}")
def get_player(player_id: int, db: Session = Depends(get_db)):
    try:
        player = execute_with_retries(query_player, db, player_id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)

    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return player


@router.put("/player/{player_id}")
def update_player(player_id: int, player: PlayerCreate, db: Session = Depends(get_db), current_user: str = Depends(verify_token)):
    try:
        db_player = execute_with_retries(query_player, db, player_id)
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


@router.delete("/player/{player_id}")
def delete_player(player_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        return HTMLResponse("No hay un usuario autenticado", status_code=401)

    try:
        player = execute_with_retries(query_player, db, player_id)
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

    return {"ok": True}