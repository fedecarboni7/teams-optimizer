import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base, get_db
from app.main import app
from app.db.models import User

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


# Test the signup endpoints

def test_get_signup():
    response = client.get("/signup")
    assert response.status_code == 200
    assert response.template.name == "signup.html"

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


# Test the login endpoints

def test_get_login():
    response = client.get("/logout", follow_redirects=False)
    
    response = client.get("/login")
    assert response.status_code == 200
    assert response.template.name == "login.html"

def test_post_login(db_session):
    # Empty the database
    db_session.query(User).delete()
    db_session.commit()

    # Create user
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


# Test the logout endpoint

def test_logout():
    response = client.get("/logout", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/login"


# Test the token endpoint

def test_token(db_session):
    # Empty the database
    db_session.query(User).delete()
    db_session.commit()

    user = User(username="tokenuser")
    user.set_password("tokenpassword")
    db_session.add(user)
    db_session.commit()

    response = client.post("/token", data={"username": "tokenuser", "password": "tokenpassword"}, follow_redirects=False)
    assert response.status_code == 200
    assert response.json()["access_token"]
    assert response.json()["token_type"] == "bearer"

    # Test that the user cannot login with wrong password
    response = client.post("/token", data={"username": "tokenuser", "password": "wrongpassword"}, follow_redirects=False)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"
    
    # Test that the user cannot login with wrong username
    response = client.post("/token", data={"username": "wronguser", "password": "tokenpassword"}, follow_redirects=False)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"
    
    # Test that the user cannot login with empty credentials
    response = client.post("/token", data={"username": "", "password": ""}, follow_redirects=False)
    assert response.status_code == 422
    # response.json()["detail"] == [{'type': 'missing', 'loc': ['body', 'username'], 'msg': 'Field required', 'input': None}, {'type': 'missing', 'loc': ['body', 'password'], 'msg': 'Field required', 'input': None}]
    assert response.json()["detail"][0]["msg"] == "Field required"
    assert response.json()["detail"][1]["msg"] == "Field required"
    
    # Test that the user cannot login with empty username
    response = client.post("/token", data={"username": "", "password": "tokenpassword"}, follow_redirects=False)
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Field required"
    
    # Test that the user cannot login with empty password
    response = client.post("/token", data={"username": "tokenuser", "password": ""}, follow_redirects=False)
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Field required"