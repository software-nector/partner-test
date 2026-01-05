from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models.company import Company
from app.models.product import Product
from app.models.qr_code import QRCode
from app.models.qr_batch import QRBatch
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
                sku_prefix=p_data.sku_prefix,
                cashback_amount=p_data.cashback_amount,
                amazon_url=p_data.amazon_url,
                flipkart_url=p_data.flipkart_url,
                meesho_url=p_data.meesho_url,
                myntra_url=p_data.myntra_url,
                nykaa_url=p_data.nykaa_url,
                jiomart_url=p_data.jiomart_url
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
        
    # Generate unique secure code (looks encrypted)
    import hashlib
    sku = (product.sku_prefix or "QR").upper()
    # Get next serial for this product
    last_qr = db.query(QRCode).filter(QRCode.product_id == product_id).order_by(QRCode.serial_number.desc()).first()
    next_serial = (last_qr.serial_number + 1) if last_qr and last_qr.serial_number else 1
    
    salt = uuid.uuid4().hex[:8]
    raw_seed = f"{sku}-{next_serial}-{salt}"
    unique_code = hashlib.sha256(raw_seed.encode()).hexdigest()[:12].upper()
    
    while db.query(QRCode).filter(QRCode.code == unique_code).first():
        salt = uuid.uuid4().hex[:8]
        unique_code = hashlib.sha256(f"{sku}-{next_serial}-{salt}".encode()).hexdigest()[:12].upper()
        
    db_qr = QRCode(product_id=product_id, code=unique_code, serial_number=next_serial)
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
    sku = (product.sku_prefix or "QR").upper()
    import hashlib
    
    # Get last serial number for this product
    last_qr = db.query(QRCode).filter(QRCode.product_id == product_id).order_by(QRCode.serial_number.desc()).first()
    serial_start = (last_qr.serial_number + 1) if last_qr and last_qr.serial_number else 1

    for i in range(quantity):
        current_serial = serial_start + i
        salt = uuid.uuid4().hex[:8]
        raw_seed = f"{sku}-{current_serial}-{salt}"
        unique_code = hashlib.sha256(raw_seed.encode()).hexdigest()[:12].upper()
        
        while db.query(QRCode).filter(QRCode.code == unique_code).first():
            salt = uuid.uuid4().hex[:8]
            unique_code = hashlib.sha256(f"{sku}-{current_serial}-{salt}".encode()).hexdigest()[:12].upper()
        
        db_qr = QRCode(product_id=product_id, code=unique_code, serial_number=current_serial)
        db.add(db_qr)
        generated_codes.append(db_qr)
    
    db.commit()
    
    return {
        "message": f"Generated {quantity} QR codes",
        "codes": [QRCodeResponse.model_validate(qr) for qr in generated_codes]
    }

@router.get("/products/{product_id}/qr-image/{code}")
async def get_qr_image(product_id: int, code: str, db: Session = Depends(get_db)):
    """Generate and return a single QR code image"""
    from fastapi.responses import StreamingResponse
    from app.services.qr_service import qr_service
    
    # Verify QR code exists for this product
    qr = db.query(QRCode).filter(QRCode.product_id == product_id, QRCode.code == code).first()
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    img_buffer = qr_service.generate_qr_image(qr.code)
    return StreamingResponse(img_buffer, media_type="image/png")

