import pytest

from fastapi.testclient import TestClient

from app.main import app
from app.db.database import get_db
from app.db.models import User
from app.utils.auth import get_current_user
from app.utils.team_optimizer import find_best_combination
from tests.conftest import TestingSessionLocal

client = TestClient(app)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture
def db_session():
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())
    yield db
    db.close()

def test_get_home():
    client = TestClient(app, cookies=None)
    response = client.get("/")
    assert response.status_code == 200
    assert response.template.name == "landing-page.html"

    # Authenticate the user
    response = client.post("/signup", data={"username": "testuser1", "password": "Testpassword1*"}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/"

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
