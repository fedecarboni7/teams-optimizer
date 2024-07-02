from fastapi import FastAPI, Form, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from starlette.middleware.sessions import SessionMiddleware

from sqlalchemy.orm import Session

from auth import get_current_user
from database import User, get_db, Player
from schemas import PlayerCreate
from team_optimizer import find_best_combination

#app = FastAPI()
app = FastAPI(docs_url=None, redoc_url=None)

app.add_middleware(SessionMiddleware, secret_key="!my_super_secret_key")
app.mount("/static", StaticFiles(directory="static"), name="static")


templates = Jinja2Templates(directory="templates")


@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    if request.session.get("user_id"):
        return RedirectResponse(url="/", status_code=302)
    return templates.TemplateResponse("signup.html", {"request": request})


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
        return templates.TemplateResponse("signup.html", {"request": request, "error": "Usuario ya registrado"})

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
    return templates.TemplateResponse("login.html", {"request": request})


@app.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    # Placeholder for user authentication logic
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.verify_password(password):
        return templates.TemplateResponse("login.html", {"request": request, "error": "Usuario o contraseña incorrectas"})

    # Set user_id in session after successful authentication
    request.session["user_id"] = user.id
    return RedirectResponse(url="/", status_code=302)


@app.get("/", response_class=HTMLResponse)
async def get_form(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if not user:
        return RedirectResponse("/login", status_code=302)
    user_id = request.session.get("user_id")
    players = db.query(Player).where(Player.user_id == user_id).all()
    return templates.TemplateResponse(
        "index.html", {"request": request, "players": players}
    )


@app.post("/submit", response_class=HTMLResponse)
async def submit_form(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()
    cant_jug = int(len(form_data._list) / 10)

    player_data = []
    
    for i in range(cant_jug):
        i = i * 10
        player = PlayerCreate(
            name=form_data._list[i][1],
            velocidad=int(form_data._list[i+1][1]),
            resistencia=int(form_data._list[i+2][1]),
            control=int(form_data._list[i+3][1]),
            pases=int(form_data._list[i+4][1]),
            tiro=int(form_data._list[i+5][1]),
            defensa=int(form_data._list[i+6][1]),
            habilidad_arquero=int(form_data._list[i+7][1]),
            fuerza_cuerpo=int(form_data._list[i+8][1]),
            vision=int(form_data._list[i+9][1]),
            user_id=request.session.get("user_id"),
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
        for p in players
    ]

    mejores_equipos, min_difference, min_difference_total = find_best_combination(
        player_scores
    )

    teams = []
    for equipos in mejores_equipos:
        teams.append([player_names[i] for i in list(equipos[0])])
        teams.append([player_names[i] for i in list(equipos[1])])

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "players": players,
            "teams": teams,
            "len_teams": len(teams),
            "min_difference": str(min_difference),
            "min_difference_total": str(min_difference_total),
        },
    )


@app.get("/reset")
async def reset_session(db: Session = Depends(get_db)):
    db.query(Player).delete()
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
    return RedirectResponse("/login")