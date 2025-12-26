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
    mrp: Optional[float] = 0.0
    selling_price: Optional[float] = 0.0

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
