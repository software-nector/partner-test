from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models.company import Company
from app.models.product import Product
from app.models.qr_code import QRCode
from app.schemas.company import CompanyCreate, CompanyResponse, CompanyUpdate
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate, QRCodeResponse
from app.api.admin import verify_admin # Reuse admin auth dependency

router = APIRouter()

# --- Company Management ---

@router.post("/companies", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(company: CompanyCreate, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    # Check if company with same name already exists
    existing = db.query(Company).filter(Company.name == company.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Company '{company.name}' already exists"
        )
    
    db_company = Company(
        name=company.name,
        logo_url=company.logo_url,
        description=company.description,
        website=company.website
    )
    db.add(db_company)
    db.flush()
    
    # Create associated products if any
    if company.products:
        for p_data in company.products:
            product = Product(
                company_id=db_company.id,
                name=p_data.name,
                mrp=p_data.mrp,
                selling_price=p_data.selling_price,
                cashback_amount=getattr(p_data, 'cashback_amount', 100.0)
            )
            db.add(product)
    
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/companies", response_model=List[CompanyResponse])
async def list_companies(db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    return db.query(Company).all()

# --- Product Management ---

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    # Verify company exists
    company = db.query(Company).filter(Company.id == product.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products", response_model=List[ProductResponse])
async def list_all_products(db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    return db.query(Product).all()

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

# --- QR Code Generation ---

@router.post("/products/{product_id}/generate-qr", response_model=QRCodeResponse)
async def generate_qr_for_product(product_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    # Verify product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Generate unique code
    unique_code = str(uuid.uuid4())[:6].upper()  # 6 characters, uppercase
    while db.query(QRCode).filter(QRCode.code == unique_code).first():
        unique_code = str(uuid.uuid4())[:6].upper()
        
    db_qr = QRCode(product_id=product_id, code=unique_code)
    db.add(db_qr)
    db.commit()
    db.refresh(db_qr)
    return db_qr

@router.post("/products/{product_id}/generate-bulk")
async def generate_bulk_qr(product_id: int, quantity: int, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """Generate multiple QR codes at once"""
    # Verify product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Validate quantity
    if quantity < 1 or quantity > 100:
        raise HTTPException(status_code=400, detail="Quantity must be between 1 and 100")
    
    # Generate multiple codes
    generated_codes = []
    for _ in range(quantity):
        unique_code = str(uuid.uuid4())[:6].upper()
        while db.query(QRCode).filter(QRCode.code == unique_code).first():
            unique_code = str(uuid.uuid4())[:6].upper()
        
        db_qr = QRCode(product_id=product_id, code=unique_code)
        db.add(db_qr)
        generated_codes.append(db_qr)
    
    db.commit()
    
    return {
        "message": f"Generated {quantity} QR codes",
        "codes": [QRCodeResponse.model_validate(qr) for qr in generated_codes]
    }

@router.get("/products/{product_id}/qr-codes", response_model=List[QRCodeResponse])
async def get_product_qr_codes(product_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    return db.query(QRCode).filter(QRCode.product_id == product_id).all()

@router.get("/products/{product_id}/qr-image/{code}")
async def get_qr_image(product_id: int, code: str, db: Session = Depends(get_db)):
    """Get QR code as PNG image"""
    from fastapi.responses import StreamingResponse
    from app.services.qr_service import qr_service
    
    # Verify QR code exists
    qr = db.query(QRCode).filter(
        QRCode.code == code,
        QRCode.product_id == product_id
    ).first()
    
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    # Generate image
    img_buffer = qr_service.generate_qr_image(code)
    
    return StreamingResponse(
        img_buffer,
        media_type="image/png",
        headers={"Content-Disposition": f"inline; filename=qr_{code}.png"}
    )

@router.get("/products/{product_id}/qr-pdf")
async def download_qr_pdf(product_id: int, db: Session = Depends(get_db)):
    """Download all QR codes as PDF in 4×6 grid"""
    from fastapi.responses import StreamingResponse
    from app.services.qr_service import qr_service
    
    # Get product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get all QR codes for this product
    qr_codes = db.query(QRCode).filter(QRCode.product_id == product_id).all()
    
    if not qr_codes:
        raise HTTPException(status_code=404, detail="No QR codes found for this product")
    
    # Prepare data for PDF
    qr_data = [(qr.code, f"http://localhost:3000/p/{qr.code}") for qr in qr_codes]
    
    # Generate PDF
    pdf_buffer = qr_service.generate_bulk_pdf(qr_data, product.name)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=qr_codes_{product.name.replace(' ', '_')}.pdf"}
    )
