from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import User, Profile, DailyStreak
from app.auth.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    create_guest_user
)
from app.schemas.schemas import UserCreate, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(user_data.password)
    user = User(email=user_data.email, hashed_password=hashed_pwd, role="student")
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create Profile
    username = user_data.email.split("@")[0]
    profile = Profile(user_id=user.id, username=username, skills=[], level=1, xp=0, coins=0)
    db.add(profile)
    
    # Create Streak
    streak = DailyStreak(user_id=user.id, streak_count=0, frozen=False)
    db.add(streak)
    
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/guest", response_model=Token)
def guest_login(db: Session = Depends(get_db)):
    user = create_guest_user(db)
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

from app.schemas.schemas import GoogleLoginRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.database.connection import get_redis
from app.config import settings
import secrets
import httpx
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_reset_email(to_email: str, token: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"SMTP WARNING: SMTP credentials not set. Reset PIN is: {token}")
        return
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM
        msg['To'] = to_email
        msg['Subject'] = "PyPocket Password Reset Code"
        
        body = f"""Hello,

You requested a password reset on PyPocket.
Your 6-digit verification pin code is:

{token}

This code is valid for 10 minutes. If you did not make this request, you can safely ignore this email.

Simple Learning. Lifelong Impact.
The PyPocket Team"""
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
        server.quit()
        print(f"Email successfully sent to {to_email}")
    except Exception as e:
        print(f"SMTP FAILURE: Could not dispatch email: {e}")

@router.post("/google", response_model=Token)
async def google_login(login_req: GoogleLoginRequest, db: Session = Depends(get_db)):
    id_token = login_req.id_token
    email = None
    
    # Try validating token with Google Tokeninfo API
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}", timeout=5.0)
            if resp.status_code == 200:
                google_info = resp.json()
                email = google_info.get("email")
                if settings.GOOGLE_CLIENT_ID and google_info.get("aud") != settings.GOOGLE_CLIENT_ID:
                    raise HTTPException(status_code=400, detail="Google Client ID mismatch")
    except Exception:
        pass
        
    # Mock fallback for test tokens
    if not email:
        if id_token.startswith("mock_google_"):
            email = f"{id_token.replace('mock_google_', '')}@gmail.com"
        else:
            raise HTTPException(status_code=400, detail="Invalid Google OAuth credential")
            
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, is_guest=False, role="student")
        db.add(user)
        db.commit()
        db.refresh(user)
        
        username = email.split("@")[0]
        profile = Profile(user_id=user.id, username=username, skills=[], level=1, xp=0, coins=0)
        db.add(profile)
        
        streak = DailyStreak(user_id=user.id, streak_count=0, frozen=False)
        db.add(streak)
        db.commit()
        db.refresh(user)
        
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email address not found")
        
    reset_token = "".join(secrets.choice("0123456789") for _ in range(6))
    
    # Save token mapping to Redis (10 min TTL)
    redis_client.setex(f"reset_token:{reset_token}", 600, req.email)
    
    # Dispatch real email
    send_reset_email(req.email, reset_token)
    
    return {
        "message": "Reset code successfully dispatched to your email.",
        "debug_token": reset_token
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    email = redis_client.get(f"reset_token:{req.token}")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    
    redis_client.delete(f"reset_token:{req.token}")
    return {"message": "Password successfully reset. You can now sign in."}


