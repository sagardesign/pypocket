import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database.connection import engine, Base
from app.routes import auth, profile, courses, leaderboard, compiler
from app.utils.seed import seed_database

# Create DB Tables on Startup
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="PyPocket API",
    description="Full Stack Gamified Python Learning Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Rate limiting / Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Connect Routers
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(compiler.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to PyPocket API! Fully operational.", "docs": "/docs"}
