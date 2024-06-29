from fastapi import FastAPI, Form, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from itertools import combinations
from typing import List
from sqlalchemy.orm import Session
from database import get_db, Player
from pydantic import BaseModel

app = FastAPI()

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

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

def calculate_team_score(indices, scores):
    team_score = [0] * len(scores[0])
    for i in indices:
        for j in range(len(scores[0])):
            team_score[j] += scores[i][j]
    return team_score

def calculate_difference(team1_score, team2_score):
    return sum(abs(team1_score[i] - team2_score[i]) for i in range(len(team1_score)))

def find_best_combination(scores):
    all_combinations = list(combinations(range(len(scores)), len(scores) // 2))
    min_difference = float('inf')
    min_difference_total = float('inf')
    mejores_equipos = list()

    for combination in all_combinations:
        team1_indices = combination
        team2_indices = [i for i in range(len(scores)) if i not in team1_indices]

        team1_score = calculate_team_score(team1_indices, scores)
        team2_score = calculate_team_score(team2_indices, scores)

        difference = calculate_difference(team1_score, team2_score)
        difference_total = abs(sum(team1_score) - sum(team2_score))

        if difference < min_difference:
            min_difference = difference
            if difference_total < min_difference_total:
                min_difference_total = difference_total
                mejores_equipos = [(team1_indices, team2_indices)]
        elif difference == min_difference:
            if difference_total == min_difference_total:
                mejores_equipos.append((team1_indices, team2_indices))

    return mejores_equipos[:int(len(mejores_equipos)/2)], min_difference, min_difference_total

@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request, db: Session = Depends(get_db)):
    players = db.query(Player).all()
    return templates.TemplateResponse("index.html", {
        "request": request,
        "players": players
    })

@app.post("/submit", response_class=HTMLResponse)
async def submit_form(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()

    # Validar los datos del formulario
    try:
        form_data['names']
    except KeyError:
        raise HTTPException(status_code=400, detail="Los datos del formulario no son válidos")

    player_data = []
    
    # Comprobar si hay múltiples jugadores o solo uno
    if isinstance(form_data['names'], str):
        # Solo hay un jugador
        player = PlayerCreate(
            name=form_data['names'],
            velocidad=int(form_data['velocidad']),
            resistencia=int(form_data['resistencia']),
            control=int(form_data['control']),
            pases=int(form_data['pases']),
            tiro=int(form_data['tiro']),
            defensa=int(form_data['defensa']),
            habilidad_arquero=int(form_data['habilidad_arquero']),
            fuerza_cuerpo=int(form_data['fuerza_cuerpo']),
            vision=int(form_data['vision'])
        )
        player_data.append(player)
    else:
        # Hay múltiples jugadores
        for i in range(len(form_data['names'])):
            player = PlayerCreate(
                name=form_data['names'][i],
                velocidad=int(form_data['velocidad'][i]),
                resistencia=int(form_data['resistencia'][i]),
                control=int(form_data['control'][i]),
                pases=int(form_data['pases'][i]),
                tiro=int(form_data['tiro'][i]),
                defensa=int(form_data['defensa'][i]),
                habilidad_arquero=int(form_data['habilidad_arquero'][i]),
                fuerza_cuerpo=int(form_data['fuerza_cuerpo'][i]),
                vision=int(form_data['vision'][i])
            )
            player_data.append(player)

    # Guardar o actualizar jugadores en la base de datos
    for player in player_data:
        db_player = db.query(Player).filter(Player.name == player.name).first()
        if db_player:
            for key, value in player.dict().items():
                setattr(db_player, key, value)
        else:
            db_player = Player(**player.dict())
            db.add(db_player)
    db.commit()

    # Calcular equipos
    players = db.query(Player).all()
    player_names = [p.name for p in players]
    player_scores = [[p.velocidad, p.resistencia, p.control, p.pases, p.tiro, p.defensa, p.habilidad_arquero, p.fuerza_cuerpo, p.vision] for p in players]

    mejores_equipos, min_difference, min_difference_total = find_best_combination(player_scores)

    teams = []
    for equipos in mejores_equipos:
        teams.append([player_names[i] for i in list(equipos[0])])
        teams.append([player_names[i] for i in list(equipos[1])])

    return templates.TemplateResponse("index.html", {
        "request": request,
        "players": players,
        "teams": teams,
        "len_teams": len(teams),
        "min_difference": min_difference,
        "min_difference_total": min_difference_total
    })

@app.get("/reset")
async def reset_session(db: Session = Depends(get_db)):
    db.query(Player).delete()
    db.commit()
    return RedirectResponse("/")

@app.get("/player/{player_id}")
def get_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@app.put("/player/{player_id}")
def update_player(player_id: int, player: PlayerCreate, db: Session = Depends(get_db)):
    db_player = db.query(Player).filter(Player.id == player_id).first()
    if db_player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    for key, value in player.dict().items():
        setattr(db_player, key, value)
    db.commit()
    db.refresh(db_player)
    return db_player

@app.delete("/player/{player_id}")
def delete_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    db.delete(player)
    db.commit()
    return {"ok": True}