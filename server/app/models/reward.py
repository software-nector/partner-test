from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Reward(Base):
    __tablename__ = "rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # User details
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=False)
    
    # Purchase details
    product_name = Column(String(200), nullable=False)
    purchase_date = Column(DateTime, nullable=False)
    review_screenshot = Column(String(500), nullable=False)  # File path
    platform_name = Column(String(50), nullable=True)  # Amazon, Flipkart, Meesho, etc.
    coupon_code = Column(String(50), nullable=True, index=True) # Linked QR code
    screenshot_quality = Column(String(20), nullable=True)  # AI analysis: excellent, good, fair, poor
    
    # Status
    status = Column(String(50), default="pending")  # pending, approved, rejected, paid
    rejection_reason = Column(Text, nullable=True)  # Admin feedback for rejected submissions
    
    # AI Analysis
    ai_verified = Column(Boolean, default=False)  # Whether AI has analyzed the screenshot
    detected_rating = Column(Integer, nullable=True)  # Star rating detected by AI (1-5)
    detected_comment = Column(Text, nullable=True)  # Review comment extracted by AI
    ai_confidence = Column(Float, nullable=True)  # AI confidence score (0.0-1.0)
    ai_analysis_status = Column(String(50), default="pending")  # pending, success, failed
    ai_decision_log = Column(Text, nullable=True)  # Detailed AI reasoning
    is_auto_approved = Column(Boolean, default=False)  # Flag for autonomous approval
    
    # Admin fields
    admin_notes = Column(Text, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # Payment
    upi_id = Column(String(100), nullable=True)
    payment_amount = Column(Float, nullable=True)
    payment_date = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="rewards", foreign_keys=[user_id])

    def __repr__(self):
        return f"<Reward {self.id} - {self.status}>"
