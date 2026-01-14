import uvicorn
import os
import sys
from pathlib import Path

# Add the current directory to sys.path to allow importing the app package
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from dotenv import load_dotenv

# Ensure environment variables are loaded if running directly
load_dotenv()

# Import the FastAPI app from the refactored structure
from app.main import app

if __name__ == "__main__":
    port = int(os.getenv("API_PORT", 8000))
    host = os.getenv("API_HOST", "0.0.0.0")
    
    print(f"Starting server on {host}:{port}")
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True
    )
