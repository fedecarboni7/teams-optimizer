from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.utils.auth import get_current_user

def get_user_clubs(db: Session, current_user: models.User = Depends(get_current_user)):
    clubs = db.query(models.Club).filter(models.Club.creator_id == current_user.id).all()
    return clubs

def get_club_players(club_id: int, db: Session):
    players = db.query(models.Player).filter(models.Player.club_id == club_id).all()
    return players

def get_club_members(club_id: int, db: Session):
    members = db.query(models.ClubUser).filter(models.ClubUser.club_id == club_id).all()
    return members

def add_player_to_club(club_id: int, player_id: int, db: Session, current_user: models.User = Depends(get_current_user)):
    player = db.query(models.Player).filter(models.Player.id == player_id, models.Player.user_id == current_user.id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found or does not belong to the current user")
    
    player.club_id = club_id
    db.commit()
    db.refresh(player)
    return player

def add_user_to_club(club_id: int, user_data: schemas.ClubUserCreate, db: Session, current_user: models.User = Depends(get_current_user)):
    # Verificar que el club existe
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    # Crear la membresía en el club
    club_user = models.ClubUser(club_id=club_id, user_id=user_data.user_id, role=user_data.role)
    db.add(club_user)
    db.commit()
    db.refresh(club_user)
    return club_user

def create_skill_vote(player_id: int, skill_vote: schemas.SkillVoteCreate, db: Session, current_user: models.User = Depends(get_current_user)):
    # Verificar que el jugador existe
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Crear el voto
    vote = models.SkillVote(player_id=player_id, voter_id=current_user.id, skill_name=skill_vote.skill_name, rating=skill_vote.rating)
    db.add(vote)
    db.commit()
    db.refresh(vote)
    return vote

def get_skill_votes(player_id: int, db: Session):
    votes = db.query(models.SkillVote).filter(models.SkillVote.player_id == player_id).all()
    return votes

def create_club(db: Session, club: schemas.ClubCreate, creator_id: int):
    # Crear el nuevo club
    new_club = models.Club(name=club.name, creator_id=creator_id)
    db.add(new_club)
    db.commit()
    db.refresh(new_club)
    
    # Agregar al creador como miembro del club con rol de "admin"
    club_user = models.ClubUser(club_id=new_club.id, user_id=creator_id, role="admin")
    db.add(club_user)
    db.commit()
    db.refresh(club_user)

    return new_club