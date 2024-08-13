import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, User, Player
from app.main import app, get_db
from app.auth import get_current_user
from app.team_optimizer import find_best_combination

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

def test_get_home():
    client = TestClient(app, cookies=None)
    response = client.get("/")
    assert response.status_code == 200
    assert response.template.name == "login.html"

    # Authenticate the user
    response = client.post("/signup", data={"username": "testuser1", "password": "Testpassword1*"}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/"

def test_create_user(db_session):
    user = User(username="testuser")
    user.set_password("testpassword")
    db_session.add(user)
    db_session.commit()

    db_user = db_session.query(User).filter(User.username == "testuser").first()
    assert db_user is not None
    assert db_user.username == "testuser"
    assert db_user.verify_password("testpassword")

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

def test_get_current_user(db_session):
    user = User(username="testuser3")
    user.set_password("testpassword")
    db_session.add(user)
    db_session.commit()

    class MockRequest:
        def __init__(self):
            self.session = {"user_id": user.id}

    request = MockRequest()
    current_user = get_current_user(request, db_session)
    assert current_user is not None
    assert current_user.username == "testuser3"

def test_get_signup():
    response = client.get("/signup")
    assert response.status_code == 200
    assert response.template.name == "signup.html"

def test_get_login():
    response = client.get("/login")
    assert response.status_code == 200
    assert response.template.name == "login.html"

def test_post_signup(db_session):
    username = "newuser1"
    password = "Newpassword1*"
    response = client.post("/signup", data={"username": username, "password": password}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/"

    db_user = db_session.query(User).filter(User.username == username).first()
    assert db_user is not None
    assert db_user.verify_password(password)

    # Test that the user cannot be created again
    response = client.post("/signup", data={"username": username, "password": password}, follow_redirects=False)
    assert response.status_code == 200
    assert response.template.name == "signup.html"
    assert "Usuario ya registrado" in response.text

def test_post_login(db_session):
    # Empty the database
    db_session.query(User).delete()
    db_session.commit()

    user = User(username="loginuser")
    user.set_password("loginpassword")
    db_session.add(user)
    db_session.commit()

    response = client.post("/login", data={"username": "loginuser", "password": "loginpassword"}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/"

    # Test that the user cannot login with wrong password
    response = client.post("/login", data={"username": "loginuser", "password": "wrongpassword"}, follow_redirects=False)
    assert response.status_code == 200
    assert response.template.name == "login.html"
    assert "Usuario o contraseña incorrectos" in response.text

    # Test that the user cannot login with wrong username
    response = client.post("/login", data={"username": "wronguser", "password": "loginpassword"}, follow_redirects=False)
    assert response.status_code == 200
    assert response.template.name == "login.html"
    assert "Usuario o contraseña incorrectos" in response.text

def test_logout():
    response = client.get("/logout", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/login"

def test_find_best_combination():
    scores = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [3, 3, 3, 3, 3, 3, 3, 3, 3],
        [4, 4, 4, 4, 4, 4, 4, 4, 4]
    ]
    best_teams, min_difference_total = find_best_combination(scores)
    
    assert len(best_teams) == 1
    assert min_difference_total == 0

    # Check if the teams are balanced
    team1, team2 = best_teams[0]
    assert len(team1) == len(team2)

def test_reset():
    response = client.post("/login", data={"username": "loginuser", "password": "loginpassword"}, follow_redirects=False)
    response = client.get("/reset", follow_redirects=False)
    assert response.status_code == 200
    assert response.json() == {"ok": True}

# Pending tests:
# Test Submit Form
#    - Authenticate a user
#    - Make a POST request to "/submit" with player data
#    - Assert the response status code is 200
#    - Assert the response template shows calculated teams