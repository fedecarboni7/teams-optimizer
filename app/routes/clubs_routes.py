from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.db.database import get_db
from app.utils import crud
from app.utils.auth import get_current_user


router = APIRouter()

@router.post("/clubs/", response_model=schemas.ClubResponse)
def create_club(club: schemas.ClubCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_club(db, club=club, creator_id=current_user.id)

@router.delete("/clubs/{club_id}", response_model=schemas.ClubResponse)
def delete_club(club_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.delete_club(db, club_id=club_id, current_user=current_user)

@router.post("/clubs/{club_id}/players/{player_id}", response_model=schemas.PlayerResponse)
def add_player_to_club(club_id: int, player_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.add_player_to_club(db, club_id=club_id, player_id=player_id, current_user=current_user)

@router.get("/clubs/{club_id}/members", response_model=List[schemas.ClubUserResponse])
def get_club_members(club_id: int, db: Session = Depends(get_db)):
    return crud.get_club_members(club_id, db)

@router.post("/clubs/{club_id}/members", response_model=schemas.ClubUserResponse)
def add_user_to_club(club_id: int, user_data: schemas.ClubUserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.add_user_to_club(db, club_id=club_id, user_data=user_data, current_user=current_user)

@router.post("/players/{player_id}/vote", response_model=schemas.SkillVoteResponse)
def create_skill_vote(player_id: int, skill_vote: schemas.SkillVoteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_skill_vote(db, player_id=player_id, skill_vote=skill_vote, current_user=current_user)

@router.get("/players/{player_id}/votes", response_model=List[schemas.SkillVoteResponse])
def get_skill_votes(player_id: int, db: Session = Depends(get_db)):
    return crud.get_skill_votes(db, player_id=player_id)

@router.delete("/clubs/{club_id}/players/{player_id}", response_model=schemas.PlayerResponse)
def remove_player_from_club(club_id: int, player_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.remove_player_from_club(db, club_id=club_id, player_id=player_id, current_user=current_user)
