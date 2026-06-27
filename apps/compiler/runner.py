import os
import sys
import uuid
import subprocess
import tempfile
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from security import check_security

app = FastAPI(title="PyPocket Secure Compiler Executor")

class CodeExecutionRequest(BaseModel):
    code: str
    input_data: Optional[str] = ""

class CodeExecutionResponse(BaseModel):
    output: str
    error: str
    status: str

@app.post("/execute", response_model=CodeExecutionResponse)
def execute_code(req: CodeExecutionRequest):
    # 1. AST Security Analysis
    security_error = check_security(req.code)
    if security_error:
        return {
            "output": "",
            "error": security_error,
            "status": "security_violation"
        }
        
    # 2. Write to Temporary File
    temp_dir = tempfile.gettempdir()
    file_name = f"sandbox_{uuid.uuid4().hex}.py"
    file_path = os.path.join(temp_dir, file_name)
    
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(req.code)
            
        # 3. Subprocess execution with timeout
        # Using current python execution pathway
        result = subprocess.run(
            [sys.executable, file_path],
            input=req.input_data,
            capture_output=True,
            text=True,
            timeout=3.0, # 3 seconds limit
            cwd=temp_dir # Set cwd to temp directory
        )
        
        stdout = result.stdout
        stderr = result.stderr
        status_val = "success" if result.returncode == 0 else "error"
        
    except subprocess.TimeoutExpired:
        stdout = ""
        stderr = "Execution Timeout: Code took longer than 3 seconds to complete."
        status_val = "timeout"
    except Exception as e:
        stdout = ""
        stderr = f"Execution Failure: {str(e)}"
        status_val = "error"
    finally:
        # Cleanup
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
                
    return {
        "output": stdout,
        "error": stderr,
        "status": status_val
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("runner:app", host="0.0.0.0", port=8001, reload=False)
