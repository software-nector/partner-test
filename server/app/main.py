from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import routers (will create these next)
# from app.api import auth, rewards, admin, reels

from app.database import engine, Base
from app.config import settings

# Import all models so SQLAlchemy knows about them
from app.models import user, coupon, reward, reel

# Create database tables
Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="Purna Gummies API",
    description="Reward & Review System - Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API routers
from app.api import auth, rewards, reels, admin, videos, admin_auth, user

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(rewards.router, prefix="/api/rewards", tags=["Rewards"])
app.include_router(reels.router, prefix="/api/reels", tags=["Reels"])
app.include_router(user.router, prefix="/api/user", tags=["User Dashboard"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(admin_auth.router, prefix="/api/admin/auth", tags=["Admin Authentication"])

@app.get("/")
async def root():
    return {
        "message": "Purna Gummies API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
