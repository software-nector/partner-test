from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from pydantic import BaseModel

router = APIRouter()

class VideoResponse(BaseModel):
    id: str
    title: str
    description: str
    video_url: str
    thumbnail_url: str
    duration: int  # in seconds

# Mock video data - replace with database query in production
VIDEOS = [
    {
        "id": "video_1",
        "title": "Expert Doctor's Advice on Purna Gummies",
        "description": "Watch this informative video about the benefits of Purna Gummies and how they can improve your health.",
        "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
        "thumbnail_url": "https://via.placeholder.com/640x360",
        "duration": 60
    }
]

@router.get("/list", response_model=List[VideoResponse])
async def get_videos(db: Session = Depends(get_db)):
    """Get list of all available videos"""
    return VIDEOS

@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(video_id: str, db: Session = Depends(get_db)):
    """Get specific video by ID"""
    video = next((v for v in VIDEOS if v["id"] == video_id), None)
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return video
