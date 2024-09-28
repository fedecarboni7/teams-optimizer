from datetime import datetime
from passlib.hash import pbkdf2_sha256
from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass 

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    players = relationship("Player", back_populates="user")
    calculated_results = relationship("CalculatedResult", back_populates="user")

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

class CalculatedResult(Base):
    __tablename__ = "calculated_results"

    id = Column(Integer, primary_key=True, index=True)
    teams = Column(JSON)
    min_difference_total = Column(Integer)
    player_data_dict = Column(JSON)
    updated_at = Column(DateTime, default=datetime.now)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="calculated_results")