from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_guest: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class GoogleLoginRequest(BaseModel):
    id_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


# Profile Schemas
class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class ProfileResponse(BaseModel):
    id: str
    user_id: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str]
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    level: int
    xp: int
    coins: int

    class Config:
        from_attributes = True

# Course & Lesson Schemas
class QuizOption(BaseModel):
    question: str
    options: List[str]
    correct_option_index: int
    explanation: Optional[str] = None

class QuizResponse(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_option_index: int
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class QuizAttemptCreate(BaseModel):
    selected_option_index: int

class QuizAttemptResponse(BaseModel):
    id: str
    quiz_id: str
    selected_option_index: int
    is_correct: bool
    attempted_at: datetime

    class Config:
        from_attributes = True

class LessonResponse(BaseModel):
    id: str
    chapter_id: str
    title: str
    slug: str
    type: str
    order: int
    video_url: Optional[str] = None
    notes_markdown: Optional[str] = None
    interactive_slides: List[Any]
    starter_code: Optional[str] = None
    mini_challenge: Optional[str] = None
    assignment_markdown: Optional[str] = None
    hints: List[str]
    xp_reward: int
    quizzes: List[QuizResponse]

    class Config:
        from_attributes = True

class ChapterResponse(BaseModel):
    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    order: int
    lessons: List[LessonResponse]

    class Config:
        from_attributes = True

class CourseResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str] = None
    order: int
    image_url: Optional[str] = None
    chapters: List[ChapterResponse]

    class Config:
        from_attributes = True

class LessonProgressUpdate(BaseModel):
    completed: bool
    score: Optional[int] = 0
    notes: Optional[str] = None

class LessonProgressResponse(BaseModel):
    id: str
    lesson_id: str
    completed: bool
    completed_at: Optional[datetime] = None
    score: int
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Compiler & Code Save Schemas
class CompilerRunRequest(BaseModel):
    code: str
    input_data: Optional[str] = ""

class CompilerRunResponse(BaseModel):
    output: Optional[str] = ""
    error: Optional[str] = ""
    status: str  # success, error, timeout
    execution_time: float

class SavedCodeCreate(BaseModel):
    code: str

class SavedCodeResponse(BaseModel):
    id: str
    lesson_id: str
    code: str
    updated_at: datetime

    class Config:
        from_attributes = True

# Leaderboard & Streak Schemas
class LeaderboardEntry(BaseModel):
    username: str
    avatar_url: Optional[str] = None
    xp: int
    level: int
    rank: int

class StreakResponse(BaseModel):
    streak_count: int
    last_active_date: Optional[datetime] = None
    frozen: bool

# Dashboard Stats Response
class DashboardStats(BaseModel):
    streak: int
    xp: int
    level: int
    coins: int
    completed_lessons: int
    time_spent_minutes: int
    recent_activity: List[Any]
    upcoming_projects: List[Any]
    achievements: List[Any]
