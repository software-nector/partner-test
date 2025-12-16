from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from app.database import get_db
from app.models.user import User
from app.services.email_service import email_service
from app.config import settings
from app.api.auth import create_access_token

router = APIRouter()

# Password hashing with Argon2 (better Python 3.13 compatibility)
ph = PasswordHasher()

# Request/Response Models
class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class AdminLoginResponse(BaseModel):
    message: str
    email: str

class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    """
    Admin login - Step 1: Validate email/password and send OTP
    """
    # Check if email is allowed admin email
    if request.email != settings.ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as admin"
        )
    
    # Find or create admin user
    admin = db.query(User).filter(User.email == request.email).first()
    
    if not admin:
        # Create admin user on first login
        admin = User(
            email=request.email,
            phone="0000000000",  # Placeholder
            name="Admin",
            is_admin=True,
            password_hash=ph.hash(request.password)
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    else:
        # Verify password with bcrypt directly
        import bcrypt
        
        print(f"[DEBUG] Admin found: {admin.email}")
        print(f"[DEBUG] Password from request: {request.password}")
        print(f"[DEBUG] Hash from DB: {admin.password_hash[:50]}...")
        print(f"[DEBUG] Hash length: {len(admin.password_hash)}")
        
        try:
            result = bcrypt.checkpw(request.password.encode('utf-8'), admin.password_hash.encode('utf-8'))
            print(f"[DEBUG] Password verification result: {result}")
            
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
        except Exception as e:
            print(f"[ERROR] Password verification exception: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Password verification failed: {str(e)}"
            )
    
    # Generate and send OTP
    otp = email_service.generate_otp()
    
    # Update user with OTP
    admin.otp_code = otp
    admin.otp_expires_at = email_service.calculate_otp_expiry()
    admin.otp_attempts = 0
    db.commit()
    
    # Send OTP email
    email_sent = email_service.send_otp_email(request.email, otp)
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email. Please check SMTP configuration."
        )
    
    return AdminLoginResponse(
        message="OTP sent to your email",
        email=request.email
    )

@router.post("/verify-otp", response_model=AdminTokenResponse)
async def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Admin login - Step 2: Verify OTP and issue JWT token
    """
    # Find admin user
    admin = db.query(User).filter(User.email == request.email, User.is_admin == True).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # Check if OTP exists
    if not admin.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP found. Please request a new one."
        )
    
    # Check OTP expiry
    if admin.otp_expires_at < datetime.utcnow():
        admin.otp_code = None
        admin.otp_expires_at = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    # Check max attempts
    if admin.otp_attempts >= settings.MAX_OTP_ATTEMPTS:
        admin.otp_code = None
        admin.otp_expires_at = None
        admin.otp_attempts = 0
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Maximum OTP attempts exceeded. Please request a new OTP."
        )
    
    # Verify OTP
    if admin.otp_code != request.otp:
        admin.otp_attempts += 1
        db.commit()
        remaining = settings.MAX_OTP_ATTEMPTS - admin.otp_attempts
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid OTP. {remaining} attempts remaining."
        )
    
    # OTP verified successfully - clear OTP data
    admin.otp_code = None
    admin.otp_expires_at = None
    admin.otp_attempts = 0
    db.commit()
    
    # Create JWT token
    access_token = create_access_token(data={"sub": admin.email, "is_admin": True})
    
    return AdminTokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": admin.id,
            "email": admin.email,
            "name": admin.name,
            "is_admin": admin.is_admin
        }
    )

@router.post("/resend-otp", response_model=AdminLoginResponse)
async def resend_otp(email: EmailStr, db: Session = Depends(get_db)):
    """
    Resend OTP to admin email
    """
    admin = db.query(User).filter(User.email == email, User.is_admin == True).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # Generate new OTP
    otp = email_service.generate_otp()
    
    # Update user
    admin.otp_code = otp
    admin.otp_expires_at = email_service.calculate_otp_expiry()
    admin.otp_attempts = 0
    db.commit()
    
    # Send OTP email
    email_sent = email_service.send_otp_email(email, otp)
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email"
        )
    
    return AdminLoginResponse(
        message="New OTP sent to your email",
        email=email
    )
