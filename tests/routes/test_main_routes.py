from app.db.models import User
from app.utils.auth import get_current_user
from app.utils.team_optimizer import find_best_combination

def test_get_home(client):
    # First test without authentication
    response = client.get("/home")
    assert response.status_code == 200
    assert response.template.name == "landing-page.html"

    # Then test with authentication
    response = client.post("/signup", data={"username": "hometestuser", "password": "Testpassword1*"}, follow_redirects=False)
    if response.status_code == 409:  # If user already exists, login
        response = client.post("/login", data={"username": "hometestuser", "password": "Testpassword1*"}, follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "/home"

def test_get_current_user(client, db):
    # Create a unique user for this test
    user = User(username="testuser3")
    user.set_password("testpassword")
    db.add(user)
    db.commit()

    class MockRequest:
        def __init__(self):
            self.session = {"user_id": user.id}

    request = MockRequest()
    current_user = get_current_user(request, db)
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
