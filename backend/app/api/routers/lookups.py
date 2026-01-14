from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.lookup_service import LookupService

router = APIRouter()

@router.get("/status-mappings")
async def get_status_mappings(db: Session = Depends(get_db)):
    """Get all status mappings"""
    service = LookupService(db)
    return service.get_status_mappings()


@router.get("/business-units")
async def get_business_units(db: Session = Depends(get_db)):
    """Get all business unit mappings"""
    service = LookupService(db)
    return service.get_business_units()


@router.get("/ai-themes")
async def get_ai_themes(db: Session = Depends(get_db)):
    """Get all AI theme mappings"""
    service = LookupService(db)
    return service.get_ai_themes()


@router.get("/personas")
async def get_personas(db: Session = Depends(get_db)):
    """Get all persona mappings"""
    service = LookupService(db)
    return service.get_personas()


@router.get("/vendors")
async def get_vendors(db: Session = Depends(get_db)):
    """Get all vendor/model mappings"""
    service = LookupService(db)
    return service.get_vendors()


@router.get("/aimodels")
async def get_ai_models_hierarchy(db: Session = Depends(get_db)):
    """Get AI models organized by vendor hierarchy"""
    service = LookupService(db)
    return service.get_ai_models_hierarchy()


@router.get("/business-structure")
async def get_business_structure_hierarchy(db: Session = Depends(get_db)):
    """Get business structure organized by business unit → team → subteam hierarchy"""
    service = LookupService(db)
    return service.get_business_structure_hierarchy()


@router.get("/roles")
async def get_roles_hierarchy(db: Session = Depends(get_db)):
    """Get all roles"""
    service = LookupService(db)
    return service.get_roles_hierarchy()


@router.get("/dropdown-data")
async def get_dropdown_data(db: Session = Depends(get_db)):
    """Get all simple dropdown data in one call"""
    service = LookupService(db)
    return service.get_dropdown_data()


@router.get("/business-units/stakeholder/{business_unit}")
async def get_champions_for_business_unit(business_unit: str, db: Session = Depends(get_db)):
    """Get AI Champions for a specific business unit"""
    service = LookupService(db)
    return service.get_champions_for_business_unit(business_unit)


@router.get("/champions")
async def get_all_champion_names(db: Session = Depends(get_db)):
    """Get all unique AI Champion names for stakeholder dropdown"""
    service = LookupService(db)
    return service.get_all_champion_names()
