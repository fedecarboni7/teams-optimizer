from datetime import datetime
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from tenacity import retry, stop_after_attempt, wait_fixed

from app.db.models import CalculatedResult, Player, User


@retry(wait=wait_fixed(2), stop=stop_after_attempt(5))
def execute_with_retries(func, *args, **kwargs):
    try:
        return func(*args, **kwargs)
    except OperationalError as e:
        raise e
    
@retry(wait=wait_fixed(2), stop=stop_after_attempt(5))
def execute_write_with_retries(func, *args, **kwargs):
    try:
        func(*args, **kwargs)
    except OperationalError as e:
        raise e

def query_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def query_players(db: Session, current_user_id: int):
    return db.query(Player).filter(Player.user_id == current_user_id).all()

def query_player(db: Session, player_id: int, current_user_id: int):
    return db.query(Player).filter(Player.id == player_id, Player.user_id == current_user_id).first()

def save_calculated_result(db: Session, user_id: str, teams: dict, min_difference_total: str, player_data_dict: dict):
    # Verifica si ya existe un resultado para el user_id dado
    db_result = db.query(CalculatedResult).filter(CalculatedResult.user_id == user_id).first()
    
    if db_result:
        # Si existe, actualiza los campos
        db_result.teams = teams
        db_result.min_difference_total = min_difference_total
        db_result.player_data_dict = player_data_dict
        db_result.updated_at = datetime.now()
    else:
        # Si no existe, crea un nuevo registro
        db_result = CalculatedResult(
            user_id=user_id,
            teams=teams,
            min_difference_total=min_difference_total,
            player_data_dict=player_data_dict
        )
        db.add(db_result)

    db.commit()
    db.refresh(db_result)
    return db_result


def query_calculated_results(db: Session, user_id: str):
    return db.query(CalculatedResult).filter(CalculatedResult.user_id == user_id).first()