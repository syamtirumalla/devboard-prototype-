from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
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

@router.post("/{project_id}/tasks")
def create_task(project_id: int, title: str, description: str = "", db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    task = models.Task(
        title=title,
        description=description,
        status="todo",
        project_id=project_id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/{project_id}/tasks")
def get_tasks(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.tasks

@router.put("/{project_id}/tasks/{task_id}")
def update_task(project_id: int, task_id: int, title: str, status: str, description: str = "", db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.project_id == project_id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.title = title
    task.description = description
    task.status = status
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{project_id}/tasks/{task_id}")
def delete_task(project_id: int, task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.project_id == project_id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}