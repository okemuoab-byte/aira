import os
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Health Journey Platform API",
    description="Backend API for the Health Journey Platform - Your Google Maps for illness",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
mongodb_uri = os.getenv("MONGODB_URI")
if not mongodb_uri:
    raise ValueError("MONGODB_URI environment variable is required")

client = AsyncIOMotorClient(mongodb_uri)
database = client.health_journey

# Response models
class HealthCheckResponse(BaseModel):
    status: str
    timestamp: datetime
    database_connected: bool
    message: str

class ErrorResponse(BaseModel):
    error: str
    code: str
    details: Dict[str, Any] = {}

# Health check endpoint
@app.get("/healthz", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint that verifies the API is running and MongoDB is connected.
    """
    try:
        # Test MongoDB connection
        await client.admin.command('ping')
        db_connected = True
        message = "API is healthy and database is connected"
    except Exception as e:
        db_connected = False
        message = f"API is running but database connection failed: {str(e)}"
    
    return HealthCheckResponse(
        status="healthy" if db_connected else "degraded",
        timestamp=datetime.utcnow(),
        database_connected=db_connected,
        message=message
    )

# API v1 router setup
from fastapi import APIRouter

api_v1_router = APIRouter(prefix="/api/v1")

# Include the health check in the v1 API as well
@api_v1_router.get("/healthz", response_model=HealthCheckResponse)
async def api_v1_health_check():
    """
    Health check endpoint under /api/v1 path.
    """
    return await health_check()

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint providing basic API information.
    """
    return {
        "message": "Health Journey Platform API",
        "version": "1.0.0",
        "docs": "/api/v1/docs",
        "health": "/healthz"
    }

# Include API v1 router
app.include_router(api_v1_router)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return HTTPException(
        status_code=500,
        detail=ErrorResponse(
            error="Internal server error",
            code="INTERNAL_ERROR",
            details={"message": str(exc)}
        ).dict()
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )