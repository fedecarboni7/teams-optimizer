from sqlalchemy.exc import OperationalError, DatabaseError
from sqlalchemy.orm import Session
from tenacity import retry, stop_after_attempt, wait_fixed

from app.db.models import Club, ClubUser, Player, User


@retry(wait=wait_fixed(2), stop=stop_after_attempt(5))
def execute_with_retries(func, *args, **kwargs):
    try:
        return func(*args, **kwargs)
    except (OperationalError, DatabaseError) as e:
        raise e
    
@retry(wait=wait_fixed(2), stop=stop_after_attempt(5))
def execute_write_with_retries(func, *args, **kwargs):
    try:
        func(*args, **kwargs)
    except (OperationalError, DatabaseError) as e:
        raise e

def query_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def query_players(db: Session, current_user_id: int):
    return db.query(Player).filter(Player.user_id == current_user_id).all()

def query_player(db: Session, player_id: int, current_user_id: int):
    return db.query(Player).filter(Player.id == player_id, Player.user_id == current_user_id).first()

def query_clubs(db: Session, current_user_id: int):
    return db.query(Club).join(ClubUser).filter(ClubUser.user_id == current_user_id).all()

def query_club_players(db: Session, club_id: int):
    return db.query(Player).filter(Player.club_id == club_id).all()

def query_club_members(db: Session, club_id: int):
    return db.query(ClubUser, User).join(User, ClubUser.user_id == User.id).filter(ClubUser.club_id == club_id).all()
