from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
import models

router = APIRouter(prefix="/activity", tags=["activity"])

SECRET_KEY = "devboard-secret-key-change-in-production"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user = db.query(models.User).filter(models.User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_owned_project_ids(db: Session, current_user: models.User):
    return [p.id for p in db.query(models.Project).filter(models.Project.owner_id == current_user.id).all()]

@router.get("/")
def get_recent_activity(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project_ids = get_owned_project_ids(db, current_user)
    activities = db.query(models.Activity).filter(
        models.Activity.project_id.in_(project_ids)
    ).order_by(models.Activity.created_at.desc()).limit(50).all()
    return activities

@router.get("/heatmap")
def get_activity_heatmap(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project_ids = get_owned_project_ids(db, current_user)
    one_year_ago = datetime.utcnow() - timedelta(days=365)

    rows = db.query(
        func.date(models.Activity.created_at).label("day"),
        func.count(models.Activity.id).label("count")
    ).filter(
        models.Activity.project_id.in_(project_ids),
        models.Activity.created_at >= one_year_ago
    ).group_by(func.date(models.Activity.created_at)).all()

    total = sum(r.count for r in rows)
    return {
        "days": [{"date": str(r.day), "count": r.count} for r in rows],
        "total": total
    }