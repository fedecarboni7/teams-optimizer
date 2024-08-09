import logging
import os
import re
import time

from fastapi import FastAPI, Form, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from tenacity import retry, wait_fixed, stop_after_attempt
from typing import Dict, List

from app.auth import get_current_user
from app.config.logging_config import logger
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

@app.middleware("http")
async def measure_execution_time(request: Request, call_next):
    ignore_paths = ["/static", "/favicon.ico", "/sm/"]
    
    if not any(request.url.path.startswith(prefix) for prefix in ignore_paths):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.debug(f"{process_time:.4f} seconds to process request: {request.method} {request.url.path}")
        return response
    else:
        return await call_next(request)


@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc: Exception):
    """
    Maneja los errores del servidor y muestra una página de error personalizada.
    """
    return templates.TemplateResponse("500.html", {"request": request}, status_code=500)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code in [404, 405]:  # Not Found y Method Not Allowed
        return RedirectResponse(url="/")
    raise exc


@retry(wait=wait_fixed(2), stop=stop_after_attempt(5))
def execute_with_retries(func, *args, **kwargs):
    try:
        return func(*args, **kwargs)
    except OperationalError as e:
        raise e
    
@retry(wait=wait_fixed(2), stop=stop_after_attempt(5))
def execute_write_with_retries(func, *args, **kwargs):
    try:
        func(*args, **kwargs)
    except OperationalError as e:
        raise e

def query_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def query_players(db: Session, current_user_id: int):
    return db.query(Player).filter(Player.user_id == current_user_id).all()

def query_player(db: Session, player_id: int):
    return db.query(Player).filter(Player.id == player_id).first()

@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    if request.session.get("user_id"):
        return RedirectResponse(url="/", status_code=302)
    return templates.TemplateResponse(request=request, name="signup.html")


def validate_username(username: str):
    if len(username) < 3 or len(username) > 30:
        raise ValueError("El nombre de usuario debe tener entre 3 y 30 caracteres.")
    if not re.match(r'^[\w.]+$', username):
        raise ValueError("El nombre de usuario solo puede contener letras, números, guiones bajos y puntos.")

def validate_password(password: str):
    if len(password) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("La contraseña debe contener al menos una letra mayúscula.")
    if not re.search(r"[a-z]", password):
        raise ValueError("La contraseña debe contener al menos una letra minúscula.")
    if not re.search(r"[0-9]", password):
        raise ValueError("La contraseña debe contener al menos un número.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("La contraseña debe contener al menos un carácter especial.")
    if re.search(r"(.)\1\1\1", password):
        raise ValueError("La contraseña no debe contener más de tres caracteres repetidos consecutivos.")
    if re.search(r"(012|123|234|345|456|567|678|789|890|qwerty|asdf)", password.lower()):
        raise ValueError("La contraseña no debe contener secuencias de números o teclas comunes.")

    common_passwords = ["123456", "password", "12345678", "qwerty", "abc123"]
    if password.lower() in common_passwords:
        raise ValueError("La contraseña es demasiado común. Por favor, elija una diferente.")


@app.post("/signup")
async def signup(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    username = username.strip().lower()

    # Validar nombre de usuario y contraseña
    try:
        validate_username(username)
        validate_password(password)
    except ValueError as e:
        return templates.TemplateResponse("signup.html", {"request": request, "error": str(e)})

    try:
        user = execute_with_retries(query_user, db, username)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)
    
    if user:
        return templates.TemplateResponse(request=request, name="signup.html", context={"error": "Usuario ya registrado"})

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
    username = username.strip().lower()

    try:
        user: User = execute_with_retries(query_user, db, username)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)
    
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
    try:
        players = execute_with_retries(query_players, db, current_user_id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)

    context = {"players": players}

    if current_user_id in calculated_results:
        context.update(calculated_results[current_user_id])
        context.update({
            "len_teams": len(context["teams"]),
            "skills": {"velocidad": "Velocidad", "resistencia": "Resistencia", "control": "Control", "pases": "Pases", "fuerza_cuerpo": "Fuerza cuerpo", "habilidad_arquero": "Hab. Arquero", "defensa": "Defensa", "tiro": "Tiro", "vision": "Visión"}
        })
        del calculated_results[current_user_id]

    return templates.TemplateResponse(request=request, name="index.html", context=context)


