from datetime import datetime
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.utils.auth import get_current_user


def get_club_members(club_id: int, db: Session, current_user: models.User = Depends(get_current_user)):
    # Verificar que el club existe
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Verificar que el usuario actual es miembro del club
    club_user = db.query(models.ClubUser).filter(models.ClubUser.club_id == club_id, models.ClubUser.user_id == current_user.id).first()
    if not club_user:
        raise HTTPException(status_code=403, detail="You are not a member of this club")
    
    # Obtener los miembros del club
    members = db.query(models.ClubUser).filter(models.ClubUser.club_id == club_id).all()
    return members

def add_user_to_club(club_id: int, user_data: schemas.ClubUserCreate, db: Session, current_user: models.User = Depends(get_current_user)):
    # Verificar que el club existe
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    # Verificar que el usuario actual tiene rol de "owner"
    club_user = db.query(models.ClubUser).filter(models.ClubUser.club_id == club_id, models.ClubUser.user_id == current_user.id).first()
    if not club_user or club_user.role != "owner":
        raise HTTPException(status_code=403, detail="You don't have permission to add users to this club")
    
    # Verificar que el usuario existe
    user = db.query(models.User).filter(models.User.id == user_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Crear la membresía en el club
    club_user = models.ClubUser(club_id=club_id, user_id=user_data.user_id, role=user_data.role)
    db.add(club_user)
    db.commit()
    db.refresh(club_user)
    return club_user

def remove_user_from_club(club_id: int, user_id: int, db: Session, current_user: models.User = Depends(get_current_user)):
    # Verificar que el club existe
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Verificar que el usuario actual tiene rol de "owner"
    club_user = db.query(models.ClubUser).filter(models.ClubUser.club_id == club_id, models.ClubUser.user_id == current_user.id).first()
    if not club_user or club_user.role != "owner":
        raise HTTPException(status_code=403, detail="You don't have permission to remove users from this club")
    
    # Verificar que el usuario a eliminar existe
    user_to_remove = db.query(models.ClubUser).filter(models.ClubUser.club_id == club_id, models.ClubUser.user_id == user_id).first()
    if not user_to_remove:
        raise HTTPException(status_code=404, detail="User not found in this club")
    
    # Eliminar al usuario del club
    db.delete(user_to_remove)
    db.commit()
    return user_to_remove

def create_skill_vote(player_id: int, skill_vote: schemas.PlayerSkillsVote, db: Session, current_user: models.User = Depends(get_current_user)):
    # Verificar que el jugador existe
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Verificar que el jugador y el usuario actual pertenecen al mismo club
    club_user = db.query(models.ClubUser).filter(models.ClubUser.user_id == current_user.id, models.ClubUser.club_id == player.club_id).first()
    if not club_user:
        raise HTTPException(status_code=403, detail="You are not in the same club as this player")

    # Verificar si el usuario ya votó
    old_vote = db.query(models.SkillVote).filter(models.SkillVote.player_id == player_id, models.SkillVote.voter_id == current_user.id).first()
    if old_vote:
        # Actualizar el voto existente
        for attr, value in skill_vote.model_dump().items():
            setattr(old_vote, attr, value)
        old_vote.vote_date = datetime.now()
        db.commit()
        db.refresh(old_vote)
        return old_vote

    # Crear un nuevo voto
    vote = models.SkillVote(
        player_id=player_id,
        voter_id=current_user.id,
        **skill_vote.model_dump()
    )

    db.add(vote)
    db.commit()
    db.refresh(vote)
    return vote

def create_club(db: Session, club: schemas.ClubCreate, user_id: int):
    # Crear el nuevo club
    new_club = models.Club(name=club.name)
    db.add(new_club)
    db.commit()
    db.refresh(new_club)
    
    # Agregar al creador como miembro del club con rol de "owner"
    club_user = models.ClubUser(club_id=new_club.id, user_id=user_id, role="owner")
    db.add(club_user)
    db.commit()
    db.refresh(club_user)

    return new_club

def delete_club(db: Session, club_id: int, current_user: models.User = Depends(get_current_user)):
    # Verificar que el club existe
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Verificar que el usuario actual tiene rol de "owner"
    club_user = db.query(models.ClubUser).filter(models.ClubUser.club_id == club_id, models.ClubUser.user_id == current_user.id).first()
    if not club_user or club_user.role != "owner":
        raise HTTPException(status_code=403, detail="You don't have permission to delete this club")

    # Eliminar los miembros
    db.query(models.ClubUser).filter(models.ClubUser.club_id == club_id).delete()
    # Eliminar los votos
    skill_votes = db.query(models.SkillVote).join(models.Player).filter(models.Player.club_id == club_id).all()
    for vote in skill_votes:
        db.delete(vote)
    # Eliminar los jugadores
    db.query(models.Player).filter(models.Player.club_id == club_id).delete()
    # Eliminar el club
    db.delete(club)
    db.commit()
    return club

def get_club_players(db: Session, club_id: int, current_user: models.User = Depends(get_current_user)):
    # Verificar que el club existe
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Verificar que el usuario actual es miembro del club
    club_user = db.query(models.ClubUser).filter(models.ClubUser.club_id == club_id, models.ClubUser.user_id == current_user.id).first()
    if not club_user:
        raise HTTPException(status_code=403, detail="You are not a member of this club")
    
    # Obtener los jugadores del club
    players = db.query(models.Player).filter(models.Player.club_id == club_id).all()
    return players

def remove_player_from_club(db: Session, club_id: int, player_id: int, current_user: models.User = Depends(get_current_user)):
    # Verificar que el club existe
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Verificar que el usuario actual tiene rol de "owner" o "admin"
    club_user = db.query(models.ClubUser).filter(models.ClubUser.club_id == club_id, models.ClubUser.user_id == current_user.id).first()
    if not club_user or club_user.role not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="You don't have permission to remove players from this club")

    # Verificar que el jugador existe
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Eliminar el jugador del club
    player.club_id = None
    db.commit()
    return player