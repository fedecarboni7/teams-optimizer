from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_form():
    response = client.get("/")
    assert response.status_code == 200


def test_submit_form():
    response = client.post("/submit", data={
        "names": ["Player 1", "Player 2", "Player 3"],
        "selectedPlayers": [1, 2, 3],
        "velocidad": [1, 2, 3],
        "resistencia": [1, 2, 3],
        "control": [1, 2, 3],
        "pases": [1, 2, 3],
        "tiro": [1, 2, 3],
        "defensa": [1, 2, 3],
        "habilidad_arquero": [1, 2, 3],
        "fuerza_cuerpo": [1, 2, 3],
        "vision": [1, 2, 3],
    })
    assert response.status_code == 200


def test_get_player():
    response = client.get("/player/1")
    assert response.status_code == 200


def test_update_player():
    response = client.put("/player/1", json={
        "name": "Updated Player",
        "velocidad": 1,
        "resistencia": 2,
        "control": 3,
        "pases": 4,
        "tiro": 5,
        "defensa": 1,
        "habilidad_arquero": 2,
        "fuerza_cuerpo": 4,
        "vision": 5,
    })
    assert response.status_code == 200


def test_delete_player():
    response = client.delete("/player/1")
    assert response.status_code == 200

def test_logout():
    response = client.get("/logout")
    assert response.status_code == 302