@app.post("/submit", response_class=HTMLResponse)
async def submit_form(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    start_time_1 = time.time()
    current_user_id = current_user.id
    form_data = await request.form()
    list_players = form_data._list

    cant_jug = sum(1 for tupla in list_players if tupla[0] == "names")

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
    try:
        existing_players = execute_with_retries(query_players, db, current_user_id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)

    existing_players_dict = {player.name: player for player in existing_players}

    players_to_add = []
    for player in player_data:
        db_player = existing_players_dict.get(player.name)
        if db_player:
            for key, value in player.model_dump().items():
                setattr(db_player, key, value)
        else:
            players_to_add.append(Player(**player.model_dump()))

    if players_to_add:
        db.add_all(players_to_add)

    db.commit()

    process_time_1 = time.time() - start_time_1
    logger.debug(f"{process_time_1:.4f} seconds to save or update players in the database")
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

    mejores_equipos, min_difference_total = find_best_combination(player_scores)

    teams = []
    for equipos in mejores_equipos:
        teams.append([[player_names[i] for i in list(equipos[0])]])
        teams.append([[player_names[i] for i in list(equipos[1])]])

    process_time_2 = time.time() - start_time_2
    logger.debug(f"{process_time_2:.4f} seconds to calculate the best teams")
    start_time_3 = time.time()
    
    # Calculate the total and average skills for each team
    try:
        players = execute_with_retries(query_players, db, current_user_id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)
    
    player_data_dict = {player.name: player for player in players}
    
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
        "teams": teams,
        "min_difference_total": str(min_difference_total)
    }

    process_time_3 = time.time() - start_time_3
    logger.debug(f"{process_time_3:.4f} seconds to calculate the total skills of each team and return the results")
    return RedirectResponse(url="/", status_code=303)


@app.get("/reset")
async def reset_session(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user_id = current_user.id

    def delete_players():
        db.query(Player).filter(Player.user_id == current_user_id).delete()
        db.commit()

    try:
        execute_write_with_retries(delete_players)
    except OperationalError:
        return {"error": "Error al acceder a la base de datos. Inténtalo de nuevo más tarde."}
    
    return {"ok": True}


@app.get("/player/{player_id}")
def get_player(player_id: int, db: Session = Depends(get_db)):
    try:
        player = execute_with_retries(query_player, db, player_id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)

    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return player


@app.put("/player/{player_id}")
def update_player(player_id: int, player: PlayerCreate, db: Session = Depends(get_db)):
    try:
        db_player = execute_with_retries(query_player, db, player_id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)
    
    if db_player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    for key, value in player.model_dump().items():
        setattr(db_player, key, value)
    
    def update_and_commit():
        db.commit()
        db.refresh(db_player)

    try:
        execute_write_with_retries(update_and_commit)
    except OperationalError:
        return HTMLResponse("Error al realizar la actualización. Inténtalo de nuevo más tarde.", status_code=500)

    return db_player


@app.delete("/player/{player_id}")
def delete_player(player_id: int, db: Session = Depends(get_db)):
    try:
        player = execute_with_retries(query_player, db, player_id)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)
    
    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    
    def delete_player():
        db.delete(player)
        db.commit()

    try:
        execute_write_with_retries(delete_player)
    except OperationalError:
        return HTMLResponse("Error al eliminar el jugador. Inténtalo de nuevo más tarde.", status_code=500)

    return {"ok": True}

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/login", status_code=307)