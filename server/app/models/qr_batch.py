from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class QRBatch(Base):
    __tablename__ = "qr_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Internal batch tracking
    batch_number = Column(Integer, nullable=False) # e.g., 1, 2, 3 per product
    quantity = Column(Integer, nullable=False)
    
    # Range tracking
    serial_start = Column(Integer, nullable=True)
    serial_end = Column(Integer, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product")
    qr_codes = relationship("QRCode", back_populates="batch")

    def __repr__(self):
        return f"<QRBatch #{self.batch_number} for Product {self.product_id}>"
