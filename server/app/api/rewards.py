from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Request
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from datetime import datetime
from app.database import get_db
from app.models.reward import Reward
from app.models.user import User
from app.models.qr_code import QRCode
from app.schemas.reward import RewardResponse
from app.config import settings
from app.api.auth import get_current_user

router = APIRouter()

# Using real auth from auth.py
from app.models.product import Product

@router.post("/submit", response_model=RewardResponse)
async def submit_reward(
    name: str = Form(...),
    phone: str = Form(...),
    platform: str = Form(...),
    upi_id: str = Form(...),
    coupon_code: str = Form(...),
    screenshot: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a reward claim with review screenshot"""
    # 0. Basic Input Validation
    import re
    upi_pattern = r"^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$"
    if not re.match(upi_pattern, upi_id):
        raise HTTPException(status_code=400, detail="Invalid UPI ID format. Use name@bank")
    
    # Check if this UPI is already used by ANOTHER user (Identity Fraud Check)
    existing_vpa = db.query(Reward).filter(Reward.upi_id == upi_id, Reward.user_id != current_user.id).first()
    if existing_vpa:
        raise HTTPException(
            status_code=400, 
            detail="This UPI ID is already linked to another user's claim. Please use your own UPI."
        )
    
    # Get User IP
    client_ip = request.client.host if request and request.client else "unknown"
    
    # Create upload directory
    upload_dir = f"{settings.UPLOAD_DIR}/rewards"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Security: Validate file extension and sanitize filename
    file_extension = os.path.splitext(screenshot.filename)[1].lower()
    if file_extension not in ['.jpg', '.jpeg', '.png', '.webp']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed: .jpg, .jpeg, .png, .webp"
        )
    
    # Generate a completely random, secure filename
    import uuid
    safe_filename = f"{uuid.uuid4().hex}_{timestamp}{file_extension}"
    file_path = f"{upload_dir}/{safe_filename}"
    
    # Calculate Image Hash to prevent duplicates
    import hashlib
    file_content = screenshot.file.read()
    screenshot.file.seek(0) # Reset file pointer for saving
    image_hash = hashlib.sha256(file_content).hexdigest()
    
    # Check if this exact image has been used before
    existing_reward = db.query(Reward).filter(Reward.image_hash == image_hash).first()
    if existing_reward:
        raise HTTPException(
            status_code=400, 
            detail="This screenshot has already been used for another claim. Duplicates are not allowed."
        )

    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Fetch Product Data for AI Context
    qr = db.query(QRCode).filter(QRCode.code == coupon_code.upper()).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    if qr.is_used:
        raise HTTPException(status_code=400, detail="This coupon code has already been claimed")
    
    product = db.query(Product).filter(Product.id == qr.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Autonomous AI Analysis - 2 Step Process
    ai_verified = False
    is_auto_approved = False
    ai_decision_log = ""
    reward_status = "pending"
    
    try:
        from app.services.ai_service import ai_service
        
        target_urls = {
            "amazon": product.amazon_url,
            "flipkart": product.flipkart_url,
            "meesho": product.meesho_url,
            "myntra": product.myntra_url,
            "nykaa": product.nykaa_url,
            "jiomart": product.jiomart_url
        }
        
        print(f"🤖 Starting 2-Step AI Verification for: {product.name}")
        ai_result = ai_service.autonomous_verification(
            file_path, 
            product.name, 
            target_urls
        )
        
        ai_verified = True
        detected_rating = ai_result.get('detected_rating', 0)
        
        # STEP 1: Check for 5-star rating (MANDATORY)
        if detected_rating != 5:
            # Delete uploaded file
            os.remove(file_path)
            
            print(f"❌ REJECTED: Only 5-star reviews are eligible. Detected: {detected_rating} stars")
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"केवल 5-स्टार रिव्यू के लिए कैशबैक मिलेगा। आपका रिव्यू: {detected_rating} स्टार",
                    "detected_rating": detected_rating,
                    "suggestion": "कृपया अपना रिव्यू 5 स्टार में बदलें और फिर से अपलोड करें"
                }
            )
        
        print(f"✅ Step 1 Passed: 5-Star Review Detected")
        
        # STEP 2: Platform Match Check
        ai_decision_log = ai_result.get('decision_reasoning', 'No reasoning provided')
        
        if ai_result.get('auto_approve', False):
            # AI found the review on platform with high confidence
            print("✅ Step 2 Passed: Review FOUND on Platform → AUTO-APPROVED")
            reward_status = "approved"
            is_auto_approved = True
            ai_decision_log = f"✅ Auto-Approved: {ai_decision_log}"
        else:
            # AI couldn't confirm platform match - needs manual verification
            print(f"🔄 Step 2 Failed: Review NOT FOUND on Platform → PENDING for Admin Review")
            print(f"   Reasoning: {ai_decision_log}")
            reward_status = "pending"
            ai_decision_log = f"⚠️ Manual Review Required: {ai_decision_log}"
            
    except HTTPException:
        # Re-raise validation errors (like non-5-star)
        raise
    except Exception as e:
        print(f"❌ AI Verification System Error: {str(e)}")
        ai_decision_log = f"System Error: {str(e)}"
        # On error, keep as pending for manual review

    # Create reward record
    # 4. Upload to Google Drive (if local save and AI check passed)
    drive_link = f"/{file_path}" # Fallback to local
    try:
        from app.services.google_drive_service import google_drive_service
        drive_filename = f"{name.replace(' ', '_')}_{coupon_code.upper()}.jpg"
        print(f"☁️ Uploading to Google Drive: {drive_filename}")
        uploaded_link = google_drive_service.upload_file(file_path, drive_filename)
        if uploaded_link:
            drive_link = uploaded_link
            # IMPORTANT: Delete local file after successful drive upload
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"🗑️ Local file deleted: {file_path}")
    except Exception as drive_err:
        print(f"⚠️ Google Drive upload failed, keeping local: {str(drive_err)}")

    reward = Reward(
        user_id=current_user.id,
        name=name,
        phone=phone,
        email=current_user.email,
        address="N/A",
        product_name=product.name,
        purchase_date=datetime.now(),
        review_screenshot=drive_link,
        platform_name=platform,
        coupon_code=coupon_code.upper(),
        upi_id=upi_id,
        payment_amount=product.cashback_amount or 100.0,
        status=reward_status,
        image_hash=image_hash,
        user_ip=client_ip,
        # AI Fields
        ai_verified=ai_verified,
        is_auto_approved=is_auto_approved,
        ai_decision_log=ai_decision_log,
        detected_rating=ai_result.get('detected_rating') if 'ai_result' in locals() else None,
        ai_confidence=ai_result.get('confidence_score') if 'ai_result' in locals() else None,
        ai_analysis_status="success" if ai_verified else "failed"
    )
    
    # Mark QR code as used
    qr.is_used = True
    qr.last_scanned_at = datetime.now()
    qr.scan_count += 1
    
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
