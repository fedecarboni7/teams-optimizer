from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.db.database import get_db
from app.utils import crud
from app.utils.auth import get_current_user


router = APIRouter()

@router.get("/players/my", response_model=List[schemas.PlayerResponse])
def get_my_players(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_players_by_user(db, user_id=current_user.id)

@router.post("/group/create", response_model=schemas.ShareGroup)
def create_group(group: schemas.ShareGroupCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_group(db, group=group, creator_id=current_user.id)

@router.get("/groups", response_model=List[schemas.ShareGroup])
def get_my_groups(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_groups_by_user(db, user_id=current_user.id)

@router.get("/groups/{group_id}/players", response_model=List[schemas.PlayerResponse])
def get_shared_players(group_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not crud.is_user_in_group(db, user_id=current_user.id, group_id=group_id):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    return crud.get_shared_players(db, group_id=group_id)

@router.post("/groups/{group_id}/players", response_model=schemas.PlayerResponse)
def add_player_to_group(group_id: int, player: schemas.PlayerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not crud.is_user_in_group(db, user_id=current_user.id, group_id=group_id):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    return crud.add_player_to_group(db, group_id=group_id, player=player, user_id=current_user.id)

@router.post("/players/{player_id}/vote", response_model=schemas.SkillVote)
def vote_player_skill(player_id: int, vote: schemas.SkillVoteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not crud.can_user_vote_player(db, user_id=current_user.id, player_id=player_id):
        raise HTTPException(status_code=403, detail="Not allowed to vote for this player")
    return crud.create_skill_vote(db, player_id=player_id, vote=vote, voter_id=current_user.id)