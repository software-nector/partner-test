from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Reel(Base):
    __tablename__ = "reels"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # User details
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=False)
    
    # Social media details
    instagram_handle = Column(String(100), nullable=False)
    reel_url = Column(String(500), nullable=False)
    brand_tag_proof = Column(String(500), nullable=False)  # Screenshot path
    image_hash = Column(String(64), unique=True, index=True, nullable=True)  # To prevent duplicates

    
    # Status
    status = Column(String(50), default="pending")  # pending, approved, rejected, shipped
    rejection_reason = Column(Text, nullable=True)  # Admin feedback for rejected submissions
    
    # Admin fields
    admin_notes = Column(Text, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # Shipping
    product_name = Column(String(200), nullable=False)  # Required: Product for which reel was created
    tracking_number = Column(String(100), nullable=True)
    shipped_date = Column(DateTime, nullable=True)
    delivered_date = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="reels", foreign_keys=[user_id])

    def __repr__(self):
        return f"<Reel {self.id} - {self.status}>"
