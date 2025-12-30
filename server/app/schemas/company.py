from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None

class ProductSimple(BaseModel):
    name: str
    sku_prefix: Optional[str] = None
    cashback_amount: Optional[float] = 100.0
    amazon_url: Optional[str] = None
    flipkart_url: Optional[str] = None
    meesho_url: Optional[str] = None
    myntra_url: Optional[str] = None
    nykaa_url: Optional[str] = None
    jiomart_url: Optional[str] = None

class CompanyCreate(CompanyBase):
    products: Optional[List[ProductSimple]] = []

class CompanyUpdate(CompanyBase):
    name: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
