from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from datetime import datetime
from app.database import get_db
from app.models.reel import Reel
from app.models.user import User
from app.schemas.reel import ReelResponse, ReelSubmitRequest
from app.config import settings

router = APIRouter()

# Simple auth dependency
async def get_current_user(db: Session = Depends(get_db)):
    # TODO: Implement proper JWT authentication
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@router.post("/submit", response_model=ReelResponse)
async def submit_reel(
    reel_url: str = Form(...),
    instagram_username: str = Form(...),
    product_name: str = Form(...),
    name: str = Form(...),
    phone: str = Form(...),
    address: str = Form(...),
    screenshot: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a reel for free product"""
    
    # Create upload directory
    upload_dir = f"{settings.UPLOAD_DIR}/reels"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save uploaded screenshot
    timestamp = int(datetime.now().timestamp())
    file_extension = os.path.splitext(screenshot.filename)[1]
    file_path = f"{upload_dir}/{timestamp}_{current_user.id}{file_extension}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(screenshot.file, buffer)
    
    # Create reel record
    # 3. Upload to Google Drive (if local save passed)
    drive_link = file_path # Fallback to local
    try:
        from app.services.google_drive_service import google_drive_service
        drive_filename = f"REEL_{instagram_username.replace('@', '')}_{timestamp}.jpg"
        print(f"☁️ Uploading Reel Proof to Google Drive: {drive_filename}")
        uploaded_link = google_drive_service.upload_file(file_path, drive_filename)
        if uploaded_link:
            drive_link = uploaded_link
            # Clean up local file
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception as drive_err:
        print(f"⚠️ Google Drive upload failed for reel, keeping local: {str(drive_err)}")

    reel = Reel(
        user_id=current_user.id,
        name=name,
        phone=phone,
        email=current_user.email,
        address=address,
        instagram_handle=instagram_username,
        reel_url=reel_url,
        brand_tag_proof=drive_link,
        product_name=product_name,
        status="pending"
    )
    
    db.add(reel)
    db.commit()
    db.refresh(reel)
    
    # TODO: Send confirmation email
    
    return ReelResponse.model_validate(reel)

@router.get("/my-reels", response_model=List[ReelResponse])
async def get_my_reels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all reel submissions for current user"""
    reels = db.query(Reel).filter(Reel.user_id == current_user.id).order_by(Reel.created_at.desc()).all()
    return [ReelResponse.model_validate(r) for r in reels]

@router.get("/{reel_id}", response_model=ReelResponse)
async def get_reel(
    reel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific reel submission"""
    reel = db.query(Reel).filter(
        Reel.id == reel_id,
        Reel.user_id == current_user.id
    ).first()
    
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    
    return ReelResponse.model_validate(reel)
