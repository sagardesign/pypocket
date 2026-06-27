import ast

BANNED_IMPORTS = {
    'os', 'sys', 'subprocess', 'socket', 'shutil', 'pty', 'platform', 
    'urllib', 'requests', 'httpx', 'ftplib', 'smtplib', 'telnetlib'
}

def check_security(code: str) -> str | None:
    """
    Statically analyzes code to detect dangerous calls.
    Allows basic file operations (open) but blocks external systems and shells.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return f"Syntax Error: {e}"
        
    for node in ast.walk(tree):
        # Block system level imports
        if isinstance(node, ast.Import):
            for name in node.names:
                base_module = name.name.split('.')[0]
                if base_module in BANNED_IMPORTS:
                    return f"Security Exception: Importing module '{base_module}' is restricted."
                    
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                base_module = node.module.split('.')[0]
                if base_module in BANNED_IMPORTS:
                    return f"Security Exception: Importing from module '{base_module}' is restricted."
                    
        # Check function calls
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                # We block exec and eval for safety, but allow open for "File Handling" lessons
                if node.func.id in ('eval', 'exec', '__import__'):
                    return f"Security Exception: Builtin function '{node.func.id}' is restricted."
                
                # Check file open paths statically if arguments are provided
                if node.func.id == 'open' and len(node.args) > 0:
                    first_arg = node.args[0]
                    if isinstance(first_arg, ast.Constant) and isinstance(first_arg.value, str):
                        filename = first_arg.value
                        if any(restricted in filename for restricted in ('..', '/', '\\', ':')):
                            return "Security Exception: Directory traversal or absolute paths in file access is restricted."
            
            elif isinstance(node.func, ast.Attribute):
                # Block subprocess systems
                if node.func.attr in ('system', 'popen', 'spawn', 'kill', 'terminate'):
                    return f"Security Exception: Execution attribute '{node.func.attr}' is restricted."
                    
    return None
