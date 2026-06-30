# DevBoard Prototype

A full-stack project management tool with Kanban board.

## 🔗 Live Demo
**[devboard-rust.vercel.app](https://devboard-rust.vercel.app)**

## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | FastAPI, SQLAlchemy, SQLite |
| Auth | JWT + bcrypt password hashing |
| Deployment | Vercel (frontend) |

## ✨ Features
- User registration and login with JWT authentication
- Create and manage projects
- Kanban board with To Do / In Progress / Done columns
- JWT protected REST API with 15+ endpoints
- Password hashing with bcrypt

## 📁 Project Structure
```
devboard/
├── backend/          # FastAPI backend
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── schemas.py
│   └── routers/
│       ├── auth.py
│       ├── projects.py
│       └── tasks.py
└── frontend/         # React frontend
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   └── Kanban.jsx
        └── api.js
```

## 🚀 Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
API runs at `http://127.0.0.1:8000`  
Swagger docs at `http://127.0.0.1:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`
````
