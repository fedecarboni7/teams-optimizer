from datetime import datetime
from passlib.hash import pbkdf2_sha256
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass 

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

    players = relationship("Player", back_populates="user")
    skill_votes = relationship("SkillVote", back_populates="voter")
    club_users = relationship("ClubUser", back_populates="user")

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
    club_id = Column(Integer, ForeignKey("clubs.id"))

    user = relationship("User", back_populates="players")
    club = relationship("Club", back_populates="players")
    skill_votes = relationship("SkillVote", back_populates="player")

class SkillVote(Base):
    __tablename__ = "skill_votes"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    voter_id = Column(Integer, ForeignKey("users.id"))
    skill_name = Column(String)
    rating = Column(Integer)
    vote_date = Column(DateTime, default=datetime.now)

    player = relationship("Player", back_populates="skill_votes")
    voter = relationship("User", back_populates="skill_votes")

class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    creator_id = Column(Integer, ForeignKey("users.id"))
    creation_date = Column(DateTime, default=datetime.now)

    creator = relationship("User", foreign_keys=[creator_id]) 
    members = relationship("ClubUser", back_populates="club")
    players = relationship("Player", back_populates="club")

class ClubUser(Base):
    __tablename__ = "club_users"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String)

    club = relationship("Club", back_populates="members")
    user = relationship("User", back_populates="club_users")
