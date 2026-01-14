import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    API_TITLE: str = os.getenv("API_TITLE", "AIHub API")
    API_DESCRIPTION: str = "FastAPI backend for AIHub connected to SQL Server"
    API_VERSION: str = os.getenv("API_VERSION", "1.0.0")
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", 8005))
    
    CORS_ORIGINS: list[str] = [
        "http://localhost",
        "https://localhost",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "https://eai-aihub-frontend-dev.happywave-248a4bd8.eastus2.azurecontainerapps.io",
    ]
    
    SQL_DRIVER: str = os.getenv("SQL_DRIVER", "ODBC Driver 18 for SQL Server")
    SQL_SERVER: str = os.getenv("SQL_SERVER", "agenthub-dbt.database.windows.net")
    SQL_DATABASE: str = os.getenv("SQL_DATABASE", "aihubbackend")
    SQL_USER: str = os.getenv("SQL_USER", "sqladmin")
    SQL_PASSWORD: str = os.getenv("SQL_PASSWORD", "")

settings = Settings()
