from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import redis
from app.config import settings

# Determine DB engine with SQLite fallback
db_url = settings.DATABASE_URL
try:
    # Test connection
    if db_url.startswith("postgresql"):
        temp_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
        # Try a quick connection check
        conn = temp_engine.connect()
        conn.close()
        engine = temp_engine
        print("Database Connection: Successfully connected to PostgreSQL database.")
    else:
        engine = create_engine(db_url)
except Exception:
    print("Database Warning: PostgreSQL not accessible. Falling back to local SQLite database (pypocket.db)")
    engine = create_engine("sqlite:///pypocket.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis Mock Fallback class for local dev runs
class RedisMock:
    def __init__(self):
        self.store = {}
    def setex(self, key, ttl, value):
        self.store[key] = value
    def get(self, key):
        val = self.store.get(key)
        # return bytes/strings standard compatibility
        return str(val) if val is not None else None
    def delete(self, key):
        if key in self.store:
            del self.store[key]
    def ping(self):
        return True

try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
    redis_client.ping()
    print("Redis Connection: Successfully connected to Redis server.")
except Exception:
    print("Redis Warning: Redis server not accessible. Falling back to local memory store.")
    redis_client = RedisMock()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_redis():
    return redis_client

