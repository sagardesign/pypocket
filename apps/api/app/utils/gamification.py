from datetime import datetime, date
from sqlalchemy.orm import Session
from app.database.models import User, Profile, DailyStreak, XPHistory, Badge, UserBadge, Notification

def add_xp(db: Session, user_id: str, xp_amount: int, source: str) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        return None
    
    # Save to history
    xp_log = XPHistory(user_id=user_id, xp_amount=xp_amount, source=source)
    db.add(xp_log)
    
    # Update XP
    profile.xp += xp_amount
    
    # Calculate Level: level = (xp // 200) + 1
    new_level = (profile.xp // 200) + 1
    if new_level > profile.level:
        level_diff = new_level - profile.level
        profile.level = new_level
        profile.coins += level_diff * 10  # Reward 10 coins per level up
        
        # Send level up notification
        notification = Notification(
            user_id=user_id,
            message=f"🎉 Congratulations! You reached Level {new_level}!",
            type="level_up"
        )
        db.add(notification)
        
    db.commit()
    db.refresh(profile)
    
    # Check and award badges
    check_and_award_badges(db, user_id)
    
    return profile

def add_coins(db: Session, user_id: str, amount: int) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if profile:
        profile.coins += amount
        db.commit()
        db.refresh(profile)
    return profile

def update_streak(db: Session, user_id: str) -> DailyStreak:
    streak = db.query(DailyStreak).filter(DailyStreak.user_id == user_id).first()
    if not streak:
        streak = DailyStreak(user_id=user_id, streak_count=0)
        db.add(streak)
        db.commit()
        db.refresh(streak)
        
    today = date.today()
    if streak.last_active_date:
        last_date = streak.last_active_date.date()
        diff = (today - last_date).days
        
        if diff == 1:
            streak.streak_count += 1
            # Award streak completion coins/XP
            add_xp(db, user_id, 10, "daily_streak")
            add_coins(db, user_id, 2)
        elif diff > 1:
            if not streak.frozen:
                streak.streak_count = 1
            else:
                streak.frozen = False # Consume freeze shield
        # diff == 0: already active today, do nothing
    else:
        streak.streak_count = 1
        add_xp(db, user_id, 10, "first_day_streak")
        add_coins(db, user_id, 2)
        
    streak.last_active_date = datetime.utcnow()
    db.commit()
    db.refresh(streak)
    return streak

def check_and_award_badges(db: Session, user_id: str):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    streak = db.query(DailyStreak).filter(DailyStreak.user_id == user_id).first()
    if not profile or not streak:
        return
        
    badges = db.query(Badge).all()
    earned_badge_ids = {ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()}
    
    for badge in badges:
        if badge.id in earned_badge_ids:
            continue
            
        criteria = badge.criteria
        should_earn = False
        
        if criteria.get("type") == "streak" and streak.streak_count >= criteria.get("count", 999):
            should_earn = True
        elif criteria.get("type") == "xp" and profile.xp >= criteria.get("count", 99999):
            should_earn = True
        elif criteria.get("type") == "level" and profile.level >= criteria.get("count", 999):
            should_earn = True
            
        if should_earn:
            user_badge = UserBadge(user_id=user_id, badge_id=badge.id)
            db.add(user_badge)
            
            notification = Notification(
                user_id=user_id,
                message=f"🏆 Unlocked Badge: {badge.title}! Check your profile.",
                type="badge"
            )
            db.add(notification)
            
    db.commit()
class User:
    pass
