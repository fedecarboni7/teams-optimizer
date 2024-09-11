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


def test_get_docs_unauthenticated_user(client):
    response = client.get("/docs")
    assert response.status_code == 401
    assert response.json() == {"detail": "Usuario no autenticado", "error": 401}

def test_get_docs_unauthorized_user(client):
    # Log in as a regular user
    response = client.post("/login", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    # Create a regular user if it doesn't exist
    if response.status_code != 302:
        client.post("signup", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    
    response = client.get("/docs")
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized: /docs", "error": 401}

def test_get_docs_authorized(client):
    # Log in as an admin user
    response = client.post("/login", data={"username": "admin", "password": "Adminpassword123"}, follow_redirects=False)
    # Create an admin user if it doesn't exist
    if response.status_code != 302:
        client.post("signup", data={"username": "admin", "password": "Adminpassword123"}, follow_redirects=False)
    
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger-ui" in response.text


# Test the /openapi.json endpoint

def test_get_openapi_unauthenticated_user(client):
    client.get("/logout")
    response = client.get("/openapi.json")
    assert response.status_code == 401
    assert response.json() == {"detail": "Usuario no autenticado", "error": 401}

def test_get_openapi_unauthorized_user(client):
    # Log in as a regular user
    response = client.post("/login", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    # Create a regular user if it doesn't exist
    if response.status_code != 302:
        client.post("signup", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    
    response = client.get("/openapi.json")
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized: /openapi.json", "error": 401}

def test_get_openapi_authorized(client):
    # Log in as an admin user
    response = client.post("/login", data={"username": "admin", "password": "Adminpassword123"}, follow_redirects=False)
    # Create an admin user if it doesn't exist
    if response.status_code != 302:
        client.post("signup", data={"username": "admin", "password": "Adminpassword123"}, follow_redirects=False)
    
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert "openapi" in response.json()
