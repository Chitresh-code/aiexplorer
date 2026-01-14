from sqlalchemy.orm import Session
from app.models.domain import (
    StatusMapping, BusinessUnitMapping, AIThemeMapping, 
    PersonaMapping, VendorModelMapping, RoleMapping, AIChampions
)

class LookupRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_status_mappings(self):
        return self.db.query(StatusMapping).all()

    def get_business_units(self):
        return self.db.query(BusinessUnitMapping).all()

    def get_ai_themes(self):
        return self.db.query(AIThemeMapping).all()

    def get_personas(self):
        return self.db.query(PersonaMapping).all()

    def get_vendors(self):
        return self.db.query(VendorModelMapping).all()

    def get_roles(self):
        return self.db.query(RoleMapping.RoleName).distinct().all()

    def get_unique_themes(self):
        return self.db.query(AIThemeMapping.ThemeName).distinct().all()

    def get_unique_personas(self):
        return self.db.query(PersonaMapping.PersonaName).distinct().all()

    def get_unique_roles(self):
        return self.db.query(RoleMapping.RoleName).distinct().all()

    def get_champions_by_bu(self, business_unit: str):
        return self.db.query(AIChampions).filter(AIChampions.BusinessUnit == business_unit).all()

    def get_unique_champions(self):
        return self.db.query(AIChampions.UKrewer).distinct().all()
