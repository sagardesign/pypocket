from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import Course, Chapter, Lesson, Quiz, Badge, Project

def seed_database():
    db = SessionLocal()
    try:
        # Check if databases are already seeded
        if db.query(Course).first():
            print("Database already seeded. Skipping...")
            return
            
        print("Seeding database with PyPocket courses, lessons, quizzes, badges, and projects...")
        
        # 1. Create Badges
        badges = [
            Badge(
                title="First Step",
                description="Earned your first 10 XP on PyPocket!",
                icon_url="🏆",
                criteria={"type": "xp", "count": 10}
            ),
            Badge(
                title="Streak Starter",
                description="Log in consecutive days to kick off your streak!",
                icon_url="🔥",
                criteria={"type": "streak", "count": 1}
            ),
            Badge(
                title="Python Novice",
                description="Reach Level 2 by earning 200 XP!",
                icon_url="🐍",
                criteria={"type": "level", "count": 2}
            ),
            Badge(
                title="Code Warrior",
                description="Earn 500 XP to prove your Python skills!",
                icon_url="⚔️",
                criteria={"type": "xp", "count": 500}
            )
        ]
        for b in badges:
            db.add(b)
            
        # 2. Create Projects
        projects = [
            Project(
                title="Calculator",
                description="Build a command line calculator that can add, subtract, multiply, and divide numbers based on user inputs.",
                starter_code="def calculate(num1, num2, operation):\n    # Write your logic here\n    pass\n\n# Test your calculator\nprint(calculate(10, 5, '+')) # Should print 15",
                solution_code="def calculate(num1, num2, operation):\n    if operation == '+':\n        return num1 + num2\n    elif operation == '-':\n        return num1 - num2\n    elif operation == '*':\n        return num1 * num2\n    elif operation == '/':\n        return num1 / num2 if num2 != 0 else 'Error'\n    return 'Invalid'\n\nprint(calculate(10, 5, '+'))",
                requirements=["Support +, -, *, and / operations", "Handle division by zero gracefully", "Return 'Invalid' for unsupported operators"],
                order=1
            ),
            Project(
                title="To-Do List Manager",
                description="Create a task manager that allows users to append items to a list, delete items, and display current items.",
                starter_code="todo_list = []\n\ndef add_task(task):\n    pass\n\ndef remove_task(task):\n    pass\n\ndef show_tasks():\n    pass",
                solution_code="todo_list = []\n\ndef add_task(task):\n    todo_list.append(task)\n\ndef remove_task(task):\n    if task in todo_list:\n        todo_list.remove(task)\n\ndef show_tasks():\n    return todo_list",
                requirements=["Add items to a list", "Remove items if they exist in the list", "Read list content items"],
                order=2
            ),
            Project(
                title="Password Generator",
                description="Write a random password generator using Python's random module to create robust passwords.",
                starter_code="import random\nimport string\n\ndef generate_password(length):\n    # Write logic here\n    pass",
                solution_code="import random\nimport string\n\ndef generate_password(length):\n    characters = string.ascii_letters + string.digits + string.punctuation\n    return ''.join(random.choice(characters) for _ in range(length))\n\nprint(generate_password(12))",
                requirements=["Import random and string modules", "Allow custom password length input", "Include uppercase, lowercase, numbers, and symbols"],
                order=3
            )
        ]
        for p in projects:
            db.add(p)
            
        # 3. Create Python Basics Course
        course = Course(
            title="Python Basics",
            slug="python-basics",
            description="Master the fundamental syntax, data structures, and algorithms in Python.",
            order=1,
            image_url="🐍"
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        
        # 4. Create Chapters
        c1 = Chapter(course_id=course.id, title="Variables & Data Types", description="Learn how Python stores information", order=1)
        c2 = Chapter(course_id=course.id, title="Control Flow", description="Control when and how instructions run", order=2)
        c3 = Chapter(course_id=course.id, title="Functions", description="Wrap reuseable code into functions", order=3)
        db.add(c1)
        db.add(c2)
        db.add(c3)
        db.commit()
        db.refresh(c1)
        db.refresh(c2)
        db.refresh(c3)
        
        # 5. Create Lessons
        # L1: Variables
        l1 = Lesson(
            chapter_id=c1.id,
            title="Variables",
            slug="variables",
            type="interactive",
            order=1,
            video_url="https://www.youtube.com/embed/Z1Yd7upQsXY",
            notes_markdown="""# What is a Variable?
In Python, a **variable** is like a labelled storage box. You can put values (like numbers or text) inside it, and change it anytime.

### Declaring a Variable:
In Python, you don't need to specify a type. Simply use the `=` sign:
```python
x = 5
name = "Alex"
print(x)
print(name)
```
""",
            interactive_slides=[
                {"title": "Variables are Storage Boxes", "text": "Think of variables as variables that hold data. You declare them by typing `name = value`."},
                {"title": "No strict typing", "text": "Unlike Java or C++, Python doesn't require declaring the data type beforehand."}
            ],
            starter_code="# Declare a variable named message with the value 'Hello, PyPocket!' and print it\nmessage = ''\nprint(message)",
            mini_challenge="Declare a variable `score = 10` and then add `5` to it. Print the final score.",
            assignment_markdown="Write a program to swap the values of two variables `a = 5` and `b = 10` without hardcoding the swap.",
            hints=["Use a temporary variable `temp` to store one of the values.", "Alternatively, Python supports parallel assignment: `a, b = b, a`!"],
            xp_reward=20
        )
        
        # L2: Data Types
        l2 = Lesson(
            chapter_id=c1.id,
            title="Data Types",
            slug="data-types",
            type="interactive",
            order=2,
            notes_markdown="""# Core Python Data Types
Python automatically understands what kind of value a variable stores. Here are the core data types:

1. **Integer (`int`)**: Whole numbers, e.g. `x = 10`
2. **Float (`float`)**: Decimal numbers, e.g. `pi = 3.14`
3. **String (`str`)**: Text enclosed in quotes, e.g. `greeting = "Hello"`
4. **Boolean (`bool`)**: Logical true or false: `is_active = True` or `is_active = False`
""",
            interactive_slides=[
                {"title": "Integers vs Floats", "text": "Integers are whole numbers, floats contain decimal points."},
                {"title": "Strings & Booleans", "text": "Strings hold character sequences. Booleans hold logic states."}
            ],
            starter_code="# Determine the type of the value below using type()\nx = 42.0\nprint(type(x))",
            mini_challenge="Create a string `first_name` and another string `last_name`. Join them with a space and print it.",
            assignment_markdown="Declare one integer, one float, and one string, then print their sum if possible, or concatenate them using string casting `str()`.",
            hints=["Use the `+` operator to concatenate strings.", "To cast a number to a string, use `str(number)`."],
            xp_reward=20
        )
        
        # L3: Conditionals
        l3 = Lesson(
            chapter_id=c2.id,
            title="Conditions",
            slug="conditions",
            type="interactive",
            order=1,
            notes_markdown="""# Making Decisions (if-elif-else)
Python uses conditionals to decide which blocks of code to run based on True/False comparisons.

### Syntax:
```python
age = 18
if age >= 18:
    print("You are an adult!")
else:
    print("You are a minor.")
```
""",
            interactive_slides=[
                {"title": "The 'if' clause", "text": "Evaluates a condition. Notice the colon `:` at the end and the indentation (4 spaces)."},
                {"title": "elif and else", "text": "'elif' checks another condition if the first fails. 'else' runs if everything else fails."}
            ],
            starter_code="score = 85\nif score >= 90:\n    print('A')\n# Add an elif block here for score >= 80 to print 'B'\nelse:\n    print('F')",
            mini_challenge="Write an if-else check that prints 'Even' if a variable `num` is divisible by 2, and 'Odd' otherwise.",
            assignment_markdown="Create a program checking if a user's password length is greater than or equal to 8 characters.",
            hints=["Use the modulus operator `%` to check divisibility (e.g. `num % 2 == 0`).", "Use `len(password)` to count characters in a password string."],
            xp_reward=20
        )
        
        db.add(l1)
        db.add(l2)
        db.add(l3)
        db.commit()
        db.refresh(l1)
        db.refresh(l2)
        db.refresh(l3)
        
        # 6. Create Quizzes
        q1 = Quiz(
            lesson_id=l1.id,
            question="Which character is used to assign a value to a variable in Python?",
            options=["==", "=", "->", "assign"],
            correct_option_index=1,
            explanation="The '=' operator is the assignment operator in Python. '==' is used for equality checks."
        )
        q2 = Quiz(
            lesson_id=l2.id,
            question="What is the data type of the expression: type(4.0)?",
            options=["int", "str", "float", "bool"],
            correct_option_index=2,
            explanation="Any number with a decimal point is represented as a 'float' in Python."
        )
        q3 = Quiz(
            lesson_id=l3.id,
            question="What is the correct keyword used to check multiple conditions in an if statement?",
            options=["elseif", "elif", "else if", "otherwise"],
            correct_option_index=1,
            explanation="Python uses the keyword 'elif' (short for else if) to check subsequent conditional chains."
        )
        db.add(q1)
        db.add(q2)
        db.add(q3)
        db.commit()
        
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()
