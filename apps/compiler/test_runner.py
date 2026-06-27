import pytest
from fastapi.testclient import TestClient
from runner import app
from security import check_security

client = TestClient(app)

def test_ast_checker_clean_code():
    code = "x = 5\nprint(x)"
    assert check_security(code) is None

def test_ast_checker_banned_import():
    code = "import os\nos.system('ls')"
    error = check_security(code)
    assert error is not None
    assert "restricted" in error

def test_ast_checker_eval_restricted():
    code = "eval('2+2')"
    error = check_security(code)
    assert error is not None
    assert "eval" in error

def test_compiler_run_success():
    req = {
        "code": "print('Hello PyPocket!')",
        "input_data": ""
    }
    response = client.post("/execute", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Hello PyPocket!" in data["output"]

def test_compiler_run_timeout():
    req = {
        "code": "import time\nwhile True:\n    pass",
        "input_data": ""
    }
    response = client.post("/execute", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "timeout"
    assert "Timeout" in data["error"]
