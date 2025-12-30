from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    
    cashback_amount = Column(Float, default=100.0)
    
    # Marketplace Links (Multiple Platforms)
    amazon_url = Column(String(500), nullable=True)
    flipkart_url = Column(String(500), nullable=True)
    meesho_url = Column(String(500), nullable=True)
    myntra_url = Column(String(500), nullable=True)
    nykaa_url = Column(String(500), nullable=True)
    jiomart_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    
    # Meta
    category = Column(String(100), nullable=True)
    sku_prefix = Column(String(10), nullable=True) # e.g., 'APG' for Apple Gummies
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship("Company", back_populates="products")
    qr_codes = relationship("QRCode", back_populates="product", cascade="all, delete-orphan")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Product {self.name}>"
