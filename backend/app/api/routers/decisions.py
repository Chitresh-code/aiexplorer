from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.domain import DecisionResponse, DecisionCreate
from app.services.decision_service import DecisionService

router = APIRouter()

@router.get("/{usecases_id}", response_model=list[DecisionResponse])
async def get_decisions(usecases_id: int, db: Session = Depends(get_db)):
    """Get all decisions for a use case"""
    service = DecisionService(db)
    return service.get_decisions(usecases_id)


@router.post("", response_model=DecisionResponse)
async def create_decision(decision: DecisionCreate, db: Session = Depends(get_db)):
    """Create a new decision"""
    service = DecisionService(db)
    db_decision = service.create_decision(decision)
    if not db_decision:
        raise HTTPException(status_code=404, detail="Use case not found")
    return db_decision
