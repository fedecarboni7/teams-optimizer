from typing import List

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from sqlite3 import OperationalError
from requests import Session

from app.config.config import templates
from app.db.database import get_db
from app.db.database_utils import execute_with_retries, query_club_members, query_club_players, query_clubs, query_players
from app.db.models import Player, User
from app.db.schemas import PlayerCreate
from app.utils.ai_formations import create_formations
from app.utils.auth import get_current_user
from app.utils.team_optimizer import find_best_combination


router = APIRouter()

@router.get("/landing-page", response_class=HTMLResponse, include_in_schema=False)
async def landing_page(request: Request):
    return templates.TemplateResponse(request=request, name="landing-page.html")


@router.get("/", response_class=HTMLResponse, include_in_schema=False)
async def get_form(
        request: Request,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        club_id: int = None
    ):
    if not current_user:
        request.session.clear()
        return RedirectResponse("/landing-page", status_code=302)
    
    current_user_id = current_user.id
    clubs = execute_with_retries(query_clubs, db, current_user_id)
    clubs_ids = [club.id for club in clubs]
    current_club_role = []
    
    try:
        if not club_id:
            players = execute_with_retries(query_players, db, current_user_id)
        elif club_id in clubs_ids:
            players = execute_with_retries(query_club_players, db, club_id)
            # Obtener los miembros del club actual y sus roles
            club_members = execute_with_retries(query_club_members, db, club_id)
            # Convertir a diccionario para el template
            club_members = [
                {
                    "userId": member.User.id,
                    "userName": member.User.username,
                    "clubRole": member.ClubUser.role
                }
                for member in club_members
            ]
            # Obtener el rol del usuario actual en este club
            current_club_role = next(
                (member["clubRole"] for member in club_members if member["userId"] == current_user_id),
                None
            )
        else:
            return RedirectResponse("/", status_code=302)
    except OperationalError:
        return HTMLResponse("Error al acceder a la base de datos. Inténtalo de nuevo más tarde.", status_code=500)

    context = {
        "players": players,
        "userClubs": clubs,
        "clubId": club_id,
        "currentUser": {
            "userId": current_user_id,
            "userName": current_user.username,
            "clubRole": current_club_role if club_id else "member"
        },
        "clubMembers": club_members if club_id else []
    }

    return templates.TemplateResponse(request=request, name="index.html", context=context)


@router.post("/submit", response_class=HTMLResponse, include_in_schema=False)
async def submit_form(
        request: Request,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
    if not current_user:
        request.session.clear()
        return RedirectResponse("/landing-page", status_code=302)

    current_user_id = current_user.id
    form_data = await request.form()
    list_players = form_data._list
    club_id: int = form_data.get("club_id")
    list_players = [tupla for tupla in list_players if tupla is not None and tupla[0] != "club_id"]

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
            vision=int(list_players[i+10][1])
        )
        player_data.append(player)

    # Guardar o actualizar jugadores en la base de datos
    try:
        if club_id:
            existing_players = execute_with_retries(query_club_players, db, club_id)
        else:
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
            if club_id:
                players_to_add.append(Player(**player.model_dump(), club_id=club_id))
            else:
                players_to_add.append(Player(**player.model_dump(), user_id=current_user_id))

    if players_to_add:
        db.add_all(players_to_add)

    db.commit()

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
    
    # Calculate the total and average skills for each team
    try:
        if club_id:
            players = execute_with_retries(query_club_players, db, club_id)
        else:
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

    player_data_dict = {
        player.name: {
            "id": player.id,
            "velocidad": player.velocidad,
            "resistencia": player.resistencia,
            "control": player.control,
            "pases": player.pases,
            "fuerza_cuerpo": player.fuerza_cuerpo,
            "habilidad_arquero": player.habilidad_arquero,
            "defensa": player.defensa,
            "tiro": player.tiro,
            "vision": player.vision
        }
        for _, player in player_data_dict.items()
    }

    # Renderizar solo el bloque de HTML que contiene los equipos
    rendered_html = templates.get_template("results.html").render(
        teams=teams,
        skills={"velocidad": "Velocidad", "resistencia": "Resistencia", "control": "Control", "pases": "Pases", "fuerza_cuerpo": "Fuerza cuerpo", "habilidad_arquero": "Hab. Arquero", "defensa": "Defensa", "tiro": "Tiro", "vision": "Visión"},
        min_difference_total=min_difference_total,
        len_teams=len(teams)
    )

    return JSONResponse(content={"html": rendered_html, "player_data_dict": player_data_dict, "teams": teams})

@router.post("/formations", include_in_schema=False, response_class=JSONResponse)
async def show_formations(
        request: Request,
        current_user: User = Depends(get_current_user)
    ):
    if not current_user:
        request.session.clear()
        return RedirectResponse("/landing-page", status_code=302)
    
    # Recibir los datos del frontend
    data = await request.json()
    
    # Extraer los valores del diccionario JSON recibido
    player_data_dict = data.get('player_data_dict')
    teams = data.get('teams')
    
    # Generar las formaciones
    formations = await create_formations(player_data_dict, teams)

    # Retornar las formaciones como respuesta JSON
    return JSONResponse(content=formations)