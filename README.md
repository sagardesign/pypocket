# 🐍 PyPocket

> **Learn Python anywhere. Built for mobile.**

PyPocket is a full-stack, mobile-first Python learning platform designed for students who primarily learn using smartphones. It combines the engaging progression of gamified learning, structured study notes, and an interactive Python coding environment into a single seamless experience.

Whether online or offline, students can practice Python, track their progress, and build coding skills through an intuitive learning journey.

---

# ✨ Features

## 📱 Mobile-First Design

* Responsive interface optimized for smartphones
* Thumb-friendly navigation
* Modern card-based UI
* Smooth animations and transitions
* Progressive Web App (PWA) support

---

## 🐍 Interactive Python Execution

* Instant Python execution inside the browser
* Secure cloud execution for advanced programs
* Fast feedback while learning
* Beginner-friendly coding environment

---

## 🎯 Gamified Learning

* Structured learning roadmap
* Unlockable lessons
* Experience (XP) progression
* Daily streak tracking
* Achievement badges
* Reward system

---

## 📚 Smart Learning Notes

* Clean, structured lesson pages
* Interactive code examples
* Markdown-based content
* Practice exercises
* Chapter summaries

---

## 📊 Progress Tracking

* Lesson completion tracking
* Learning analytics
* Progress indicators
* Personal achievements
* Performance insights

---

## ⚡ Progressive Web App

* Install directly on mobile devices
* Offline learning support
* Fast loading experience
* Optimized performance

---

# 📂 Project Structure

```text
pypocket/
├── apps/
│   ├── web/
│   ├── api/
│   ├── compiler/
│   └── admin/
│
├── packages/
│   └── types/
│
├── docker/
├── docs/
├── docker-compose.yml
└── package.json
```

---

# 🚀 Getting Started

Clone the repository and install the project dependencies.

```bash
git clone <repository-url>
cd pypocket
```

To start the project using Docker:

```bash
docker compose up --build
```

For local development, each application can also be started independently from its respective directory.

---

# 🧪 Running Tests

Backend

```bash
cd apps/api
pytest
```

Compiler

```bash
cd apps/compiler
pytest
```

---

# 🛠 Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Framer Motion

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Redis

### Python Execution

* Pyodide
* Secure Containerized Execution

### Additional Technologies

* Docker
* Progressive Web App (PWA)
* JWT Authentication

---

# 🎯 Vision

PyPocket aims to make Python education accessible to every student, especially those who rely on smartphones as their primary learning device. By combining interactive coding, gamified progression, and offline-first capabilities, the platform delivers a modern learning experience without compromising usability or performance.

---

# 📌 Future Plans

* AI coding assistant
* Personalized learning paths
* Multiplayer coding challenges
* Teacher dashboards
* Classroom management
* Certificates & achievements
* Community leaderboards
* Push notifications
* More programming languages

---

# 🤝 Contributing

Contributions are welcome!

# 📄 License

All Rights Reserved.

This project is provided for viewing and educational purposes only. No part of this project may be copied, modified, or redistributed without prior written permission.

If you'd like to improve PyPocket, feel free to fork the repository, create a feature branch, and submit a pull request.

---

# 📄 License

This project is licensed under the **MIT License**.
