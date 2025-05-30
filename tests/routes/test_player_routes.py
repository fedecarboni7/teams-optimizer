from app.db.models import Player

# Test the reset endpoint

def test_reset_unauthenticated(client):
    # Test that the user cannot access the reset endpoint without being authenticated
    response = client.get("/reset", follow_redirects=False)
    assert response.status_code == 401
    assert response.text == "No hay un usuario autenticado"

def test_create_player(authenticated_client, db):
    # Create a player
    response = authenticated_client.post("/player", json={
        "name": "Test Reset",
        "velocidad": 4,
        "resistencia": 5,
        "control": 5,
        "pases": 3,
        "tiro": 3,
        "defensa": 2,
        "habilidad_arquero": 3,
        "fuerza_cuerpo": 5,
        "vision": 1
    })

    assert response.status_code == 200
    db_player = db.query(Player).filter(Player.name == "Test Reset").first()
    assert db_player is not None
    assert db_player.name == "Test Reset"
    assert db_player.velocidad == 4

def test_player_deleted_after_reset(authenticated_client, db):
    # Reset players
    authenticated_client.get("/reset", follow_redirects=False)

    # Test that the player has been deleted
    db_player = db.query(Player).filter(Player.name == "Test Reset").first()
    assert db_player is None


# Test the get player endpoint

def test_get_player_unauthenticated(client):
    # Test that the user cannot access the get player endpoint without being authenticated
    response = client.get("/player/1", follow_redirects=False)
    assert response.status_code == 401
    assert response.text == "No hay un usuario autenticado"

def test_get_nonexistent_player(authenticated_client):
    # Try to get a player that does not exist
    response = authenticated_client.get("/player/999", follow_redirects=False)
    assert response.status_code == 404
    assert response.text == "Player not found"

def test_get_player(authenticated_client):    
    # Create a player
    response = authenticated_client.post("/player", json={
        "name": "Test Get",
        "velocidad": 4,
        "resistencia": 5,
        "control": 5,
        "pases": 3,
        "tiro": 3,
        "defensa": 2,
        "habilidad_arquero": 3,
        "fuerza_cuerpo": 5,
        "vision": 1
    })
    player_data = response.json()

    # Get the player
    response = authenticated_client.get(f"/player/{player_data['id']}", follow_redirects=False)
    assert response.status_code == 200
    assert response.json()["name"] == "Test Get"
    assert response.json()["velocidad"] == 4
