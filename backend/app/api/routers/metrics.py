from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.domain import MetricResponse, MetricCreate
from app.services.metric_service import MetricService

router = APIRouter()

@router.get("/{usecases_id}", response_model=list[MetricResponse])
async def get_metrics(usecases_id: int, db: Session = Depends(get_db)):
    """Get all metrics for a use case"""
    service = MetricService(db)
    return service.get_metrics(usecases_id)


@router.post("", response_model=MetricResponse)
async def create_metric(metric: MetricCreate, db: Session = Depends(get_db)):
    """Create a new metric"""
    service = MetricService(db)
    db_metric = service.create_metric(metric)
    if not db_metric:
        raise HTTPException(status_code=404, detail="Use case not found")
    return db_metric
