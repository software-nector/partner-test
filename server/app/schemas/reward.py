from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Reward Submit Request
class RewardSubmitRequest(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = None
    address: str = Field(..., min_length=10)
    product_name: str = Field(..., min_length=2)
    purchase_date: datetime
    upi_id: Optional[str] = None
    # review_screenshot will be uploaded as file

# Reward Response
class RewardResponse(BaseModel):
    id: int
    user_id: int
    name: str
    phone: str
    email: Optional[str]
    address: str
    product_name: str
    purchase_date: datetime
    review_screenshot: str
    platform_name: Optional[str] = None
    coupon_code: Optional[str] = None
    screenshot_quality: Optional[str] = None
    status: str = "pending"
    admin_notes: Optional[str] = None
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    upi_id: Optional[str] = None
    payment_amount: Optional[float] = None
    payment_date: Optional[datetime] = None
    # AI Fields
    ai_verified: bool = False
    is_auto_approved: bool = False
    ai_decision_log: Optional[str] = None
    detected_rating: Optional[int] = None
    ai_confidence: Optional[float] = None
    ai_analysis_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Reward Update (Admin)
class RewardUpdateRequest(BaseModel):
    status: str  # pending, approved, rejected, paid
    admin_notes: Optional[str] = None
    payment_amount: Optional[float] = None

# Reward List Response
class RewardListResponse(BaseModel):
    total: int
    rewards: list[RewardResponse]
