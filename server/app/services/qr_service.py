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
import os


class QRCodeService:
    """Service for generating QR code images and PDFs"""
    
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
    
    def generate_qr_image(self, code: str, size: int = 300) -> BytesIO:
        """
        Generate QR code image
        
        Args:
            code: Unique QR code string
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
        
        # Add data (product page URL)
        url = f"{self.base_url}/p/{code}"
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
        qr_codes: List[Tuple[str, str]], 
        product_name: str,
        cols: int = 4,
        rows: int = 6
    ) -> BytesIO:
        """
        Generate PDF with QR codes in grid layout
        
        Args:
            qr_codes: List of (code, url) tuples
            product_name: Product name to display
            cols: Number of columns (default 4)
            rows: Number of rows (default 6)
            
        Returns:
            BytesIO object containing PDF
        """
        buffer = BytesIO()
        
        # Create PDF canvas (A4 size)
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        
        # Calculate grid dimensions
        margin = 15 * mm
        usable_width = width - (2 * margin)
        usable_height = height - (2 * margin)
        
        cell_width = usable_width / cols
        cell_height = usable_height / rows
        
        # QR code size (slightly smaller than cell to leave padding)
        qr_size = min(cell_width, cell_height) * 0.7
        
        # Generate QR codes and place in grid
        codes_per_page = cols * rows
        total_pages = (len(qr_codes) + codes_per_page - 1) // codes_per_page
        
        for page in range(total_pages):
            if page > 0:
                c.showPage()
            
            # Add header
            c.setFont("Helvetica-Bold", 14)
            c.drawCentredString(width / 2, height - 10*mm, f"{product_name} - QR Codes")
            c.setFont("Helvetica", 8)
            c.drawCentredString(width / 2, height - 15*mm, f"Page {page + 1} of {total_pages}")
            
            # Draw grid
            start_idx = page * codes_per_page
            end_idx = min(start_idx + codes_per_page, len(qr_codes))
            
            for idx in range(start_idx, end_idx):
                code, url = qr_codes[idx]
                
                # Calculate position
                grid_idx = idx - start_idx
                col = grid_idx % cols
                row = grid_idx // cols
                
                x = margin + (col * cell_width) + (cell_width - qr_size) / 2
                y = height - margin - ((row + 1) * cell_height) + (cell_height - qr_size) / 2
                
                # Generate QR image
                qr_img = self.generate_qr_image(code)
                
                # Draw QR code
                c.drawImage(
                    ImageReader(qr_img),
                    x, y,
                    width=qr_size,
                    height=qr_size,
                    preserveAspectRatio=True
                )
                
                # Draw code text below QR
                text_y = y - 8*mm
                c.setFont("Helvetica-Bold", 10)
                c.drawCentredString(
                    x + qr_size / 2,
                    text_y,
                    code
                )
                
                # Draw URL below code
                c.setFont("Helvetica", 6)
                c.drawCentredString(
                    x + qr_size / 2,
                    text_y - 4*mm,
                    url
                )
        
        c.save()
        buffer.seek(0)
        return buffer


# Create singleton instance
qr_service = QRCodeService()
