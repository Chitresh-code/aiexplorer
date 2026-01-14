from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.domain import UpdateResponse, UpdateCreate
from app.services.update_service import UpdateService

router = APIRouter()

@router.get("/{usecases_id}", response_model=list[UpdateResponse])
async def get_updates(usecases_id: int, db: Session = Depends(get_db)):
    """Get all updates for a use case"""
    service = UpdateService(db)
    return service.get_updates(usecases_id)


@router.post("", response_model=UpdateResponse)
async def create_update(update: UpdateCreate, db: Session = Depends(get_db)):
    """Create a new update"""
    service = UpdateService(db)
    db_update = service.create_update(update)
    if not db_update:
        raise HTTPException(status_code=404, detail="Use case not found")
    return db_update
