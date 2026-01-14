from sqlalchemy.orm import Session
from app.repositories.metric_repository import MetricRepository
from app.repositories.usecase_repository import UseCaseRepository
from app.schemas.domain import MetricCreate

class MetricService:
    def __init__(self, db: Session):
        self.repository = MetricRepository(db)
        self.usecase_repository = UseCaseRepository(db)

    def get_metrics(self, usecase_id: int):
        return self.repository.get_by_usecase_id(usecase_id)

    def create_metric(self, metric: MetricCreate):
        # Verify use case exists
        usecase = self.usecase_repository.get_by_id(metric.UseCasesID)
        if not usecase:
            return None
        return self.repository.create(metric.model_dump())
