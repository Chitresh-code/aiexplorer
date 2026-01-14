from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.domain import UseCases, Stakeholder, Plan
from typing import List, Optional
from datetime import datetime, timedelta

class UseCaseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 10, status: str = None, phase: str = None, business_unit: str = None):
        query = self.db.query(UseCases)
        if status:
            query = query.filter(UseCases.Status == status)
        if phase:
            query = query.filter(UseCases.Phase == phase)
        if business_unit:
            query = query.filter(UseCases.BusinessUnit == business_unit)
        return query.order_by(desc(UseCases.Created)).offset(skip).limit(limit).all()

    def get_by_id(self, usecase_id: int):
        return self.db.query(UseCases).filter(UseCases.ID == usecase_id).first()

    def create(self, usecase_data: dict):
        db_usecase = UseCases(**usecase_data)
        self.db.add(db_usecase)
        self.db.commit()
        self.db.refresh(db_usecase)
        return db_usecase

    def update(self, usecase_id: int, update_data: dict):
        db_usecase = self.get_by_id(usecase_id)
        if not db_usecase:
            return None
        for key, value in update_data.items():
            setattr(db_usecase, key, value)
        self.db.commit()
        self.db.refresh(db_usecase)
        return db_usecase

    def delete(self, usecase_id: int):
        db_usecase = self.get_by_id(usecase_id)
        if not db_usecase:
            return False
        self.db.delete(db_usecase)
        self.db.commit()
        return True

    def get_count_in_range(self, start_date: datetime, end_date: datetime):
        return self.db.query(UseCases).filter(
            UseCases.Created >= start_date,
            UseCases.Created <= end_date
        ).count()

    def get_count_by_status(self, status: str):
        return self.db.query(UseCases).filter(UseCases.Status == status).count()

    def get_submission_timeline(self, days: int = 180):
        start_date = datetime.now() - timedelta(days=days)
        # Using func.strftime for SQLite compatibility or equivalent for SQL Server if needed.
        # Original code used func.strftime('%Y-%m', UseCases.Created)
        results = self.db.query(
            func.format(UseCases.Created, 'yyyy-MM').label('month'), # SQL Server format
            func.count(UseCases.ID).label('count')
        ).filter(
            UseCases.Created >= start_date
        ).group_by(
            func.format(UseCases.Created, 'yyyy-MM')
        ).order_by(
            func.format(UseCases.Created, 'yyyy-MM')
        ).all()
        return [{"month": r.month, "count": r.count} for r in results]

    def get_recent(self, limit: int = 4):
        return self.db.query(UseCases).order_by(desc(UseCases.Created)).limit(limit).all()

    def create_stakeholder(self, stakeholder_data: dict):
        db_stakeholder = Stakeholder(**stakeholder_data)
        self.db.add(db_stakeholder)
        self.db.commit()
        self.db.refresh(db_stakeholder)
        return db_stakeholder

    def create_plan(self, plan_data: dict):
        db_plan = Plan(**plan_data)
        self.db.add(db_plan)
        self.db.commit()
        self.db.refresh(db_plan)
        return db_plan

