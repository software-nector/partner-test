from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    mrp: float
    selling_price: float
    amazon_url: Optional[str] = None
    flipkart_url: Optional[str] = None
    website_url: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    company_id: int

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    mrp: Optional[float] = None
    selling_price: Optional[float] = None
    company_id: Optional[int] = None

class ProductResponse(ProductBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class QRCodeResponse(BaseModel):
    code: str
    product_id: int
    scan_count: int
    is_used: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProductWithQRResponse(ProductResponse):
    qr_codes: List[QRCodeResponse] = []
