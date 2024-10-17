from passlib.hash import pbkdf2_sha256
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass 

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    players = relationship("Player", back_populates="user")
    votes = relationship("SkillVote", back_populates="voter")
    created_groups = relationship("ShareGroup", back_populates="creator")

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
    skill_votes = relationship("SkillVote", back_populates="player")
    shared_in = relationship("SharedPlayer", back_populates="player")

class SkillVote(Base):
    __tablename__ = "skill_votes"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    voter_id = Column(Integer, ForeignKey("users.id"))
    skill_name = Column(String)
    rating = Column(Integer)
    player = relationship("Player", back_populates="skill_votes")
    voter = relationship("User", back_populates="votes")

class ShareGroup(Base):
    __tablename__ = "share_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    creator_id = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User", back_populates="created_groups")
    members = relationship("GroupMember", back_populates="group")
    shared_players = relationship("SharedPlayer", back_populates="group")

class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("share_groups.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    group = relationship("ShareGroup", back_populates="members")
    user = relationship("User")

class SharedPlayer(Base):
    __tablename__ = "shared_players"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("share_groups.id"))
    player_id = Column(Integer, ForeignKey("players.id"))
    group = relationship("ShareGroup", back_populates="shared_players")
    player = relationship("Player", back_populates="shared_in")
