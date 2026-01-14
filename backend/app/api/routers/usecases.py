from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.domain import UseCaseResponse, UseCaseCreate, UseCaseUpdate, StakeholderCreate, StakeholderResponse, PlanCreate, PlanResponse
from app.services.usecase_service import UseCaseService

router = APIRouter()

@router.get("", response_model=list[UseCaseResponse])
async def get_usecases(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: str = Query(None),
    phase: str = Query(None),
    business_unit: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get all use cases with optional filtering"""
    service = UseCaseService(db)
    return service.get_usecases(skip, limit, status, phase, business_unit)


@router.get("/{usecase_id}", response_model=UseCaseResponse)
async def get_usecase(usecase_id: int, db: Session = Depends(get_db)):
    """Get a specific use case"""
    service = UseCaseService(db)
    usecase = service.get_usecase(usecase_id)
    if not usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    return usecase


@router.post("", response_model=UseCaseResponse)
async def create_usecase(usecase: UseCaseCreate, db: Session = Depends(get_db)):
    """Create a new use case"""
    service = UseCaseService(db)
    return service.create_usecase(usecase)


@router.put("/{usecase_id}", response_model=UseCaseResponse)
async def update_usecase(
    usecase_id: int,
    usecase_update: UseCaseUpdate,
    db: Session = Depends(get_db)
):
    """Update a use case"""
    service = UseCaseService(db)
    db_usecase = service.update_usecase(usecase_id, usecase_update)
    if not db_usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    return db_usecase


@router.delete("/{usecase_id}")
async def delete_usecase(usecase_id: int, db: Session = Depends(get_db)):
    """Delete a use case"""
    service = UseCaseService(db)
    success = service.delete_usecase(usecase_id)
    if not success:
        raise HTTPException(status_code=404, detail="Use case not found")
    return {"message": "Use case deleted successfully"}


@router.get("/kpi/previous-week")
async def get_previous_week_usecases(db: Session = Depends(get_db)):
    """Get total use cases submitted in the previous week"""
    service = UseCaseService(db)
    return service.get_previous_week_count()


@router.get("/kpi/implemented")
async def get_implemented_usecases(db: Session = Depends(get_db)):
    """Get total implemented use cases"""
    service = UseCaseService(db)
    return service.get_implemented_count()


@router.get("/timeline/submissions")
async def get_submission_timeline(db: Session = Depends(get_db)):
    """Get use case submission timeline data for the last 6 months"""
    service = UseCaseService(db)
    return service.get_submission_timeline()


@router.get("/recent")
async def get_recent_usecases(
    limit: int = Query(4, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Get recently added use cases"""
    service = UseCaseService(db)
    return service.get_recent_usecases(limit)


@router.post("/{usecase_id}/stakeholders", response_model=StakeholderResponse)
async def create_stakeholder(
    usecase_id: int,
    stakeholder: StakeholderCreate,
    db: Session = Depends(get_db)
):
    """Create a new stakeholder for a use case"""
    service = UseCaseService(db)
    # Verify use case exists
    usecase = service.get_usecase(usecase_id)
    if not usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    # Ensure the ID matches
    if stakeholder.UseCasesID != usecase_id:
        raise HTTPException(status_code=400, detail="Use case ID mismatch")
        
    return service.create_stakeholder(stakeholder)


@router.post("/{usecase_id}/plan", response_model=PlanResponse)
async def create_plan(
    usecase_id: int,
    plan: PlanCreate,
    db: Session = Depends(get_db)
):
    """Create a new plan (dates) for a use case"""
    service = UseCaseService(db)
    # Verify use case exists
    usecase = service.get_usecase(usecase_id)
    if not usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    # Ensure the ID matches
    if plan.UseCasesID != usecase_id:
        raise HTTPException(status_code=400, detail="Use case ID mismatch")
        
    return service.create_plan(plan)
