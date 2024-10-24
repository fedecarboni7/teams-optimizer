from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.db.database import get_db
from app.utils import crud
from app.utils.auth import get_current_user


router = APIRouter()

# Create a new club
@router.post("/clubs/", response_model=schemas.ClubResponse)
def create_club(club: schemas.ClubCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_club(db, club=club, user_id=current_user.id)

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

@router.post("/clubs/{club_id}/invite")
async def invite_to_club(
    club_id: int,
    invited_username: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await crud.invite_user_to_club(db, club_id, current_user.id, invited_username)

@router.post("/api/invitations/{invitation_id}/{action}")
async def handle_invitation(
    invitation_id: int,
    action: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if action == "accept":
        return await crud.accept_club_invitation(db, invitation_id, current_user.id)
    elif action == "reject":
        return await crud.reject_club_invitation(db, invitation_id, current_user.id)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

@router.get("/invitations/pending")
async def get_pending_invitations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await crud.get_user_pending_invitations(db, current_user.id)

@router.patch("/clubs/{club_id}/members/{user_id}")
async def update_member_role(
    club_id: int,
    user_id: int,
    role_data: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que el current_user es owner
    club_user = db.query(models.ClubUser).filter(
        models.ClubUser.club_id == club_id,
        models.ClubUser.user_id == current_user.id,
        models.ClubUser.role == "owner"
    ).first()
    
    if not club_user:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    member = db.query(models.ClubUser).filter(
        models.ClubUser.club_id == club_id,
        models.ClubUser.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    member.role = role_data["role"]
    db.commit()
    return {"status": "success"}

@router.delete("/clubs/{club_id}/members/{user_id}")
async def remove_member(
    club_id: int,
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que el current_user es owner
    club_user = db.query(models.ClubUser).filter(
        models.ClubUser.club_id == club_id,
        models.ClubUser.user_id == current_user.id,
        models.ClubUser.role == "owner"
    ).first()
    
    if not club_user:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    member = db.query(models.ClubUser).filter(
        models.ClubUser.club_id == club_id,
        models.ClubUser.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    db.delete(member)
    db.commit()
    return {"status": "success"}