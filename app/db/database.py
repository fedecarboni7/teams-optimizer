import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config.logging_config import logger
from app.db.models import Base

from dotenv import load_dotenv


load_dotenv()

# Check if the code is being run in a test environment
TESTING = 'pytest' in sys.modules

if not TESTING:
    DATABASE_URL = os.getenv("DATABASE_URL")
    logger.info(f"Connecting to database at {DATABASE_URL}")
    
    engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    logger.info("Running in test mode - database connection will be handled by pytest fixtures")
    # Create a dummy engine and session for import purposes
    engine = None
    SessionLocal = None

def get_db():
    if TESTING:
        # This will be overridden by the test fixtures
        raise RuntimeError("get_db() called in test mode. This should be overridden by test fixtures.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
