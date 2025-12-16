from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    name = Column(String(100), nullable=True)
    email = Column(String(100), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)
    
    # Google OAuth fields
    google_id = Column(String(255), unique=True, nullable=True)
    profile_picture = Column(String(500), nullable=True)
    
    # OTP fields for admin login
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    otp_attempts = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - specify foreign_keys to avoid ambiguity
    rewards = relationship("Reward", back_populates="user", foreign_keys="Reward.user_id")
    reels = relationship("Reel", back_populates="user", foreign_keys="Reel.user_id")
    coupons = relationship("Coupon", back_populates="user")

    def __repr__(self):
        return f"<User {self.phone}>"