@router.post("/products/{product_id}/generate-pdf-batch")
async def generate_pdf_batch(product_id: int, quantity: int, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """Generate multiple QR codes and return PDF immediately"""
    from fastapi.responses import StreamingResponse
    from app.services.qr_service import qr_service
    from app.config import settings

    # Verify product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Validate quantity
    if quantity < 1 or quantity > 500:
        raise HTTPException(status_code=400, detail="Quantity must be between 1 and 500")
    
    # 1. Determine Serial Start and Batch Number
    # Get last serial number for this product
    last_qr = db.query(QRCode).filter(QRCode.product_id == product_id).order_by(QRCode.serial_number.desc()).first()
    serial_start = (last_qr.serial_number + 1) if last_qr and last_qr.serial_number else 1
    
    # Get last batch number
    last_batch = db.query(QRBatch).filter(QRBatch.product_id == product_id).order_by(QRBatch.batch_number.desc()).first()
    next_batch_num = (last_batch.batch_number + 1) if last_batch else 1
    
    # 2. Create the Batch record
    db_batch = QRBatch(
        product_id=product_id,
        batch_number=next_batch_num,
        quantity=quantity,
        serial_start=serial_start,
        serial_end=serial_start + quantity - 1
    )
    db.add(db_batch)
    db.flush() # Get batch ID
    
    # 3. Generate new codes in DB
    generated_qr_objects = []
    base_url = settings.FRONTEND_URL.rstrip('/')
    sku = (product.sku_prefix or "QR").upper()
    import hashlib
    
    for i in range(quantity):
        current_serial = serial_start + i
        
        # Security: Create an Opaque Token (looks encrypted) instead of SKU-SERIAL
        # This makes it impossible for users to guess the next code
        salt = uuid.uuid4().hex[:8]
        raw_seed = f"{sku}-{current_serial}-{salt}"
        unique_validator = hashlib.sha256(raw_seed.encode()).hexdigest()[:12].upper()
        
        db_qr = QRCode(
            product_id=product_id, 
            batch_id=db_batch.id,
            code=unique_validator,
            serial_number=current_serial
        )
        db.add(db_qr)
        generated_qr_objects.append(db_qr)
    
    db.commit()
    
    # 3. Prepare data for PDF
    qr_data = [(qr.code, f"{base_url}/p/{qr.code}") for qr in generated_qr_objects]
    
    # 4. Generate PDF in memory (RAM)
    batch_info = {
        "number": db_batch.batch_number,
        "serial_start": db_batch.serial_start,
        "serial_end": db_batch.serial_end
    }
    pdf_buffer = qr_service.generate_bulk_pdf(qr_data, product.name, batch_info=batch_info)
    
    filename = f"QR_{quantity}_{product.name.replace(' ', '_')}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/companies/{company_id}/batches")
async def get_company_batches(company_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """Get all QR generation batches for all products of a company"""
    batches = db.query(QRBatch).join(Product).filter(Product.company_id == company_id).order_by(QRBatch.created_at.desc()).all()
    
    return [
        {
            "id": b.id,
            "product_id": b.product_id,
            "product_name": b.product.name,
            "batch_number": b.batch_number,
            "quantity": b.quantity,
            "serial_start": b.serial_start,
            "serial_end": b.serial_end,
            "created_at": b.created_at
        } for b in batches
    ]

@router.get("/products/{product_id}/batches")
async def get_product_batches(product_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """Get all QR generation batches for a product"""
    batches = db.query(QRBatch).filter(QRBatch.product_id == product_id).order_by(QRBatch.created_at.desc()).all()
    return [
        {
            "id": b.id,
            "product_id": b.product_id,
            "product_name": b.product.name,
            "batch_number": b.batch_number,
            "quantity": b.quantity,
            "serial_start": b.serial_start,
            "serial_end": b.serial_end,
            "created_at": b.created_at
        } for b in batches
    ]

@router.get("/products/{product_id}/qr-codes", response_model=List[QRCodeResponse])
async def get_product_qr_codes(product_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    return db.query(QRCode).filter(QRCode.product_id == product_id).all()

@router.get("/products/{product_id}/qr-pdf")
async def download_qr_pdf(product_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """Download existing QR codes as PDF"""
    from fastapi.responses import StreamingResponse
    from app.services.qr_service import qr_service
    from app.config import settings
    
    # Get product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get all QR codes for this product
    qr_codes = db.query(QRCode).filter(QRCode.product_id == product_id).all()
    
    if not qr_codes:
        raise HTTPException(status_code=404, detail="No QR codes found for this product")
    
    # Prepare data for PDF using config URL
    base_url = settings.FRONTEND_URL.rstrip('/')
    qr_data = [(qr.code, f"{base_url}/p/{qr.code}") for qr in qr_codes]
    
    # Generate PDF
    pdf_buffer = qr_service.generate_bulk_pdf(qr_data, product.name)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=qr_codes_{product.name.replace(' ', '_')}.pdf"}
    )
