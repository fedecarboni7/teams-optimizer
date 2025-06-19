import pytest
from unittest.mock import Mock, patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.db.database import Base, get_db
from app.main import app
from app.db.models import User

# SQLite in-memory database configuration
@pytest.fixture(scope="session")
def engine():
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    return engine

@pytest.fixture(scope="session")
def TestingSessionLocal(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db(engine, TestingSessionLocal):
    connection = engine.connect()
    transaction = connection.begin()
    
    session = TestingSessionLocal(bind=connection)
    
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # Mock EmailService to always return True for email sending
    # This prevents tests from failing in CI/CD environments where email services are not available
    with patch('app.utils.email_service.EmailService') as mock_email_service:
        mock_instance = Mock()
        # Mock all email sending methods to return success
        mock_instance.send_password_reset_email.return_value = True
        mock_instance.send_email_confirmation.return_value = True
        mock_email_service.return_value = mock_instance
        
        app.dependency_overrides[get_db] = override_get_db
        with TestClient(app) as client:
            yield client
        app.dependency_overrides.clear()

@pytest.fixture
def authenticated_client(client, db):
    test_user = db.query(User).filter(User.username == "testuser").first()
    if not test_user:
        test_user = User(username="testuser", email="testuser@example.com", email_confirmed=1)
        test_user.set_password("testpassword")
        db.add(test_user)
        db.commit()
    
    response = client.post(
        "/login", 
        data={"username": "testuser", "password": "testpassword"}, 
        follow_redirects=False
    )
    assert response.status_code == 302
    return client