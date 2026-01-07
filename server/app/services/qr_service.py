"""
QR Code Generation Service
Handles QR code image generation and PDF export
"""
import qrcode
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from typing import List, Tuple
from app.config import settings
import os
from datetime import datetime


class QRCodeService:
    """Service for generating QR code images and PDFs"""
    
    def __init__(self):
        self.base_url = settings.FRONTEND_URL.rstrip('/')
    
    def generate_qr_image(self, url: str, size: int = 300) -> BytesIO:
        """
        Generate QR code image from a raw URL
        
        Args:
            url: The exact URL to embed in the QR
            size: Image size in pixels
            
        Returns:
            BytesIO object containing PNG image
        """
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        
        # Add data
        qr.add_data(url)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return buffer
    
    def generate_bulk_pdf(
        self, 
        qr_codes: List[Tuple[str, str, str]], 
        product_name: str,
        batch_info: dict = None,
        cols: int = 4,
        rows: int = 6
    ) -> BytesIO:
        """
        Generate PDF with QR codes in grid layout
        
        Args:
            qr_codes: List of (code, url) tuples
            product_name: Product name to display
            batch_info: Metadata about the batch (number, date, etc.)
            cols: Number of columns (default 4)
            rows: Number of rows (default 6)
        """
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        
        margin = 15 * mm
        usable_width = width - (2 * margin)
        usable_height = height - (2 * margin)
        
        cell_width = usable_width / cols
        cell_height = usable_height / rows
        
        # QR code size
        qr_size = min(cell_width, cell_height) * 0.65
        
        codes_per_page = cols * rows
        total_pages = (len(qr_codes) + codes_per_page - 1) // codes_per_page
        
        for page in range(total_pages):
            if page > 0:
                c.showPage()
            
            # 2. Grid Placement
            start_idx = page * codes_per_page
            end_idx = min(start_idx + codes_per_page, len(qr_codes))
            
            for idx in range(start_idx, end_idx):
                code, url, label = qr_codes[idx]
                
                grid_idx = idx - start_idx
                col = grid_idx % cols
                row = grid_idx // cols
                
                x = margin + (col * cell_width) + (cell_width - qr_size) / 2
                y = height - margin - ((row + 1) * cell_height) + (cell_height - qr_size) / 2 + 5*mm
                
                # Draw "SCAN" above QR
                c.setFont("Helvetica-Bold", 11)
                c.drawCentredString(x + qr_size / 2, y + qr_size + 1*mm, "SCAN")
                
                # Draw QR image
                qr_img = self.generate_qr_image(url)
                c.drawImage(ImageReader(qr_img), x, y, width=qr_size, height=qr_size, preserveAspectRatio=True)
                
                # Draw SKU-Serial below QR
                text_y = y - 5*mm
                c.setFont("Helvetica-Bold", 12)
                c.drawCentredString(x + qr_size / 2, text_y, label)
                
                # End of cell
        
        c.save()
        buffer.seek(0)
        return buffer


# Create singleton instance
qr_service = QRCodeService()
