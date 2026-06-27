from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.database.models import User, Profile, LessonProgress, Project, ProjectSubmission, UserBadge, Badge, DailyStreak
from app.auth.auth import get_current_user
from app.schemas.schemas import ProfileResponse, ProfileUpdate, DashboardStats
from app.utils.gamification import update_streak

router = APIRouter(prefix="/profile", tags=["Profiles & Dashboards"])

@router.get("/me", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update daily streak whenever they request profile
    update_streak(db, current_user.id)
    
    return profile

@router.put("/me", response_model=ProfileResponse)
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/stats", response_model=DashboardStats)
def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    streak = db.query(DailyStreak).filter(DailyStreak.user_id == current_user.id).first()
    
    completed_lessons = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.completed == True
    ).count()
    
    # Fetch all badges
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    achievements = []
    for ub in user_badges:
        badge = db.query(Badge).filter(Badge.id == ub.badge_id).first()
        if badge:
            achievements.append({
                "title": badge.title,
                "description": badge.description,
                "icon_url": badge.icon_url,
                "earned_at": ub.earned_at.isoformat()
            })
            
    # Fetch upcoming projects (that have not been submitted)
    submitted_project_ids = [sub.project_id for sub in db.query(ProjectSubmission).filter(
        ProjectSubmission.user_id == current_user.id
    ).all()]
    
    upcoming_projects = []
    projects = db.query(Project).order_by(Project.order).all()
    for p in projects:
        if p.id not in submitted_project_ids:
            upcoming_projects.append({
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "requirements": p.requirements
            })
            
    # Mock some recent activity/learning logs
    recent_activity = [
        {
            "type": "lesson",
            "message": f"Completed {completed_lessons} lessons",
            "timestamp": datetime.utcnow().isoformat() if completed_lessons > 0 else None
        }
    ] if completed_lessons > 0 else []

    return {
        "streak": streak.streak_count if streak else 0,
        "xp": profile.xp if profile else 0,
        "level": profile.level if profile else 1,
        "coins": profile.coins if profile else 0,
        "completed_lessons": completed_lessons,
        "time_spent_minutes": completed_lessons * 12, # Estimated 12 mins per lesson
        "recent_activity": recent_activity,
        "upcoming_projects": upcoming_projects[:2], # Show top 2 projects
        "achievements": achievements
    }

from datetime import datetime
from app.schemas.schemas import ChangePasswordRequest
from app.auth.auth import verify_password, get_password_hash

@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.hashed_password:
        if not verify_password(req.old_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect old password")
            
    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.post("/reset-progress")
def reset_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(LessonProgress).filter(LessonProgress.user_id == current_user.id).delete()
    db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).delete()
    db.query(ProjectSubmission).filter(ProjectSubmission.user_id == current_user.id).delete()
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        profile.xp = 0
        profile.level = 1
        profile.coins = 0
        
    streak = db.query(DailyStreak).filter(DailyStreak.user_id == current_user.id).first()
    if streak:
        streak.streak_count = 0
        streak.last_active_date = None
        
    db.commit()
    return {"message": "All learning progress and metrics have been reset."}

