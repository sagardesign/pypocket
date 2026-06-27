from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.database.connection import get_db
from app.database.models import Profile, User
from app.schemas.schemas import LeaderboardEntry

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db), limit: int = 50):
    # Fetch profiles sorted by XP descending
    profiles = db.query(Profile).order_by(desc(Profile.xp)).limit(limit).all()
    
    entries = []
    for index, p in enumerate(profiles):
        entries.append({
            "username": p.username or f"User_{p.user_id[:6]}",
            "avatar_url": p.avatar_url,
            "xp": p.xp,
            "level": p.level,
            "rank": index + 1
        })
    return entries
