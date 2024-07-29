import os
from typing import Dict
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

#app = FastAPI()
app = FastAPI(docs_url=None, redoc_url=None)

secret_key = os.getenv("SECRET_KEY")

app.add_middleware(SessionMiddleware, secret_key=secret_key)
app.mount("/static", StaticFiles(directory="static"), name="static")


templates = Jinja2Templates(directory="templates")

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code in [404, 405]:  # Not Found y Method Not Allowed
        return RedirectResponse(url="/")
    if exc.status_code == 302:
        return RedirectResponse(url=exc.headers["Location"], status_code=302)
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


@app.get("/", response_class=HTMLResponse)
async def get_form(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        return RedirectResponse("/login", status_code=302)
    
    user_id = current_user.id
    players = db.query(Player).filter(Player.user_id == user_id).all()

    # Calcular el puntaje total de cada jugador
    for player in players:
        player.total_score = (
            player.velocidad + player.resistencia + player.control + player.pases +
            player.tiro + player.defensa + player.habilidad_arquero + player.fuerza_cuerpo + player.vision
        )

    # Verificar si hay resultados calculados para este usuario
    context = {
        "request": request,
        "players": players,
        "skills": ["velocidad", "resistencia", "control", "pases", "tiro", "defensa", "habilidad_arquero", "fuerza_cuerpo", "vision"]
    }

    if user_id in calculated_results:
        context.update(calculated_results[user_id])
        # Opcionalmente, limpiar los resultados después de mostrarlos
        del calculated_results[user_id]

    return templates.TemplateResponse(request=request, name="index.html", context=context)

calculated_results: Dict[str, dict] = {}

@app.post("/submit", response_class=HTMLResponse)
async def submit_form(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    form_data = await request.form()
    list_players = form_data._list

    cant_jug = 0
    for tupla in list_players:
        if tupla[0] == "names":
            cant_jug += 1

    player_data = []
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
            user_id=user_id
        )
        player_data.append(player)

    # Guardar o actualizar jugadores en la base de datos
    for player in player_data:
        db_player = db.query(Player).filter(Player.name == player.name, Player.user_id == user_id).first()
        if db_player:
            for key, value in player.dict().items():
                setattr(db_player, key, value)
        else:
            db_player = Player(**player.dict())
            db.add(db_player)
    db.commit()

    players = db.query(Player).filter(Player.user_id == user_id).all()

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

    # Calcular el puntaje total de cada jugador
    for player in players:
        player.total_score = (
            player.velocidad + player.resistencia + player.control + player.pases +
            player.tiro + player.defensa + player.habilidad_arquero + player.fuerza_cuerpo + player.vision
        )

    # Calcular el total de skills de cada equipo
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
            player_data = db.query(Player).filter(Player.name == player).first()
            for key, value in team_skills.items():
                team_skills[key]["total"] += getattr(player_data, key)
                team_skills[key]["avg"] = str(round(team_skills[key]["total"] / len(team[0]), 2)).replace(".", ",")

        team.append([team_skills,
                     sum([team_skills[key]["total"] for key in team_skills]),
                     str(round(sum([team_skills[key]["total"] / len(team[0]) for key in team_skills]), 2)).replace(".", ",")])

    calculated_results[user_id] = {
        "players": players,
        "teams": teams,
        "len_teams": len(teams),
        "min_difference": str(min_difference),
        "min_difference_total": str(min_difference_total)
    }

    # Redirigir a la página principal
    return RedirectResponse(url="/", status_code=303)


@app.get("/reset")
async def reset_session(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    db.query(Player).filter(Player.user_id == user_id).delete()
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