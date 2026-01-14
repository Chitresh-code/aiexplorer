from fastapi import APIRouter, Depends
from sqlalchemy import func, extract
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import UseCases
from typing import List, Dict, Any

router = APIRouter()

@router.get("/kpi/dashboard")
async def get_dashboard_kpi(db: Session = Depends(get_db)):
    """Get dashboard KPI data from database"""
    try:
        # Fetch KPI data from database
        total_use_cases = db.query(func.count(UseCases.ID)).scalar()

        implemented = db.query(func.count(UseCases.ID)).filter(
            UseCases.Status == "Completed"
        ).scalar()

        # For trending, we'll count use cases created in the current month
        from datetime import datetime
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        trending = db.query(func.count(UseCases.ID)).filter(
            UseCases.Created >= current_month
        ).scalar()

        # Calculate completion rate
        completion_rate = (implemented / total_use_cases * 100) if total_use_cases > 0 else 0

        # Get timeline data - group by month and phase
        timeline_data = []
        try:
            from sqlalchemy import text
            # First, get distinct phases and statuses to debug
            distinct_phases = db.execute(text("SELECT DISTINCT Phase FROM UseCases WHERE Phase IS NOT NULL")).fetchall()
            distinct_statuses = db.execute(text("SELECT DISTINCT Status FROM UseCases WHERE Status IS NOT NULL")).fetchall()
            print(f"Available phases: {[row[0] for row in distinct_phases]}")
            print(f"Available statuses: {[row[0] for row in distinct_statuses]}")

            # Query to get daily phase counts - using actual phase values
            phase_counts = db.execute(text("""
                SELECT
                    FORMAT(Created, 'yyyy-MM-dd') as date,
                    SUM(CASE WHEN Phase = 'Idea' THEN 1 ELSE 0 END) as idea,
                    SUM(CASE WHEN Phase = 'Diagnose' THEN 1 ELSE 0 END) as diagnose,
                    SUM(CASE WHEN Phase = 'Design' THEN 1 ELSE 0 END) as design,
                    SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as implemented
                FROM UseCases
                WHERE Created IS NOT NULL
                    AND Created >= DATEADD(day, -90, GETDATE())
                GROUP BY FORMAT(Created, 'yyyy-MM-dd')
                ORDER BY date ASC
            """)).fetchall()

            timeline_data = [
                {
                    "date": row[0],
                    "idea": int(row[1] or 0),
                    "diagnose": int(row[2] or 0),
                    "design": int(row[3] or 0),
                    "implemented": int(row[4] or 0)
                }
                for row in phase_counts
            ]
            print(f"Timeline data: {timeline_data}")
        except Exception as e:
            print(f"Error fetching timeline data: {e}")
            # Fallback timeline data
            timeline_data = []

        # Get recent submissions
        recent_submissions = []
        try:
            recent_cases = db.query(UseCases).order_by(UseCases.Created.desc()).limit(10).all()
            recent_submissions = [
                {
                    "ID": str(case.ID),
                    "UseCase": case.UseCase,
                    "AITheme": case.AITheme or "",
                    "Status": case.Status or "Unknown",
                    "Created": case.Created.strftime("%m/%d/%Y %I:%M %p") if case.Created else ""
                }
                for case in recent_cases
            ]
        except Exception as e:
            print(f"Error fetching recent submissions: {e}")
            recent_submissions = []

        return {
            "kpis": {
                "totalUseCases": total_use_cases,
                "implemented": implemented,
                "trending": trending,
                "completionRate": round(completion_rate, 1)
            },
            "timeline": timeline_data,
            "recent_submissions": recent_submissions
        }
    except Exception as e:
        # Log error and return default values
        print(f"Error fetching KPI data: {e}")
        return {
            "kpis": {
                "totalUseCases": 0,
                "implemented": 0,
                "trending": 0,
                "completionRate": 0
            },
            "timeline": [],
            "recent_submissions": []
        }
