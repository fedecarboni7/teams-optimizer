from datetime import datetime
from enum import Enum
from passlib.hash import pbkdf2_sha256
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass 

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    email = Column(String, unique=True, index=True, nullable=True)  # Nullable para usuarios existentes

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
    velocidad = Column(Integer)
    resistencia = Column(Integer)
    control = Column(Integer)
    pases = Column(Integer)
    tiro = Column(Integer)
    defensa = Column(Integer)
    habilidad_arquero = Column(Integer)
    fuerza_cuerpo = Column(Integer)
    vision = Column(Integer)
    vote_date = Column(DateTime, default=datetime.now)

    player = relationship("Player", back_populates="skill_votes")
    voter = relationship("User", back_populates="skill_votes")

class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    creation_date = Column(DateTime, default=datetime.now)

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

class InvitationStatus(Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class ClubInvitation(Base):
    __tablename__ = "club_invitations"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"))
    invited_user_id = Column(Integer, ForeignKey("users.id"))
    inviter_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default=InvitationStatus.PENDING.value)
    creation_date = Column(DateTime, default=datetime.now)
    expiration_date = Column(DateTime)
    
    club = relationship("Club", backref="invitations")
    invited_user = relationship("User", foreign_keys=[invited_user_id])
    inviter = relationship("User", foreign_keys=[inviter_id])

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.now)
    expires_at = Column(DateTime)
    used = Column(Boolean, default=False)
    
    user = relationship("User", backref="password_reset_tokens")
