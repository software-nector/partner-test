from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, List
from app.database import get_db
from app.models.reward import Reward
from app.models.reel import Reel
from app.models.user import User
from app.schemas.reward import RewardResponse
from app.schemas.reel import ReelResponse
from app.api.auth import get_current_user

router = APIRouter()

# Using real auth from auth.py

@router.get("/dashboard")
async def get_user_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user dashboard with statistics and submissions"""
    
    # Get reward statistics
    reward_stats = db.query(
        func.count(Reward.id).label('total'),
        func.sum(func.IF(Reward.status == 'pending', 1, 0)).label('pending'),
        func.sum(func.IF(Reward.status == 'approved', 1, 0)).label('approved'),
        func.sum(func.IF(Reward.status == 'rejected', 1, 0)).label('rejected'),
        func.sum(func.IF(Reward.status == 'paid', 1, 0)).label('paid'),
        func.sum(Reward.payment_amount).label('total_cashback')
    ).filter(Reward.user_id == current_user.id).first()
    
    # Get reel statistics
    reel_stats = db.query(
        func.count(Reel.id).label('total'),
        func.sum(func.IF(Reel.status == 'pending', 1, 0)).label('pending'),
        func.sum(func.IF(Reel.status == 'approved', 1, 0)).label('approved'),
        func.sum(func.IF(Reel.status == 'rejected', 1, 0)).label('rejected'),
        func.sum(func.IF(Reel.status == 'shipped', 1, 0)).label('shipped')
    ).filter(Reel.user_id == current_user.id).first()
    
    # Get recent rewards
    rewards = db.query(Reward).filter(
        Reward.user_id == current_user.id
    ).order_by(Reward.created_at.desc()).limit(10).all()
    
    # Get recent reels
    reels = db.query(Reel).filter(
        Reel.user_id == current_user.id
    ).order_by(Reel.created_at.desc()).limit(10).all()
    
    return {
        "stats": {
            "rewards": {
                "total": reward_stats.total or 0,
                "total_cashback": reward_stats.total_cashback or 0,
                "pending": reward_stats.pending or 0,
                "approved": reward_stats.approved or 0,
                "rejected": reward_stats.rejected or 0,
                "paid": reward_stats.paid or 0
            },
            "reels": {
                "total": reel_stats.total or 0,
                "pending": reel_stats.pending or 0,
                "approved": reel_stats.approved or 0,
                "rejected": reel_stats.rejected or 0,
                "shipped": reel_stats.shipped or 0
            }
        },
        "recent_rewards": [RewardResponse.model_validate(r) for r in rewards],
        "recent_reels": [ReelResponse.model_validate(r) for r in reels]
    }
