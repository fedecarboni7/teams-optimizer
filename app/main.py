import logging
import os
import time
from typing import Dict, List

from fastapi import FastAPI, Form, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from starlette.middleware.sessions import SessionMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import User, get_db, Player
from app.schemas import PlayerCreate
from app.team_optimizer import find_best_combination

app = FastAPI(docs_url=None, redoc_url=None)

secret_key = os.getenv("SECRET_KEY")

app.add_middleware(SessionMiddleware, secret_key=secret_key)
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

# Configura el nivel de logging para el módulo específico
logging.getLogger('libsql_client.dbapi2._async_executor').setLevel(logging.WARNING)
logging.getLogger('libsql_client.dbapi2._sync_executor').setLevel(logging.WARNING)
logging.getLogger('libsql_client.dbapi2.types').setLevel(logging.WARNING)

# Configuración general de logging (opcional)
logging.basicConfig(level=logging.INFO)

@app.middleware("http")
async def measure_execution_time(request: Request, call_next):
    ignore_paths = ["/static", "/favicon.ico", "/sm/"]
    
    if not any(request.url.path.startswith(prefix) for prefix in ignore_paths):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        logging.info(f" {process_time:.4f} seconds to process request: {request.method} {request.url.path}")
        return response
    else:
        return await call_next(request)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code in [404, 405]:  # Not Found y Method Not Allowed
        return RedirectResponse(url="/")
    raise exc


@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    if request.session.get("user_id"):
        return RedirectResponse(url="/", status_code=302)
    return templates.TemplateResponse(request=request, name="signup.html")


