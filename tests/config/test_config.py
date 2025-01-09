import pytest

from fastapi.testclient import TestClient

from app.main import app
from app.db.database import get_db

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.rollback()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()

@pytest.fixture
def unauthorized_client(client):
    # Registra e inicia sesión un usuario para la prueba
    response = client.post("/signup", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    if response.status_code == 409:
        response = client.post("/login", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/home"
    return client

@pytest.fixture
def authorized_client(client):
    # Registra e inicia sesión un usuario para la prueba
    response = client.post("/signup", data={"username": "admin", "password": "Loginpassword123"}, follow_redirects=False)
    if response.status_code == 409:
        response = client.post("/login", data={"username": "admin", "password": "Loginpassword123"}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/home"
    return client


def test_get_docs_unauthenticated_user(client):
    response = client.get("/docs")
    assert response.status_code == 401
    assert response.json() == {"detail": "Usuario no autenticado", "error": 401}

def test_get_docs_unauthorized_user(unauthorized_client):
    response = unauthorized_client.get("/docs")
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized: /docs", "error": 401}

def test_get_docs_authorized(authorized_client):
    response = authorized_client.get("/docs")
    assert response.status_code == 200
    assert "swagger-ui" in response.text


# Test the /openapi.json endpoint

def test_get_openapi_unauthenticated_user(client):
    client.get("/logout")
    response = client.get("/openapi.json")
    assert response.status_code == 401
    assert response.json() == {"detail": "Usuario no autenticado", "error": 401}

def test_get_openapi_unauthorized_user(unauthorized_client):
    response = unauthorized_client.get("/openapi.json")
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized: /openapi.json", "error": 401}

def test_get_openapi_authorized(authorized_client):
    response = authorized_client.get("/openapi.json")
    assert response.status_code == 200
    assert "openapi" in response.json()
