import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base, get_db
from app.main import app
from app.db.models import Player, User

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

# Test the reset endpoint

def test_reset_unauthenticated():
    # Test that the user cannot access the reset endpoint without being authenticated
    response = client.get("/reset", follow_redirects=False)
    assert response.status_code == 401
    assert response.text == "No hay un usuario autenticado"

def test_create_and_authenticate_user(db_session):
    # Empty the database
    db_session.query(User).delete()
    db_session.commit()

    # Authenticate the user
    response = client.post("/signup", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/"

def test_create_player(db_session):
    # Authenticate the user
    client.post("/login", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)

    # Create a player
    response = client.post("/player", json={
        "name": "Test Reset",
        "velocidad": 4,
        "resistencia": 5,
        "control": 5,
        "pases": 3,
        "tiro": 3,
        "defensa": 2,
        "habilidad_arquero": 3,
        "fuerza_cuerpo": 5,
        "vision": 1,
        "user_id": 1
    })

    assert response.status_code == 200
    db_player = db_session.query(Player).filter(Player.name == "Test Reset").first()
    assert db_player is not None
    assert db_player.name == "Test Reset"
    assert db_player.velocidad == 4

def test_player_deleted_after_reset(db_session):
    # Authenticate the user
    client.post("/login", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)

    # Reset players
    client.get("/reset", follow_redirects=False)

    # Test that the player has been deleted
    db_player = db_session.query(Player).filter(Player.name == "Test Reset").first()
    assert db_player is None


# Test the get player endpoint

def test_get_player_unauthenticated():
    # Test that the user cannot access the get player endpoint without being authenticated
    response = client.get("/player/1", follow_redirects=False)
    assert response.status_code == 401
    assert response.text == "No hay un usuario autenticado"

def test_get_nonexistent_player(db_session):
    # Authenticate the user
    client.post("/login", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)

    # Try to get a player that does not exist
    response = client.get("/player/999", follow_redirects=False)
    assert response.status_code == 307
    assert response.json() == {"detail": "Player not found"}

def test_get_player(db_session):
    # Authenticate the user
    client.post("/login", data={"username": "loginuser", "password": "Loginpassword123"}, follow_redirects=False)

    # Create a player
    new_player = Player(
        name="Test Player",
        velocidad=4,
        resistencia=5,
        control=5,
        pases=3,
        tiro=3,
        defensa=2,
        habilidad_arquero=3,
        fuerza_cuerpo=5,
        vision=1,
        user_id=1
    )
    db_session.add(new_player)
    db_session.commit()

    # Get the player
    response = client.get(f"/player/{new_player.id}", follow_redirects=False)
    assert response.status_code == 200
    player_data = response.json()
    assert player_data["name"] == "Test Player"
    assert player_data["velocidad"] == 4
    assert player_data["resistencia"] == 5

