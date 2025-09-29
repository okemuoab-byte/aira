import os
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from database import get_database, connect_to_mongodb, close_mongodb_connection, client

# Initialize FastAPI app
app = FastAPI(
    title="Health Journey Platform API",
    description="Backend API for the Health Journey Platform - Your Google Maps for illness",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5137").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# MongoDB connection - using real MongoDB database
# Global database instance
database = None

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    global database
    try:
        database = await connect_to_mongodb()
        print("✅ MongoDB connection established successfully")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        # Don't raise here to allow the server to start even if DB is down
        database = None

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_mongodb_connection()
    print("✅ MongoDB connection closed")

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
        # Use the database module's health check function
        from database import health_check as db_health_check
        health_result = await db_health_check()
        
        if health_result["status"] == "healthy":
            db_connected = True
            message = "API is healthy and database is connected"
        else:
            db_connected = False
            message = f"API is running but database connection failed: {health_result['message']}"
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

# Database dependency function for routes
def get_database_instance():
    """Get the database instance for routes that need it"""
    global database
    if not database:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return database

# Import and include route modules
from routes.auth import router as auth_router
from routes.symptoms import router as symptoms_router
from routes.medications import router as medications_router
from routes.users import router as users_router
from routes.visits import router as visits_router
from routes.family import router as family_router
from routes.uploads import router as uploads_router
from routes.health import router as health_router
from routes.chatbot import router as chatbot_router
from routes.clinical_ai import router as clinical_ai_router

api_v1_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_v1_router.include_router(symptoms_router, prefix="/symptoms", tags=["symptoms"])
api_v1_router.include_router(medications_router, prefix="/medications", tags=["medications"])
api_v1_router.include_router(users_router, prefix="/users", tags=["user-profile"])
api_v1_router.include_router(visits_router, prefix="/visits", tags=["healthcare-visits"])
api_v1_router.include_router(family_router, prefix="/family", tags=["family-sharing"])
api_v1_router.include_router(uploads_router, prefix="/uploads", tags=["photo-uploads"])
api_v1_router.include_router(health_router, prefix="/health", tags=["health-insights"])
api_v1_router.include_router(chatbot_router, prefix="/chatbot", tags=["ai-chatbot"])
api_v1_router.include_router(clinical_ai_router, prefix="/clinical-ai", tags=["enhanced-ai-assessment"])

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
    import logging
    logging.error(f"Global exception handler triggered: {type(exc).__name__}: {str(exc)}")
    logging.error(f"Request URL: {request.url}")
    
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
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
        host="127.0.0.1",
        port=port,
        reload=True,
        log_level="info"
    )