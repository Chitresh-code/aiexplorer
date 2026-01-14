from sqlalchemy.orm import Session
from app.repositories.decision_repository import DecisionRepository
from app.repositories.usecase_repository import UseCaseRepository
from app.schemas.domain import DecisionCreate

class DecisionService:
    def __init__(self, db: Session):
        self.repository = DecisionRepository(db)
        self.usecase_repository = UseCaseRepository(db)

    def get_decisions(self, usecase_id: int):
        return self.repository.get_by_usecase_id(usecase_id)

    def create_decision(self, decision: DecisionCreate):
        # Verify use case exists
        usecase = self.usecase_repository.get_by_id(decision.UseCasesID)
        if not usecase:
            return None
        return self.repository.create(decision.model_dump())
