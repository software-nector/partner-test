from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import uuid

class QRCode(Base):
    __tablename__ = "qr_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("qr_batches.id"), nullable=True)
    
    # Unique identifier for the QR code (used in URL)
    # Refactored to allow Prefix-Serial or UUID
    code = Column(String(50), unique=True, index=True)
    serial_number = Column(Integer, nullable=True) # Serial within the product
    
    # Tracking
    scan_count = Column(Integer, default=0)
    last_scanned_at = Column(DateTime, nullable=True)
    is_used = Column(Boolean, default=False)
    
    # Custom attributes (batch info, etc.)
    metadata_json = Column(JSON, nullable=True)
    
    # Relationships
    product = relationship("Product", back_populates="qr_codes")
    batch = relationship("QRBatch", back_populates="qr_codes")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<QRCode {self.code} -> Product {self.product_id}>"
