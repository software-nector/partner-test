from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.qr_code import QRCode
from app.models.product import Product
from app.schemas.product import ProductResponse

router = APIRouter()

@router.get("/{code}", response_model=ProductResponse)
async def resolve_qr_code(code: str, db: Session = Depends(get_db)):
    """
    Resolve a unique QR code.
    Increments scan count and returns the associated product.
    """
    qr = db.query(QRCode).filter(QRCode.code == code).first()
    
    if not qr:
        raise HTTPException(status_code=404, detail="Invalid QR code")
    
    if qr.is_used:
        raise HTTPException(status_code=400, detail="This QR code has already been used and claimed.")
    
    # Increment scan count
    qr.scan_count += 1
    qr.last_scanned_at = datetime.utcnow()
    db.commit()
    
    # Fetch product
    product = db.query(Product).filter(Product.id == qr.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Associated product not found")
        
    return product
