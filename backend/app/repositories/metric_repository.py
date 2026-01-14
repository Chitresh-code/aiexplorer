from sqlalchemy.orm import Session
from app.models.domain import Metric

class MetricRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_usecase_id(self, usecase_id: int):
        return self.db.query(Metric).filter(Metric.UseCasesID == usecase_id).all()

    def create(self, metric_data: dict):
        db_metric = Metric(**metric_data)
        self.db.add(db_metric)
        self.db.commit()
        self.db.refresh(db_metric)
        return db_metric
