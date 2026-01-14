from sqlalchemy.orm import Session
from app.models.domain import Decisions

class DecisionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_usecase_id(self, usecase_id: int):
        return self.db.query(Decisions).filter(Decisions.UseCasesID == usecase_id).all()

    def create(self, decision_data: dict):
        db_decision = Decisions(**decision_data)
        self.db.add(db_decision)
        self.db.commit()
        self.db.refresh(db_decision)
        return db_decision
