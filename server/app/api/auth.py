from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from app.database import get_db
from app.models.user import User
from app.models.coupon import Coupon
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
from app.config import settings
from app.services.google_oauth import google_oauth
from app.services.email_service import email_service  # Reuse OTP generation logic

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with phone number and coupon code
    - Verifies coupon is valid and unused
    - Creates user if doesn't exist
    - Marks coupon as used
    - Returns JWT token
    """
    # Verify coupon exists
    coupon = db.query(Coupon).filter(Coupon.code == request.coupon.upper()).first()
    
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid coupon code. Please check the code on your product package."
        )
    
    if coupon.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This coupon code has already been used. Each code can only be used once."
        )
    
    # Get or create user
    user = db.query(User).filter(User.phone == request.phone).first()
    
    if not user:
        user = User(phone=request.phone)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Mark coupon as used
    coupon.is_used = True
    coupon.user_id = user.id
    coupon.used_at = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"user_id": user.id, "phone": user.phone}
    )
    
    return LoginResponse(
        token=access_token,
        user=UserResponse.model_validate(user)
    )

class WhatsAppOTPRequest(BaseModel):
    phone: str
    coupon: str = None  # Optional during OTP send, captured in frontend

class WhatsAppVerifyRequest(BaseModel):
    phone: str
    otp: str
    coupon: str = None

@router.post("/whatsapp/send-otp")
async def send_whatsapp_otp(request: WhatsAppOTPRequest, db: Session = Depends(get_db)):
    """
    Step 1: Generate and 'send' OTP via WhatsApp (Mocked)
    """
    # Clean phone number
    phone = request.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")

    # Generate OTP
    otp = email_service.generate_otp()
    expiry = email_service.calculate_otp_expiry()

    # Find or create user
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        user = User(phone=phone)
        db.add(user)
    
    # Update user with OTP
    user.otp_code = otp
    user.otp_expires_at = expiry
    user.otp_attempts = 0
    db.commit()

    # MOCK: In production, integrate with WhatsApp API (e.g., Twilio, Meta)
    print(f"\n[WHATSAPP MOCK] Sending OTP {otp} to {phone}\n")
    
    return {"message": "OTP sent successfully", "phone": phone}

@router.post("/whatsapp/verify-otp", response_model=LoginResponse)
async def verify_whatsapp_otp(request: WhatsAppVerifyRequest, db: Session = Depends(get_db)):
    """
    Step 2: Verify OTP and link coupon if provided
    """
    user = db.query(User).filter(User.phone == request.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check OTP
    if not user.otp_code or user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired or not found")

    if user.otp_attempts >= settings.MAX_OTP_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many attempts")

    if user.otp_code != request.otp:
        user.otp_attempts += 1
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid OTP")

    # Clear OTP
    user.otp_code = None
    user.otp_expires_at = None
    user.otp_attempts = 0
    
    # Handle Coupon if provided (legacy support for the initial requirement)
    if request.coupon:
        coupon = db.query(Coupon).filter(Coupon.code == request.coupon.upper()).first()
        if coupon and not coupon.is_used:
            coupon.is_used = True
            coupon.user_id = user.id
            coupon.used_at = datetime.utcnow()
    
    db.commit()

    # Create token
    access_token = create_access_token(data={"user_id": user.id, "phone": user.phone})

    return LoginResponse(
        token=access_token,
        user=UserResponse.model_validate(user)
    )

# Email/Password Login Schemas
class EmailLoginRequest(BaseModel):
    email: EmailStr
    password: str

class EmailRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str = None
    phone: str = None

@router.post("/email/register")
async def register_with_email(request: EmailRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with email and password"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        name=request.name,
        phone=request.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email}
    )
    
    return LoginResponse(
        token=access_token,
        user=UserResponse.model_validate(user)
    )

@router.post("/email/login")
async def login_with_email(request: EmailLoginRequest, db: Session = Depends(get_db)):
    """Login with email and password"""
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email}
    )
    
    return LoginResponse(
        token=access_token,
        user=UserResponse.model_validate(user)
    )

# Google OAuth Schemas
class GoogleLoginRequest(BaseModel):
    token: str  # Google ID token

@router.get("/google/url")
async def get_google_auth_url():
    """Get Google OAuth authorization URL"""
    return {"url": google_oauth.get_authorization_url()}

@router.post("/google/login")
async def login_with_google(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Login or register with Google OAuth"""
    try:
        print(f"[DEBUG] Received Google token: {request.token[:50]}...")
        print(f"[DEBUG] Client ID from env: {google_oauth.client_id}")
        
        # Verify Google token
        google_user = google_oauth.verify_token(request.token)
        print(f"[DEBUG] Token verified successfully for: {google_user['email']}")
        
        # Check if user exists
        user = db.query(User).filter(User.email == google_user['email']).first()
        
        if not user:
            print(f"[DEBUG] Creating new user: {google_user['email']}")
            # Create new user
            user = User(
                email=google_user['email'],
                name=google_user['name'],
                google_id=google_user['google_id'],
                profile_picture=google_user.get('picture')
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"[DEBUG] User created with ID: {user.id}")
        else:
            print(f"[DEBUG] User found: {user.email}, ID: {user.id}")
            # Update Google ID if not set
            if not user.google_id:
                user.google_id = google_user['google_id']
                db.commit()
                print(f"[DEBUG] Updated Google ID for user")
        
        # Create access token
        access_token = create_access_token(
            data={"user_id": user.id, "email": user.email}
        )
        
        print(f"[DEBUG] Login successful for: {user.email}")
        return LoginResponse(
            token=access_token,
            user=UserResponse.model_validate(user)
        )
    
    except Exception as e:
        print(f"[ERROR] Google login failed: {str(e)}")
        print(f"[ERROR] Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(db: Session = Depends(get_db)):
    """Get current user information"""
    # TODO: Implement JWT token verification
    # For now, return first user
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)

