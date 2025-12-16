from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

# Login Request
class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    coupon: str = Field(..., min_length=4)

    @validator('phone')
    def validate_phone(cls, v):
        # Remove any non-digit characters
        digits = ''.join(filter(str.isdigit, v))
        if len(digits) != 10:
            raise ValueError('Phone number must be exactly 10 digits')
        return digits

# Login Response
class LoginResponse(BaseModel):
    token: str
    user: 'UserResponse'

# User Response
class UserResponse(BaseModel):
    id: int
    phone: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Coupon Verification
class CouponVerifyRequest(BaseModel):
    coupon: str = Field(..., min_length=4)

class CouponVerifyResponse(BaseModel):
    valid: bool
    message: str
    is_used: bool = False

# Token Data
class TokenData(BaseModel):
    user_id: int
    phone: str
