from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
async def get_active_products(db: Session = Depends(get_db)):
    """Get all active products for the homepage"""
    return db.query(Product).filter(Product.is_active == True).all()

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get specific product details"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
