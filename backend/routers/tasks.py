from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
from typing import Optional
import models

router = APIRouter(prefix="/tasks", tags=["tasks"])

SECRET_KEY = "devboard-secret-key-change-in-production"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(models.User).filter(models.User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def log_activity(db: Session, project_id: int, action: str, task_title: str):
    activity = models.Activity(action=action, task_title=task_title, project_id=project_id)
    db.add(activity)
    db.commit()

def get_owned_project(project_id: int, db: Session, current_user: models.User):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/{project_id}/tasks")
def create_task(project_id: int, title: str, description: str = "", due_date: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    get_owned_project(project_id, db, current_user)
    parsed_due = datetime.fromisoformat(due_date) if due_date else None
    task = models.Task(title=title, description=description, status="todo", due_date=parsed_due, project_id=project_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    log_activity(db, project_id, "created", title)
    return task

@router.get("/{project_id}/tasks")
def get_tasks(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = get_owned_project(project_id, db, current_user)
    return project.tasks

@router.put("/{project_id}/tasks/{task_id}")
def update_task(project_id: int, task_id: int, title: str, status: str, description: str = "", due_date: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    get_owned_project(project_id, db, current_user)
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    status_changed = task.status != status
    task.title = title
    task.description = description
    task.status = status
    if due_date is not None:
        task.due_date = datetime.fromisoformat(due_date) if due_date else None
    db.commit()
    db.refresh(task)

    if status_changed:
        log_activity(db, project_id, f"moved to {status}", title)
    return task

@router.delete("/{project_id}/tasks/{task_id}")
def delete_task(project_id: int, task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    get_owned_project(project_id, db, current_user)
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    log_activity(db, project_id, "deleted", task.title)
    return {"message": "Task deleted"}