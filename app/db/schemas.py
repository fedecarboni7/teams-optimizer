from pydantic import BaseModel


class PlayerCreate(BaseModel):
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
    user_id: int

    class Config:
        from_attributes = True

class ShareGroupBase(BaseModel):
    name: str

class ShareGroupCreate(ShareGroupBase):
    creator_id: int

class ShareGroup(ShareGroupBase):
    id: int
    creator_id: int

    class Config:
        from_attributes = True

class SkillVoteBase(BaseModel):
    player_id: int
    voter_id: int
    skill_name: str
    rating: int

class SkillVoteCreate(SkillVoteBase):
    pass

class SkillVote(SkillVoteBase):
    id: int

    class Config:
        from_attributes = True
