import pytest
from fastapi.testclient import TestClient
from fastapi import Request
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from app.main import app
from app.database import Player, User
from app.database import get_db
from app.auth import get_current_user


client = TestClient(app)

# Mock para la base de datos
@pytest.fixture
def mock_db():
    return Mock(spec=Session)


# Mock para el usuario actual
@pytest.fixture
def mock_current_user():
    return User(id=1, username="testuser")


# Mock para la request
@pytest.fixture
def mock_request():
    mock = Mock(spec=Request)
    mock.session = {"user_id": 1}
    return mock


def test_get_form(mock_db, mock_current_user, mock_request):
    # Configurar el mock de la base de datos
    mock_players = [Player(id=1, name="Player 1", user_id=1), Player(id=2, name="Player 2", user_id=1)]
    mock_db.query.return_value.where.return_value.all.return_value = mock_players

    # Sobrescribir las dependencias
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: mock_current_user

    # Realizar la solicitud
    response = client.get("/")

    # Verificar el resultado
    assert response.status_code == 200
    assert "Player 1" in response.text
    assert "Player 2" in response.text

    # Limpiar las dependencias sobrescritas
    app.dependency_overrides.clear()


def test_get_form_unauthenticated(mock_db):
    # Configurar usuario no autenticado
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: None

    # Realizar la solicitud
    response = client.get("/", allow_redirects=False)

    # Verificar la redirección
    assert response.status_code == 302
    assert response.headers["location"] == "/login"

    # Limpiar las dependencias sobrescritas
    app.dependency_overrides.clear()


def test_signup_page():
    response = client.get("/signup")
    assert response.status_code == 200
    assert "signup.html" in response.text


@patch("app.templates.TemplateResponse")
def test_signup_existing_user(mock_template_response, mock_db, mock_request):
    mock_db.query.return_value.filter.return_value.first.return_value = User(username="testuser")
    
    app.dependency_overrides[get_db] = lambda: mock_db

    response = client.post("/signup", data={
        "username": "testuser",
        "password": "testpassword",
    })

    mock_template_response.assert_called_once_with(
        "signup.html", 
        {"request": mock_request, "error": "Usuario ya registrado"}
    )

    app.dependency_overrides.clear()

@patch("app.RedirectResponse")
def test_signup_new_user(mock_redirect, mock_db, mock_request):
    mock_db.query.return_value.filter.return_value.first.return_value = None
    mock_db.add = Mock()
    mock_db.commit = Mock()
    
    app.dependency_overrides[get_db] = lambda: mock_db

    response = client.post("/signup", data={
        "username": "newuser",
        "password": "newpassword",
    })

    assert mock_db.add.called
    assert mock_db.commit.called
    assert mock_request.session["user_id"] is not None
    mock_redirect.assert_called_once_with(url="/", status_code=302)

    app.dependency_overrides.clear()


def test_login_page():
    response = client.get("/login")
    assert response.status_code == 200
    assert "login.html" in response.text


def test_login():
    # Implement login tests as described in pseudocode
    pass


def test_logout():
    # Implement logout test as described in pseudocode
    pass


def test_main_page_access():
    # Implement main page access tests as described in pseudocode
    pass


def test_submit_form():
    response = client.post("/submit", data={
        "names": "Player 1",
        "selectedPlayers": 1,
        "velocidad": 1,
        "resistencia": 1,
        "control": 1,
        "pases": 1,
        "tiro": 1,
        "defensa": 1,
        "habilidad_arquero": 1,
        "fuerza_cuerpo": 1,
        "vision": 1,
    })
    assert response.status_code == 200


def test_reset_session():
    response = client.get("/reset")
    assert response.json() == {"ok": True}


def test_player_crud_operations():
    # Implement player CRUD operation tests as described in pseudocode
    pass


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