@app.post("/signup")
async def signup(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    # Placeholder for user registration logic
    user = db.query(User).filter(User.username == username).first()
    if user:
        return templates.TemplateResponse(request=request, name="signup.html", context={"error": "Usuario ya resgistrado"})

    new_user = User(username=username)
    new_user.set_password(password)
    db.add(new_user)
    db.commit()

    # Set user_id in session after successful registration
    request.session["user_id"] = new_user.id
    return RedirectResponse(url="/", status_code=302)


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    if request.session.get("user_id"):
        return RedirectResponse(url="/", status_code=302)
    return templates.TemplateResponse(request=request, name="login.html")


@app.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.verify_password(password):
        return templates.TemplateResponse(request=request, name="login.html", context={"error": "Usuario o contraseña incorrectos"})

    request.session["user_id"] = user.id
    return RedirectResponse(url="/", status_code=302)


calculated_results: Dict[str, dict] = {}

@app.get("/", response_class=HTMLResponse)
async def get_form(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        request.session.clear()
        return RedirectResponse("/login", status_code=302)
    
    current_user_id = current_user.id
    players = db.query(Player).filter(Player.user_id == current_user_id).all()

    # Verificar si hay resultados calculados para este usuario
    context = {
        "request": request,
        "players": players,
        "skills": ["velocidad", "resistencia", "control", "pases", "tiro", "defensa", "habilidad_arquero", "fuerza_cuerpo", "vision"]
    }

    if current_user_id in calculated_results:
        context.update(calculated_results[current_user_id])
        # Opcionalmente, limpiar los resultados después de mostrarlos
        del calculated_results[current_user_id]

    return templates.TemplateResponse(request=request, name="index.html", context=context)


@app.post("/submit", response_class=HTMLResponse)
async def submit_form(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    start_time_1 = time.time()
    current_user_id = current_user.id
    form_data = await request.form()
    list_players = form_data._list

    cant_jug = 0
    for tupla in list_players:
        if tupla[0] == "names":
            cant_jug += 1

    player_data: List[PlayerCreate] = []
    for i in range(cant_jug):
        i = i * 11
        if list_players[i][0] != "selectedPlayers":
            list_players.insert(i, None)
            continue
        player = PlayerCreate(
            name=list_players[i+1][1],
            velocidad=int(list_players[i+2][1]),
            resistencia=int(list_players[i+3][1]),
            control=int(list_players[i+4][1]),
            pases=int(list_players[i+5][1]),
            tiro=int(list_players[i+6][1]),
            defensa=int(list_players[i+7][1]),
            habilidad_arquero=int(list_players[i+8][1]),
            fuerza_cuerpo=int(list_players[i+9][1]),
            vision=int(list_players[i+10][1]),
            user_id=current_user_id
        )
        player_data.append(player)

    # Guardar o actualizar jugadores en la base de datos
    existing_players = db.query(Player).filter(Player.user_id == current_user_id).all()
    existing_players_dict = {player.name: player for player in existing_players}

    for player in player_data:
        db_player = existing_players_dict.get(player.name)
        if db_player:
            for key, value in player.model_dump().items():
                setattr(db_player, key, value)
        else:
            db_player = Player(**player.model_dump())
            db.add(db_player)

    db.commit()

    process_time_1 = time.time() - start_time_1
    logging.info(f" {process_time_1:.4f} seconds to save or update players in the database")
    start_time_2 = time.time()

    # Calcular equipos
    player_names = [p.name for p in player_data]
    player_scores = [
        [
            p.velocidad,
            p.resistencia,
            p.control,
            p.pases,
            p.tiro,
            p.defensa,
            p.habilidad_arquero,
            p.fuerza_cuerpo,
            p.vision,
        ]
        for p in player_data
    ]

    mejores_equipos, min_difference, min_difference_total = find_best_combination(
        player_scores
    )

    teams = []
    for equipos in mejores_equipos:
        teams.append([[player_names[i] for i in list(equipos[0])]])
        teams.append([[player_names[i] for i in list(equipos[1])]])

    process_time_2 = time.time() - start_time_2
    logging.info(f" {process_time_2:.4f} seconds to calculate the best teams")
    start_time_3 = time.time()
    
    # Create a dictionary to map player names to their data
    players = db.query(Player).filter(Player.user_id == current_user_id).all()
    player_data_dict = {player.name: player for player in players}
    contador = 0
    # Calculate the total and average skills for each team
    for team in teams:
        team_skills = {
            "velocidad": {"total": 0, "avg": 0},
            "resistencia": {"total": 0, "avg": 0},
            "control": {"total": 0, "avg": 0},
            "pases": {"total": 0, "avg": 0},
            "tiro": {"total": 0, "avg": 0},
            "defensa": {"total": 0, "avg": 0},
            "habilidad_arquero": {"total": 0, "avg": 0},
            "fuerza_cuerpo": {"total": 0, "avg": 0},
            "vision": {"total": 0, "avg": 0}
        }
    
        for player in team[0]:
            contador += 1
            player_data = player_data_dict[player]
            player_attrs = {key: getattr(player_data, key) for key in team_skills}
            for key, value in player_attrs.items():
                team_skills[key]["total"] += value
    
        num_players = len(team[0])
        for key in team_skills:
            team_skills[key]["avg"] = str(round(team_skills[key]["total"] / num_players, 2)).replace(".", ",")
    
        total_skills = sum(skill["total"] for skill in team_skills.values())
        avg_skills = str(round(sum(skill["total"] / num_players for skill in team_skills.values()), 2)).replace(".", ",")
    
        team.append([team_skills, total_skills, avg_skills])

    calculated_results[current_user_id] = {
        "players": players,
        "teams": teams,
        "len_teams": len(teams),
        "min_difference": str(min_difference),
        "min_difference_total": str(min_difference_total)
    }

    process_time_3 = time.time() - start_time_3
    logging.info(f" {process_time_3:.4f} seconds to calculate the total skills of each team and return the results")
    return RedirectResponse(url="/", status_code=303)


@app.get("/reset")
async def reset_session(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user_id = current_user.id
    db.query(Player).filter(Player.user_id == current_user_id).delete()
    db.commit()
    return {"ok": True}


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

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/login", status_code=307)