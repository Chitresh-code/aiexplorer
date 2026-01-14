import pyodbc
import time
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings

# Set up logging
logger = logging.getLogger(__name__)

# ==================== DATABASE CONFIGURATION ====================

# Azure SQL Server Connection Parameters
SQL_DRIVER = settings.SQL_DRIVER
SQL_SERVER = settings.SQL_SERVER
SQL_DATABASE = settings.SQL_DATABASE
SQL_USER = settings.SQL_USER
SQL_PASSWORD = settings.SQL_PASSWORD

# Check if driver exists
available_drivers = pyodbc.drivers()
logger.info(f"Available ODBC Drivers: {available_drivers}")

# Try to use the specified driver
driver_found = False
for driver in available_drivers:
    if "ODBC Driver 18" in driver or "ODBC Driver 17" in driver:
        SQL_DRIVER = driver
        driver_found = True
        logger.info(f"Using driver: {driver}")
        break

if not driver_found:
    logger.warning(f"ODBC Driver 18/17 not found. Available: {available_drivers}")
    # Fallback to first available driver
    if available_drivers:
        SQL_DRIVER = available_drivers[0]
    else:
        raise Exception("No ODBC drivers found! Please install ODBC Driver 18 for SQL Server")

# Build Azure SQL Server connection string using pyodbc format first
odbc_connection_string = (
    f"Driver={{{SQL_DRIVER}}};"
    f"Server=tcp:{SQL_SERVER},1433;"
    f"Database={SQL_DATABASE};"
    f"Uid={SQL_USER};"
    f"Pwd={SQL_PASSWORD};"
    "Encrypt=yes;"
    "TrustServerCertificate=no;"
    "Connection Timeout=30;"
)

# Build SQLAlchemy connection string
CONNECTION_STRING = f"mssql+pyodbc:///?odbc_connect={odbc_connection_string}"

# Create Engine with memory-optimized settings
engine = create_engine(
    CONNECTION_STRING,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=1800,
    pool_timeout=30,
    connect_args={
        'timeout': 30,
    }
)

# Session Factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ==================== DATABASE FUNCTIONS ====================

def get_db():
    """Database session dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def retry_connection(max_retries=3, base_delay=1):
    """
    Retry database connection with exponential backoff.
    Useful for handling paused Azure SQL databases.
    """
    error_msg = "Unknown error"
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting database connection (attempt {attempt + 1}/{max_retries})")
            connection = engine.raw_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            connection.close()
            logger.info("Database connection successful")
            return True, "Connection successful"
        except SQLAlchemyError as e:
            error_msg = str(e)
            logger.warning(f"Database connection attempt {attempt + 1} failed: {error_msg}")

            # Check for specific Azure SQL errors
            if "40613" in error_msg:
                logger.warning("Database appears to be paused. This is normal for Azure SQL databases.")
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)  # Exponential backoff
                    logger.info(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
                    continue
            elif "258" in error_msg or "timeout" in error_msg.lower():
                logger.warning("Connection timeout detected")
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    logger.info(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
                    continue
            else:
                # For other errors, don't retry
                break

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Unexpected error during connection attempt {attempt + 1}: {error_msg}")
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                logger.info(f"Retrying in {delay} seconds...")
                time.sleep(delay)
                continue
            break

    return False, f"Failed to connect after {max_retries} attempts. Last error: {error_msg}"


def test_connection():
    """Test if database connection works with retry logic"""
    return retry_connection()


def get_connection_status():
    """
    Get detailed connection status information.
    Returns a dict with status, message, and additional info.
    """
    success, message = test_connection()

    status_info = {
        "connected": success,
        "message": message,
        "server": SQL_SERVER,
        "database": SQL_DATABASE,
        "driver": SQL_DRIVER
    }

    if not success:
        # Try to categorize the error
        if "40613" in message:
            status_info["error_type"] = "database_paused"
            status_info["suggestion"] = "Resume the database in Azure Portal"
        elif "40615" in message:
            status_info["error_type"] = "firewall_blocked"
            status_info["suggestion"] = "Add your IP address to the Azure SQL Server firewall rules"
        elif "258" in message or "timeout" in message.lower():
            status_info["error_type"] = "connection_timeout"
            status_info["suggestion"] = "Check network connectivity and firewall settings"
        elif "28000" in message or "login" in message.lower():
            status_info["error_type"] = "authentication_failed"
            status_info["suggestion"] = "Verify database credentials"
        else:
            status_info["error_type"] = "unknown"
            status_info["suggestion"] = "Check Azure SQL Database status and configuration"

    return status_info
