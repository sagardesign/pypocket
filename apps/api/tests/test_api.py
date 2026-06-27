import pytest
from fastapi.testclient import TestClient
from main import app
from app.database.connection import Base, engine, SessionLocal
from app.database.models import User, Profile, DailyStreak

# Setup test client database session
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    # Clean database optionally or keep it simple

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "PyPocket API" in response.json()["message"]

def test_guest_login():
    response = client.post("/api/auth/guest")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_get_courses():
    response = client.get("/api/courses")
    assert response.status_code == 200
    courses = response.json()
    assert len(courses) > 0
    assert courses[0]["slug"] == "python-basics"
