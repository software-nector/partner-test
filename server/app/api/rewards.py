from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from datetime import datetime
from app.database import get_db
from app.models.reward import Reward
from app.models.user import User
from app.schemas.reward import RewardResponse
from app.config import settings

router = APIRouter()

# Simple auth dependency (in production, use JWT)
async def get_current_user(db: Session = Depends(get_db)):
    # TODO: Implement proper JWT authentication
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@router.post("/submit", response_model=RewardResponse)
async def submit_reward(
    name: str = Form(...),
    phone: str = Form(...),
    platform: str = Form(...),
    upi_id: str = Form(...),
    coupon_code: str = Form(...),
    screenshot: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a reward claim with review screenshot"""
    
    # Create upload directory
    upload_dir = f"{settings.UPLOAD_DIR}/rewards"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save uploaded file
    timestamp = int(datetime.now().timestamp())
    file_extension = os.path.splitext(screenshot.filename)[1]
    file_path = f"{upload_dir}/{timestamp}_{current_user.id}{file_extension}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(screenshot.file, buffer)
    
    # AI Analysis - Verify 5-star rating (OPTIONAL - works without API key)
    ai_verified = False
    detected_rating = None
    detected_comment = None
    ai_confidence = None
    ai_analysis_status = "pending"
    
    try:
        from app.services.ai_service import ai_service
        
        print(f"🔍 Starting AI analysis for: {file_path}")
        is_five_star, analysis = ai_service.verify_five_star(file_path)
        
        print(f"📊 AI Analysis Result: {analysis}")
        print(f"⭐ Is 5-star: {is_five_star}")
        
        # Store AI analysis results
        ai_verified = True
        detected_rating = analysis.get('rating')
        detected_comment = analysis.get('comment')
        ai_confidence = analysis.get('confidence')
        ai_analysis_status = analysis.get('status')
        
        print(f"✅ AI Analysis Complete - Rating: {detected_rating}, Status: {ai_analysis_status}")
        
        # Only enforce 5-star requirement if AI analysis succeeded
        if ai_analysis_status == 'success' and not is_five_star:
            # Delete uploaded file
            os.remove(file_path)
            
            print(f"❌ Rejecting {detected_rating}-star review")
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"Only 5-star reviews are eligible for rewards. Detected: {detected_rating} stars",
                    "detected_rating": detected_rating,
                    "detected_comment": detected_comment,
                    "suggestion": "Please modify your review to 5 stars and upload again"
                }
            )
        
    except HTTPException:
        raise
    except Exception as e:
        # If AI analysis fails, still allow submission (for testing)
        print(f"⚠️ AI Analysis failed (continuing without verification): {str(e)}")
        import traceback
        traceback.print_exc()
        ai_verified = False
        ai_analysis_status = "failed"
    
    # Create reward record with AI analysis (if available)
    reward = Reward(
        user_id=current_user.id,
        name=name,
        phone=phone,
        email=current_user.email,
        address="N/A",
        product_name=coupon_code,
        purchase_date=datetime.now(),
        review_screenshot=f"/{file_path}",  # Add leading slash for URL
        platform_name=platform,
        upi_id=upi_id,
        status="pending",
        # AI Analysis fields
        ai_verified=ai_verified,
        detected_rating=detected_rating,
        detected_comment=detected_comment,
        ai_confidence=ai_confidence,
        ai_analysis_status=ai_analysis_status
    )
    
    db.add(reward)
    db.commit()
    db.refresh(reward)
    
    return RewardResponse.model_validate(reward)

@router.get("/my-claims", response_model=List[RewardResponse])
async def get_my_claims(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all reward claims for current user"""
    rewards = db.query(Reward).filter(Reward.user_id == current_user.id).all()
    return [RewardResponse.model_validate(r) for r in rewards]

@router.get("/{reward_id}", response_model=RewardResponse)
async def get_reward(
    reward_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific reward claim"""
    reward = db.query(Reward).filter(
        Reward.id == reward_id,
        Reward.user_id == current_user.id
    ).first()
    
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    return RewardResponse.model_validate(reward)
