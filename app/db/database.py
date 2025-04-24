import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config.logging_config import logger
from app.db.models import Base

from dotenv import load_dotenv


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
logger.info(f"Connecting to database at {DATABASE_URL}")

engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
