from sqlalchemy.orm import Session
from app.models.domain import Updates

class UpdateRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_usecase_id(self, usecase_id: int):
        from sqlalchemy import desc
        return self.db.query(Updates).filter(Updates.UseCasesID == usecase_id).order_by(desc(Updates.Id)).all()

    def create(self, update_data: dict):
        db_update = Updates(**update_data)
        self.db.add(db_update)
        self.db.commit()
        self.db.refresh(db_update)
        return db_update
