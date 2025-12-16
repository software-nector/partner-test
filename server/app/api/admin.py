from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.database import get_db
from app.models.reward import Reward
from app.models.reel import Reel
from app.models.user import User
from app.schemas.reward import RewardResponse, RewardUpdateRequest
from app.schemas.reel import ReelResponse, ReelUpdateRequest

router = APIRouter()

# Admin authentication (simplified - in production use proper auth)
async def verify_admin(db: Session = Depends(get_db)):
    # TODO: Implement proper admin authentication
    return True

@router.get("/rewards", response_model=List[RewardResponse])
async def get_all_rewards(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(verify_admin)
):
    """Get all reward claims (Admin only)"""
    query = db.query(Reward)
    
    if status:
        query = query.filter(Reward.status == status)
    
    rewards = query.offset(skip).limit(limit).all()
    return [RewardResponse.model_validate(r) for r in rewards]

@router.put("/rewards/{reward_id}", response_model=RewardResponse)
async def update_reward_status(
    reward_id: int,
    update: RewardUpdateRequest,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(verify_admin)
):
    """Update reward status (Admin only)"""
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    reward.status = update.status
    
    if update.admin_notes:
        reward.admin_notes = update.admin_notes
    
    if update.payment_amount:
        reward.payment_amount = update.payment_amount
    
    if update.status == "approved" or update.status == "verified":
        reward.verified_at = datetime.utcnow()
    elif update.status == "paid":
        reward.payment_date = datetime.utcnow()
    
    db.commit()
    db.refresh(reward)
    
    return RewardResponse.model_validate(reward)

@router.get("/reels", response_model=List[ReelResponse])
async def get_all_reels(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(verify_admin)
):
    """Get all reel submissions (Admin only)"""
    query = db.query(Reel)
    
    if status:
        query = query.filter(Reel.status == status)
    
    reels = query.offset(skip).limit(limit).all()
    return [ReelResponse.model_validate(r) for r in reels]

@router.put("/reels/{reel_id}", response_model=ReelResponse)
async def update_reel_status(
    reel_id: int,
    update: ReelUpdateRequest,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(verify_admin)
):
    """Update reel status (Admin only)"""
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    
    reel.status = update.status
    
    if update.admin_notes:
        reel.admin_notes = update.admin_notes
    
    if update.tracking_number:
        reel.tracking_number = update.tracking_number
    
    if update.product_name:
        reel.product_name = update.product_name
    
    if update.status == "approved" or update.status == "verified":
        reel.verified_at = datetime.utcnow()
    elif update.status == "shipped":
        reel.shipped_date = datetime.utcnow()
    
    db.commit()
    db.refresh(reel)
    
    return ReelResponse.model_validate(reel)

@router.get("/analytics")
async def get_analytics(
    db: Session = Depends(get_db),
    is_admin: bool = Depends(verify_admin)
):
    """Get dashboard analytics (Admin only)"""
    total_rewards = db.query(func.count(Reward.id)).scalar()
    pending_rewards = db.query(func.count(Reward.id)).filter(Reward.status == "pending").scalar()
    approved_rewards = db.query(func.count(Reward.id)).filter(Reward.status == "approved").scalar()
    paid_rewards = db.query(func.count(Reward.id)).filter(Reward.status == "paid").scalar()
    
    total_reels = db.query(func.count(Reel.id)).scalar()
    pending_reels = db.query(func.count(Reel.id)).filter(Reel.status == "pending").scalar()
    shipped_reels = db.query(func.count(Reel.id)).filter(Reel.status == "shipped").scalar()
    
    return {
        "total_rewards": total_rewards,
        "pending_rewards": pending_rewards,
        "approved_rewards": approved_rewards,
        "paid_rewards": paid_rewards,
        "total_reels": total_reels,
        "pending_reels": pending_reels,
        "shipped_reels": shipped_reels
    }

# Bulk Payment Endpoint
class BulkPaymentRequest(BaseModel):
    reward_ids: list[int]
    transaction_id: Optional[str] = None
    payment_method: Optional[str] = "UPI"

@router.post("/rewards/bulk-payment")
async def bulk_payment(
    request: BulkPaymentRequest,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(verify_admin)
):
    """Process bulk payment for multiple rewards (Admin only)"""
    success_ids = []
    failed_ids = []
    
    for reward_id in request.reward_ids:
        try:
            reward = db.query(Reward).filter(Reward.id == reward_id).first()
            
            if not reward:
                failed_ids.append({"id": reward_id, "reason": "Reward not found"})
                continue
            
            if reward.status != "approved":
                failed_ids.append({"id": reward_id, "reason": f"Invalid status: {reward.status}"})
                continue
            
            # Update to paid
            reward.status = "paid"
            reward.payment_date = datetime.utcnow()
            
            if request.transaction_id:
                if not reward.admin_notes:
                    reward.admin_notes = f"Transaction ID: {request.transaction_id}"
                else:
                    reward.admin_notes += f"\nTransaction ID: {request.transaction_id}"
            
            success_ids.append(reward_id)
            
        except Exception as e:
            failed_ids.append({"id": reward_id, "reason": str(e)})
    
    db.commit()
    
    return {
        "success": len(success_ids),
        "failed": len(failed_ids),
        "success_ids": success_ids,
        "failed_details": failed_ids,
        "total_processed": len(request.reward_ids)
    }
