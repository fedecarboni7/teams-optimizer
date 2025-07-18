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
@router.get("/clubs/{club_id}/members", response_model=List[schemas.ClubUsersResponse])
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

# Delete player V2 from a club
@router.delete("/clubs/{club_id}/players-v2/{player_id}", response_model=schemas.PlayerResponse)
def remove_player_v2_from_club(club_id: int, player_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.remove_player_v2_from_club(db, club_id=club_id, player_id=player_id, current_user=current_user)

# Invite user to a club
@router.post("/clubs/{club_id}/invite")
def invite_to_club(
    club_id: int,
    invite_request: schemas.InviteRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return crud.invite_user_to_club(db, club_id, current_user.id, invite_request.invited_username)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Cancel invitation
@router.delete("/clubs/{club_id}/invitations/{invitation_id}")
def cancel_invitation(
    club_id: int,
    invitation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.cancel_club_invitation(db, club_id, invitation_id, current_user)

# Accept or reject club invitation
@router.post("/invitations/{invitation_id}/{action}")
def handle_invitation(
    invitation_id: int,
    action: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if action == "accept":
        return crud.accept_club_invitation(db, invitation_id, current_user.id)
    elif action == "reject":
        return crud.reject_club_invitation(db, invitation_id, current_user.id)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

# Get pending invitations
@router.get("/invitations/pending")
def get_pending_invitations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_user_pending_invitations(db, current_user.id)

# Change member role
@router.patch("/clubs/{club_id}/members/{user_id}")
def update_member_role(
    club_id: int,
    user_id: int,
    role_data: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.update_member_role(db, club_id, user_id, role_data, current_user)

# Leave club
@router.post("/clubs/{club_id}/leave")
def leave_club(club_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    club_user = db.query(models.ClubUser).filter(
        models.ClubUser.club_id == club_id,
        models.ClubUser.user_id == current_user.id
    ).first()

    if not club_user:
        raise HTTPException(status_code=403, detail="No eres miembro de este club")

    db.delete(club_user)
    db.commit()
    return {"status": "success", "message": "Has salido del club"}
