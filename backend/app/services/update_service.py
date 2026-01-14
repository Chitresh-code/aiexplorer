from sqlalchemy.orm import Session
from app.repositories.update_repository import UpdateRepository
from app.repositories.usecase_repository import UseCaseRepository
from app.schemas.domain import UpdateCreate

class UpdateService:
    def __init__(self, db: Session):
        self.repository = UpdateRepository(db)
        self.usecase_repository = UseCaseRepository(db)

    def get_updates(self, usecase_id: int):
        return self.repository.get_by_usecase_id(usecase_id)

    def create_update(self, update: UpdateCreate):
        # Verify use case exists
        usecase = self.usecase_repository.get_by_id(update.UseCasesID)
        if not usecase:
            return None
        return self.repository.create(update.model_dump())
