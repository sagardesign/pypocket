import httpx
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database.connection import get_db
from app.database.models import User, CompilerSession
from app.auth.auth import get_current_user
from app.schemas.schemas import CompilerRunRequest, CompilerRunResponse
from app.config import settings

router = APIRouter(prefix="/compiler", tags=["Compiler Execution"])

@router.post("/run", response_model=CompilerRunResponse)
async def run_code(
    run_req: CompilerRunRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_time = time.time()
    
    # Forward the request to the secure sandbox execution service
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.COMPILER_SERVICE_URL}/execute",
                json={
                    "code": run_req.code,
                    "input_data": run_req.input_data
                },
                timeout=10.0 # 10 second max timeout for compiler service request
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Sandbox executor returned an error")
                
            res_data = response.json()
            output = res_data.get("output", "")
            error = res_data.get("error", "")
            status_val = res_data.get("status", "success")
            
    except httpx.RequestError as exc:
        # If compiler service is down, fallback to local subprocess execution as safe mode or return error
        # In a real environment, the compiler sandbox must be running. Let's return a service unavailable description
        output = ""
        error = f"Compiler Service Connection Failed: {str(exc)}"
        status_val = "error"
        
    execution_time = round(time.time() - start_time, 4)
    
    # Save the session to database
    session = CompilerSession(
        user_id=current_user.id if current_user else None,
        code=run_req.code,
        output=output or error,
        status=status_val
    )
    db.add(session)
    db.commit()
    
    return {
        "output": output,
        "error": error,
        "status": status_val,
        "execution_time": execution_time
    }
