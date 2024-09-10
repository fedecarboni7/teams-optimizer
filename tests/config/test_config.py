import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base, get_db
from app.main import app

# Set up test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test the /docs endpoint

def test_get_docs_unauthenticated_user():
    client.get("/logout")
    response = client.get("/docs")
    assert response.status_code == 401
    assert response.json() == {"detail": "Usuario no autenticado", "error": 401}

def test_get_docs_unauthorized_user():
    # Log in as a regular user
    response = client.post("/login", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    # Create a regular user if it doesn't exist
    if response.status_code != 302:
        client.post("signup", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    
    response = client.get("/docs")
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized: /docs", "error": 401}

def test_get_docs_authorized():
    # Log in as an admin user
    response = client.post("/login", data={"username": "admin", "password": "Adminpassword123"}, follow_redirects=False)
    # Create an admin user if it doesn't exist
    if response.status_code != 302:
        client.post("signup", data={"username": "admin", "password": "Adminpassword123"}, follow_redirects=False)
    
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger-ui" in response.text


# Test the /openapi.json endpoint

def test_get_openapi_unauthenticated_user():
    client.get("/logout")
    response = client.get("/openapi.json")
    assert response.status_code == 401
    assert response.json() == {"detail": "Usuario no autenticado", "error": 401}

def test_get_openapi_unauthorized_user():
    # Log in as a regular user
    response = client.post("/login", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    # Create a regular user if it doesn't exist
    if response.status_code != 302:
        client.post("signup", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    
    response = client.get("/openapi.json")
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized: /openapi.json", "error": 401}

def test_get_openapi_authorized():
    # Log in as an admin user
    response = client.post("/login", data={"username": "admin", "password": "Adminpassword123"}, follow_redirects=False)
    # Create an admin user if it doesn't exist
    if response.status_code != 302:
        client.post("signup", data={"username": "admin", "password": "Adminpassword123"}, follow_redirects=False)
    
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert "openapi" in response.json()
