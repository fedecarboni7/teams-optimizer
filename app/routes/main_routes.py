import time
from typing import Dict, List

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlite3 import OperationalError
from requests import Session

from app.config.config import templates
from app.config.logging_config import logger
from app.db.database import get_db
from app.db.database_utils import execute_with_retries, query_players
from app.db.models import Player, User
from app.db.schemas import PlayerCreate
from app.utils.auth import get_current_user
from app.utils.team_optimizer import find_best_combination


router = APIRouter()

@router.get("/landing-page", response_class=HTMLResponse)
async def landing_page(request: Request):
    return templates.TemplateResponse("landing-page.html", {"request": request})

calculated_results: Dict[str, dict] = {}

@router.get("/", response_class=HTMLResponse)
async def get_form(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        request.session.clear()
        return RedirectResponse("/landing-page", status_code=302)
    
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


@router.post("/submit", response_class=HTMLResponse)
async def submit_form(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        request.session.clear()
        return RedirectResponse("/landing-page", status_code=302)

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

    player_data_dict = {
        player.name: {
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

    calculated_results[current_user_id] = {
        "teams": teams,
        "min_difference_total": str(min_difference_total),
        "playerDataDict": player_data_dict
    }

    process_time_3 = time.time() - start_time_3
    logger.debug(f"{process_time_3:.4f} seconds to calculate the total skills of each team and return the results")
    return RedirectResponse(url="/", status_code=303)