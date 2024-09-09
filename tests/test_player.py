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

def test_reset(db_session):
    # Test that the user cannot access the reset endpoint without being authenticated
    response = client.get("/reset", follow_redirects=False)
    assert response.status_code == 401
    assert response.text == "No hay un usuario autenticado"

    # Empty the database
    db_session.query(User).delete()
    db_session.commit()

    # Create user
    user = User(username="loginuser")
    user.set_password("loginpassword")
    db_session.add(user)
    db_session.commit()

    # Authenticate the user
    response = client.post("/login", data={"username": "loginuser", "password": "loginpassword"}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/"

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

    # Test that the user can access the reset endpoint after being authenticated
    response = client.get("/reset", follow_redirects=False)
    assert response.status_code == 200
    assert response.text == "Jugadores eliminados correctamente"

    # Test that the player has been deleted
    db_player = db_session.query(Player).filter(Player.name == "Test Reset").first()
    assert db_player is None

def test_create_player(db_session):
    # Delete all players from the database
    db_session.query(Player).delete()
    db_session.commit()
    
    user = User(username="testuser2")
    user.set_password("testpassword")
    db_session.add(user)
    db_session.commit()

    player = Player(
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
        user_id=user.id
    )
    db_session.add(player)
    db_session.commit()

    db_player = db_session.query(Player).filter(Player.name == "Test Player").first()
    assert db_player is not None
    assert db_player.name == "Test Player"
    assert db_player.velocidad == 4
    assert db_player.user_id == user.id

