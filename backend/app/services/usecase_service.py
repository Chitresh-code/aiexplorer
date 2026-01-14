from sqlalchemy.orm import Session
from app.repositories.usecase_repository import UseCaseRepository
from app.schemas.domain import UseCaseCreate, UseCaseUpdate, StakeholderCreate, PlanCreate
from datetime import datetime, timedelta

class UseCaseService:
    def __init__(self, db: Session):
        self.repository = UseCaseRepository(db)

    def get_usecases(self, skip: int = 0, limit: int = 10, status: str = None, phase: str = None, business_unit: str = None):
        return self.repository.get_all(skip, limit, status, phase, business_unit)

    def get_usecase(self, usecase_id: int):
        return self.repository.get_by_id(usecase_id)

    def create_usecase(self, usecase: UseCaseCreate):
        return self.repository.create(usecase.model_dump())

    def update_usecase(self, usecase_id: int, usecase_update: UseCaseUpdate):
        update_data = usecase_update.model_dump(exclude_unset=True)
        return self.repository.update(usecase_id, update_data)

    def delete_usecase(self, usecase_id: int):
        return self.repository.delete(usecase_id)

    def get_previous_week_count(self):
        today = datetime.now()
        one_week_ago = today - timedelta(days=7)
        count = self.repository.get_count_in_range(one_week_ago, today)
        return {"count": count, "period": "Last 7 days"}

    def get_implemented_count(self):
        count = self.repository.get_count_by_status("Implemented")
        return {"count": count}

    def get_submission_timeline(self):
        timeline = self.repository.get_submission_timeline()
        return {"timeline": timeline}

    def get_recent_usecases(self, limit: int = 4):
        return self.repository.get_recent(limit)

    def create_stakeholder(self, stakeholder: StakeholderCreate):
        return self.repository.create_stakeholder(stakeholder.model_dump())

    def create_plan(self, plan: PlanCreate):
        return self.repository.create_plan(plan.model_dump())
