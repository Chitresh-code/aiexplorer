from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging
from app.core.config import settings
from app.db.session import get_db, get_connection_status, engine, SessionLocal
from app.db.base_class import Base
from app.models.domain import AIThemeMapping, PersonaMapping, VendorModelMapping, BusinessUnitMapping, RoleMapping

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import psutil for memory monitoring (optional)
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    logger.warning("psutil not available - memory monitoring disabled")

from app.api.routers import usecases, metrics, updates, decisions, lookups, kpis

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Test database connection and create tables on startup"""
    connection_status = get_connection_status()

    if connection_status["connected"]:
        logger.info("Database connected successfully")
        try:
            # Create all tables
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created/verified")

            # Import lookup data if not already present
            from app.db.init_db import setup_initial_data
            setup_initial_data()
        except Exception as e:
            logger.error(f"[ERROR] Error creating tables: {e}")
    else:
        logger.error(f"[ERROR] Database connection failed: {connection_status['message']}")
    yield

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint with detailed status"""
    connection_status = get_connection_status()
    response = {
        "status": "healthy" if connection_status["connected"] else "unhealthy",
        "database": connection_status
    }
    if PSUTIL_AVAILABLE:
        try:
            process = psutil.Process()
            memory_info = process.memory_info()
            response["memory_usage_mb"] = round(memory_info.rss / 1024 / 1024, 2)
            response["memory_percent"] = round(process.memory_percent(), 2)
        except Exception:
            pass
    return response

# Include routers
app.include_router(usecases.router, prefix="/api/usecases", tags=["Use Cases"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(updates.router, prefix="/api/updates", tags=["Updates"])
app.include_router(decisions.router, prefix="/api/decisions", tags=["Decisions"])
app.include_router(lookups.router, prefix="/api", tags=["Lookups"])
app.include_router(kpis.router, prefix="/api", tags=["KPIs"])

@app.get("/")
async def root():
    """API documentation and overview"""
    return {
        "message": "Welcome to AIHub API",
        "docs": "/docs",
        "endpoints": {
            "usecases": "/api/usecases",
            "metrics": "/api/metrics/{usecaseId}",
            "updates": "/api/updates/{usecaseId}",
            "decisions": "/api/decisions/{usecaseId}",
            "lookups": "/api/status-mappings",
            "health": "/health"
        }
    }
