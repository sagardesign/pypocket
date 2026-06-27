from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.connection import get_db
from app.database.models import User, Course, Chapter, Lesson, LessonProgress, Quiz, QuizAttempt, SavedCode
from app.auth.auth import get_current_user
from app.schemas.schemas import CourseResponse, LessonResponse, LessonProgressResponse, QuizAttemptCreate, QuizAttemptResponse, SavedCodeCreate, SavedCodeResponse
from app.utils.gamification import add_xp, add_coins

router = APIRouter(tags=["Courses & Lessons"])

@router.get("/courses", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).order_by(Course.order).all()
    return courses

@router.get("/courses/{slug}", response_model=CourseResponse)
def get_course(slug: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.get("/lessons/{slug}", response_model=LessonResponse)
def get_lesson(slug: str, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.slug == slug).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.post("/lessons/{lesson_id}/progress", response_model=LessonProgressResponse)
def complete_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()
    
    if not progress:
        progress = LessonProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(progress)
        
    if not progress.completed:
        progress.completed = True
        progress.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(progress)
        
        # Reward XP and Coins!
        add_xp(db, current_user.id, lesson.xp_reward, f"lesson_complete:{lesson.title}")
        add_coins(db, current_user.id, 5) # 5 coins per completed lesson
        
    return progress

@router.post("/lessons/{lesson_id}/quiz-attempt/{quiz_id}", response_model=QuizAttemptResponse)
def attempt_quiz(
    lesson_id: str,
    quiz_id: str,
    attempt_data: QuizAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.lesson_id == lesson_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found in this lesson")
        
    is_correct = (attempt_data.selected_option_index == quiz.correct_option_index)
    
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        selected_option_index=attempt_data.selected_option_index,
        is_correct=is_correct
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    if is_correct:
        # Check if first time correct to reward XP
        previous_correct = db.query(QuizAttempt).filter(
            QuizAttempt.user_id == current_user.id,
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.is_correct == True,
            QuizAttempt.id != attempt.id
        ).count()
        
        if previous_correct == 0:
            add_xp(db, current_user.id, 5, f"quiz_correct:{quiz_id}")
            add_coins(db, current_user.id, 1)
            
    return attempt

@router.post("/lessons/{lesson_id}/code", response_model=SavedCodeResponse)
def save_code(
    lesson_id: str,
    code_data: SavedCodeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_code = db.query(SavedCode).filter(
        SavedCode.user_id == current_user.id,
        SavedCode.lesson_id == lesson_id
    ).first()
    
    if not saved_code:
        saved_code = SavedCode(user_id=current_user.id, lesson_id=lesson_id, code=code_data.code)
        db.add(saved_code)
    else:
        saved_code.code = code_data.code
        
    db.commit()
    db.refresh(saved_code)
    return saved_code

@router.get("/lessons/{lesson_id}/code", response_model=SavedCodeResponse)
def get_saved_code(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_code = db.query(SavedCode).filter(
        SavedCode.user_id == current_user.id,
        SavedCode.lesson_id == lesson_id
    ).first()
    
    if not saved_code:
        # Return default starter code from lesson
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        return {
            "id": "",
            "lesson_id": lesson_id,
            "code": lesson.starter_code or "",
            "updated_at": datetime.utcnow()
        }
    return saved_code
