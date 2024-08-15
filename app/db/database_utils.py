from sqlalchemy import inspect
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from tenacity import retry, stop_after_attempt, wait_fixed

from app.db.models import Player, User


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

def query_player(db: Session, player_id: int):
    return db.query(Player).filter(Player.id == player_id).first()

def get_db_structure(db: Session) -> str:
    inspector = inspect(db.bind)
    
    structure = []
    for table_name in inspector.get_table_names():
        columns = []
        for column in inspector.get_columns(table_name):
            column_info = f"  - {column['name']} ({column['type']})"
            if column.get('primary_key'):
                column_info += " (primary key)"
            if column.get('foreign_keys'):
                fk = next(iter(column['foreign_keys']))
                column_info += f" (foreign key to {fk.target_fullname})"
            columns.append(column_info)
        
        structure.append(f"Tabla {table_name}:")
        structure.extend(columns)
        structure.append("")  # Añade una línea en blanco entre tablas

    return "\n".join(structure)
