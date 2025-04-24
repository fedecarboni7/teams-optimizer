import pytest
from app.db.models import User

# Test the signup endpoints
def test_get_signup(client):
    response = client.get("/signup")
    assert response.status_code == 200
    assert response.template.name == "signup.html"

def test_post_signup(client, db):
    username = "newuser1"
    password = "Newpassword1*"
    response = client.post("/signup", data={"username": username, "password": password}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/home"

    db_user = db.query(User).filter(User.username == username).first()
    assert db_user is not None
    assert db_user.verify_password(password)

    # Test that the user cannot be created again
    response = client.post("/signup", data={"username": username, "password": password}, follow_redirects=False)
    assert response.status_code == 409
    assert response.context["error"] == "Usuario ya registrado"


# Test the login endpoints
def test_get_login(client):
    response = client.get("/logout", follow_redirects=False)
    
    response = client.get("/login")
    assert response.status_code == 200
    assert response.template.name == "login.html"

def test_post_login(client, db):
    # Create a unique user for this test
    username = "logintest_user"
    password = "Testpassword1*"
    
    # First check if the user already exists and delete it
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    
    # Create user
    user = User(username=username)
    user.set_password(password)
    db.add(user)
    db.commit()

    response = client.post("/login", data={"username": username, "password": password}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/home"

    # Test that the user cannot login with wrong password
    response = client.post("/login", data={"username": username, "password": "wrongpassword"}, follow_redirects=False)
    assert response.status_code == 401
    assert response.template.name == "login.html"
    assert "Usuario o contraseña incorrectos" in response.text

    # Test that the user cannot login with wrong username
    response = client.post("/login", data={"username": "wronguser", "password": password}, follow_redirects=False)
    assert response.status_code == 401
    assert response.template.name == "login.html"
    assert "Usuario o contraseña incorrectos" in response.text


# Test the logout endpoint
def test_logout(client):
    response = client.get("/logout", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/login"


# Test the token endpoint
@pytest.fixture
def token_user(db):
    # Create a unique user for token tests
    username = "tokenuser"
    password = "Tokenpassword1*"
    
    # Check if user exists
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username)
        user.set_password(password)
        db.add(user)
        db.commit()
    
    return {"username": username, "password": password}

def test_create_token(client, token_user):
    response = client.post("/token", 
                          data={"username": token_user["username"], 
                                "password": token_user["password"]}, 
                          follow_redirects=False)
    assert response.status_code == 200
    assert response.json()["access_token"]
    assert response.json()["token_type"] == "bearer"

def test_token_with_wrong_password(client, token_user):
    response = client.post("/token", 
                          data={"username": token_user["username"], 
                                "password": "wrongpassword"}, 
                          follow_redirects=False)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_token_with_wrong_username(client, token_user):
    response = client.post("/token", 
                          data={"username": "wronguser", 
                                "password": token_user["password"]}, 
                          follow_redirects=False)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_token_with_empty_credentials(client):
    response = client.post("/token", follow_redirects=False)
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Field required"
    assert response.json()["detail"][1]["msg"] == "Field required"

def test_token_with_empty_username(client):
    response = client.post("/token", data={"password": "tokenpassword"}, follow_redirects=False)
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Field required"

def test_token_with_empty_password(client):
    response = client.post("/token", data={"username": "tokenuser"}, follow_redirects=False)
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Field required"
