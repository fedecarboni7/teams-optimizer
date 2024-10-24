from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.db.database import get_db
from app.utils import crud
from app.utils.auth import get_current_user


router = APIRouter()

# Create a new club
@router.post("/clubs/", response_model=schemas.ClubResponse)
def create_club(club: schemas.ClubCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_club(db, club=club, creator_id=current_user.id)

# Delete a club
@router.delete("/clubs/{club_id}", response_model=schemas.ClubResponse)
def delete_club(club_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.delete_club(db, club_id=club_id, current_user=current_user)

# Add user to club
@router.post("/clubs/{club_id}/members", response_model=schemas.ClubUserResponse)
def add_user_to_club(club_id: int, user_data: schemas.ClubUserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.add_user_to_club(club_id=club_id, user_data=user_data, db=db, current_user=current_user)

# Get club members
@router.get("/clubs/{club_id}/members", response_model=List[schemas.ClubUserResponse])
def get_club_members(club_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_club_members(club_id, db, current_user)

# Delete user from club
@router.delete("/clubs/{club_id}/members/{user_id}", response_model=schemas.ClubUserResponse)
def remove_user_from_club(club_id: int, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.remove_user_from_club(club_id=club_id, user_id=user_id, db=db, current_user=current_user)

# Vote player skills
@router.post("/players/{player_id}/vote", response_model=schemas.SkillVoteResponse)
def create_skill_vote(player_id: int, skill_vote: schemas.PlayerSkillsVote, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_skill_vote(player_id=player_id, skill_vote=skill_vote, db=db, current_user=current_user)

# Get all players from a club
@router.get("/clubs/{club_id}/players", response_model=List[schemas.PlayerResponse])
def get_club_players(club_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_club_players(db, club_id=club_id, current_user=current_user)

# Delete player from a club
@router.delete("/clubs/{club_id}/players/{player_id}", response_model=schemas.PlayerResponse)
def remove_player_from_club(club_id: int, player_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.remove_player_from_club(db, club_id=club_id, player_id=player_id, current_user=current_user)
