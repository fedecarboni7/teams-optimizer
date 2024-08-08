import os

from passlib.hash import pbkdf2_sha256
from sqlalchemy import ForeignKey, create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, relationship, declarative_base

from app.config.logging_config import logger

LOCAL_DB = os.getenv("LOCAL_DB", "").lower() == "true"

if LOCAL_DB:
    logger.info("Using local database")
    dbUrl = "sqlite:///./test.db"
    engine = create_engine(dbUrl, connect_args={'check_same_thread': False})
else:
    TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL")
    TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN")
    timeout = int(os.getenv('DB_TIMEOUT', 30))

    dbUrl = f"sqlite+{TURSO_DATABASE_URL}/?authToken={TURSO_AUTH_TOKEN}&secure=true"
    engine = create_engine(dbUrl, connect_args={'check_same_thread': False, 'timeout': timeout}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    players = relationship("Player", back_populates="user")

    def set_password(self, password):
        self.password = pbkdf2_sha256.hash(password)

    def verify_password(self, password):
        return pbkdf2_sha256.verify(password, self.password)


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    velocidad = Column(Integer)
    resistencia = Column(Integer)
    control = Column(Integer)
    pases = Column(Integer)
    tiro = Column(Integer)
    defensa = Column(Integer)
    habilidad_arquero = Column(Integer)
    fuerza_cuerpo = Column(Integer)
    vision = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="players")

# Create all tables in the database
if LOCAL_DB:
    Base.metadata.create_all(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
