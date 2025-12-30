from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import routers (will create these next)
# from app.api import auth, user, admin, admin_auth, rewards, reels, videos, products, qr, admin_products

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
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None
)

# CORS Middleware configuration
if settings.ENVIRONMENT == "development":
    # Permissive for local development across various ports/IPs
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Strict for production
    allowed_origins = [origin for origin in [settings.FRONTEND_URL, settings.VERCEL_URL] if origin]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API routers
from app.api import auth, user, admin, admin_auth, rewards, reels, videos, products, qr, admin_products

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin_auth.router, prefix="/api/admin/auth", tags=["admin-auth"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(rewards.router, prefix="/api/rewards", tags=["rewards"])
app.include_router(reels.router, prefix="/api/reels", tags=["reels"])
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(qr.router, prefix="/api/qr", tags=["qr"])
app.include_router(admin_products.router, prefix="/api/admin/catalog", tags=["admin-catalog"])

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
