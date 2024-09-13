import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config.logging_config import logger
from app.db.models import Base


load_dotenv(".env", override=True)
LOCAL_DB = os.getenv("LOCAL_DB", "").lower() == "true"

if LOCAL_DB:
    logger.info("Using local database")
    dbUrl = "sqlite:///./test.db"
    engine = create_engine(dbUrl, connect_args={'check_same_thread': False})
    Base.metadata.create_all(engine)
else:
    TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL")
    TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN")
    timeout = int(os.getenv('DB_TIMEOUT', 30))

    dbUrl = f"sqlite+{TURSO_DATABASE_URL}/?authToken={TURSO_AUTH_TOKEN}&secure=true"
    engine = create_engine(dbUrl, connect_args={'check_same_thread': False, 'timeout': timeout}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
