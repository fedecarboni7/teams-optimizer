from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# User schemas
class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None

    class Config:
        from_attributes = True

# Password reset schemas
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class PlayerCreate(BaseModel):
    id: Optional[int] = None
    name: str
    velocidad: int
    resistencia: int
    control: int
    pases: int
    tiro: int
    defensa: int
    habilidad_arquero: int
    fuerza_cuerpo: int
    vision: int
    club_id: Optional[int] = None

class PlayerResponse(BaseModel):
    id: int
    name: str
    velocidad: int
    resistencia: int
    control: int
    pases: int
    tiro: int
    defensa: int
    habilidad_arquero: int
    fuerza_cuerpo: int
    vision: int
    user_id: Optional[int] = None
    club_id: Optional[int] = None

    class Config:
        from_attributes = True

# Schemas para Club
class ClubCreate(BaseModel):
    name: str

class ClubResponse(BaseModel):
    id: int
    name: str
    creation_date: datetime

    class Config:
        from_attributes = True

# Schemas para ClubUser
class ClubUserCreate(BaseModel):
    user_id: int
    role: Optional[str] = "miembro"

class ClubUserResponse(BaseModel):
    id: int
    user_id: int
    club_id: int
    role: str

    class Config:
        from_attributes = True

class ClubUsersResponse(BaseModel):
    id: int
    user_id: int
    club_id: int
    role: str
    username: str

    class Config:
        from_attributes = True

# Schemas para SkillVote
class PlayerSkillsVote(BaseModel):
    velocidad: int
    resistencia: int
    control: int
    pases: int
    tiro: int
    defensa: int
    habilidad_arquero: int
    fuerza_cuerpo: int
    vision: int

class SkillVoteResponse(BaseModel):
    id: int
    player_id: int
    voter_id: int
    velocidad: int
    resistencia: int
    control: int
    pases: int
    tiro: int
    defensa: int
    habilidad_arquero: int
    fuerza_cuerpo: int
    vision: int
    vote_date: datetime

    class Config:
        from_attributes = True

class InviteRequest(BaseModel):
    invited_username: str