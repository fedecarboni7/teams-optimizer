import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config.logging_config import logger
from app.db.models import Base

from dotenv import load_dotenv


load_dotenv()

LOCAL_DB = os.getenv("LOCAL_DB", "").lower() == "true"

if LOCAL_DB:
    logger.info("Using local database")
    dbUrl = "sqlite:///./test.db"
    engine = create_engine(dbUrl, connect_args={'check_same_thread': False})
    Base.metadata.create_all(engine)
else:
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})
    Base.metadata.create_all(engine)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
