from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import models, schemas


def get_players_by_user(db: Session, user_id: int):
    return db.query(models.Player).filter(models.Player.user_id == user_id).all()

def get_groups_by_user(db: Session, user_id: int):
    return db.query(models.ShareGroup).join(models.GroupMember).filter(models.GroupMember.user_id == user_id).all()

def get_shared_players(db: Session, group_id: int):
    return db.query(models.Player).join(models.SharedPlayer).filter(models.SharedPlayer.group_id == group_id).all()

def is_user_in_group(db: Session, user_id: int, group_id: int):
    return db.query(models.GroupMember).filter(
        models.GroupMember.user_id == user_id,
        models.GroupMember.group_id == group_id
    ).first() is not None

def add_player_to_group(db: Session, group_id: int, player: schemas.PlayerCreate, user_id: int):
    db_player = models.Player(**player.model_dump(), user_id=user_id)
    db.add(db_player)
    db.flush()
    db_shared_player = models.SharedPlayer(group_id=group_id, player_id=db_player.id)
    db.add(db_shared_player)
    db.commit()
    db.refresh(db_player)
    return db_player

def can_user_vote_player(db: Session, user_id: int, player_id: int):
    return db.query(models.SharedPlayer).join(models.GroupMember, models.SharedPlayer.group_id == models.GroupMember.group_id).filter(
        models.SharedPlayer.player_id == player_id,
        models.GroupMember.user_id == user_id
    ).first() is not None

def create_skill_vote(db: Session, player_id: int, vote: schemas.SkillVoteCreate, voter_id: int):
    db_vote = models.SkillVote(**vote.model_dump(), player_id=player_id, voter_id=voter_id)
    db.add(db_vote)
    db.commit()
    db.refresh(db_vote)
    return db_vote

def get_player_average_skills(db: Session, player_id: int):
    return db.query(
        models.SkillVote.skill_name,
        func.avg(models.SkillVote.rating).label('average_rating')
    ).filter(models.SkillVote.player_id == player_id).group_by(models.SkillVote.skill_name).all()