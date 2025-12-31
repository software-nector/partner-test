from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseModel):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./purna_gummies.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development") # development or production
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days for admin/dev convenience
    
    # Twilio WhatsApp
    TWILIO_ACCOUNT_SID: Optional[str] = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: Optional[str] = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_WHATSAPP_NUMBER: Optional[str] = os.getenv("TWILIO_WHATSAPP_NUMBER")
    
    # SMTP Email
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = os.getenv("SMTP_PORT", 587)
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    SMTP_FROM_EMAIL: Optional[str] = os.getenv("SMTP_FROM_EMAIL")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "Purna Gummies")
    
    # Admin
    ADMIN_EMAIL: Optional[str] = os.getenv("ADMIN_EMAIL")
    OTP_EXPIRY_MINUTES: int = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))
    MAX_OTP_ATTEMPTS: int = int(os.getenv("MAX_OTP_ATTEMPTS", "3"))
    
    # Razorpay
    RAZORPAY_KEY_ID: Optional[str] = os.getenv("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: Optional[str] = os.getenv("RAZORPAY_KEY_SECRET")
    
    # App URLs
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    VERCEL_URL: str = os.getenv("VERCEL_URL", "https://purna-cashback.vercel.app")
    
    # File Upload
    MAX_FILE_SIZE: int = 5242880  # 5MB
    UPLOAD_DIR: str = "uploads"
    
    # Google API Keys
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    GOOGLE_DRIVE_FOLDER_ID: str = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "1scIpkUKHZnV6o5milYViTlpGOw5cka_v")
    
    # Google Drive OAuth (Personal Account)
    GOOGLE_DRIVE_CLIENT_ID: Optional[str] = os.getenv("DRIVE_CLIENT_ID")
    GOOGLE_DRIVE_CLIENT_SECRET: Optional[str] = os.getenv("DRIVE_CLIENT_SECRET")
    GOOGLE_DRIVE_REFRESH_TOKEN: Optional[str] = os.getenv("GOOGLE_DRIVE_REFRESH_TOKEN")

settings = Settings()
