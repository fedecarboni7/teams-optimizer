from datetime import datetime, timedelta
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

async def invite_user_to_club(
    db: Session,
    club_id: int,
    inviter_id: int,
    invited_username: str,
    expiration_days: int = 7
):
    # Verificar que el invitador es miembro del club
    club_user = db.query(models.ClubUser).filter(
        models.ClubUser.club_id == club_id,
        models.ClubUser.user_id == inviter_id,
        models.ClubUser.role == "owner"
    ).first()
    if not club_user:
        raise ValueError("No tienes permisos para invitar usuarios a este club")

    # Buscar al usuario invitado por username
    invited_user = db.query(models.User).filter(models.User.username == invited_username).first()
    if not invited_user:
        raise ValueError(f"Usuario {invited_username} no encontrado")

    # Verificar si ya existe una invitación pendiente
    existing_invitation = db.query(models.ClubInvitation).filter(
        models.ClubInvitation.club_id == club_id,
        models.ClubInvitation.invited_user_id == invited_user.id,
        models.ClubInvitation.status == models.InvitationStatus.PENDING.value
    ).first()
    if existing_invitation:
        raise ValueError(f"Ya existe una invitación pendiente para {invited_username}")

    # Crear nueva invitación
    invitation = models.ClubInvitation(
        club_id=club_id,
        invited_user_id=invited_user.id,
        inviter_id=inviter_id,
        expiration_date=datetime.now() + timedelta(days=expiration_days)
    )
    db.add(invitation)
    db.commit()
    return invitation

async def accept_club_invitation(db: Session, invitation_id: int, user_id: int):
    invitation = db.query(models.ClubInvitation).filter(
        models.ClubInvitation.id == invitation_id,
        models.ClubInvitation.invited_user_id == user_id,
        models.ClubInvitation.status == models.InvitationStatus.PENDING.value
    ).first()
    
    if not invitation:
        raise ValueError("Invitación no encontrada o no válida")
    
    if invitation.expiration_date < datetime.now():
        invitation.status = models.InvitationStatus.EXPIRED.value
        db.commit()
        raise ValueError("La invitación ha expirado")

    # Crear nueva membresía en el club
    club_user = models.ClubUser(
        club_id=invitation.club_id,
        user_id=user_id,
        role="member"  # Rol por defecto para nuevos miembros
    )
    
    invitation.status = models.InvitationStatus.ACCEPTED.value
    db.add(club_user)
    db.commit()
    return club_user

async def reject_club_invitation(db: Session, invitation_id: int, user_id: int):
    invitation = db.query(models.ClubInvitation).filter(
        models.ClubInvitation.id == invitation_id,
        models.ClubInvitation.invited_user_id == user_id,
        models.ClubInvitation.status == models.InvitationStatus.PENDING.value
    ).first()
    
    if not invitation:
        raise ValueError("Invitación no encontrada o no válida")
    
    invitation.status = models.InvitationStatus.REJECTED.value
    db.commit()
    return invitation

async def get_user_pending_invitations(db: Session, user_id: int):
    return db.query(models.ClubInvitation).filter(
        models.ClubInvitation.invited_user_id == user_id,
        models.ClubInvitation.status == models.InvitationStatus.PENDING.value,
        models.ClubInvitation.expiration_date > datetime.now()
    ).all()