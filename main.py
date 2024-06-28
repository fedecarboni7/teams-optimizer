from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from itertools import combinations
from typing import List
from fastapi.requests import Request
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI()

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(SessionMiddleware, secret_key="!secret")

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
async def get_form(request: Request):
    teams = request.session.get("teams")
    min_difference = request.session.get("min_difference")
    min_difference_total = request.session.get("min_difference")

    return templates.TemplateResponse("index.html", {
        "request": request,
        "teams": teams,
        "len_teams": len(teams) if teams else 0,
        "min_difference": min_difference,
        "min_difference_total": min_difference_total
    })

@app.post("/submit", response_class=HTMLResponse)
async def submit_form(
    request: Request,
    names: List[str] = Form(...),
    velocidad: List[int] = Form(...),
    resistencia: List[int] = Form(...),
    control: List[int] = Form(...),
    pases: List[int] = Form(...),
    tiro: List[int] = Form(...),
    defensa: List[int] = Form(...),
    habilidad_arquero: List[int] = Form(...),
    fuerza_cuerpo: List[int] = Form(...),
    vision: List[int] = Form(...)
):
    player_names = names
    player_scores = list(zip(velocidad, resistencia, control, pases, tiro, defensa, habilidad_arquero, fuerza_cuerpo, vision))

    mejores_equipos, min_difference, min_difference_total = find_best_combination(player_scores)

    teams = list()
    for equipos in mejores_equipos:
        teams.append([player_names[i] for i in list(equipos[0])])
        teams.append([player_names[i] for i in list(equipos[1])])

    request.session["teams"] = teams
    request.session["min_difference"] = min_difference
    request.session["min_difference_total"] = min_difference_total

    return RedirectResponse("/", status_code=303)

@app.get("/reset")
async def reset_session(request: Request):
    request.session.clear()
    return RedirectResponse("/")