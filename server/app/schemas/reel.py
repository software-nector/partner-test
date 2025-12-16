from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Reel Submit Request
class ReelSubmitRequest(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = None
    address: str = Field(..., min_length=10)
    instagram_handle: str = Field(..., min_length=2)
    reel_url: str = Field(..., min_length=10)
    # brand_tag_proof will be uploaded as file

# Reel Response
class ReelResponse(BaseModel):
    id: int
    user_id: int
    name: str
    phone: str
    email: Optional[str]
    address: str
    instagram_handle: str
    reel_url: str
    brand_tag_proof: str
    product_name: str  # Required field
    status: str
    rejection_reason: Optional[str] = None  # Admin feedback for rejected submissions
    admin_notes: Optional[str]
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    tracking_number: Optional[str]
    shipped_date: Optional[datetime] = None
    delivered_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Reel Update (Admin)
class ReelUpdateRequest(BaseModel):
    status: str  # pending, approved, rejected, shipped
    rejection_reason: Optional[str] = None  # Required when status is rejected
    admin_notes: Optional[str] = None
    product_name: Optional[str] = None
    tracking_number: Optional[str] = None

# Reel List Response
class ReelListResponse(BaseModel):
    total: int
    reels: list[ReelResponse]
