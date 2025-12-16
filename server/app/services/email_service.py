import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from app.config import settings

class EmailService:
    """Service for sending emails via SMTP (Gmail)"""
    
    @staticmethod
    def generate_otp() -> str:
        """Generate a 6-digit OTP"""
        return str(random.randint(100000, 999999))
    
    @staticmethod
    def send_otp_email(to_email: str, otp: str) -> bool:
        """Send OTP via email"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = "Your Admin Login OTP - Purna Gummies"
            message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            message["To"] = to_email
            
            # HTML email template
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .header {{ text-align: center; margin-bottom: 30px; }}
                    .logo {{ font-size: 48px; }}
                    h1 {{ color: #333; margin: 10px 0; }}
                    .otp-box {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0; }}
                    .otp-code {{ font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; }}
                    .info {{ color: #666; font-size: 14px; line-height: 1.6; }}
                    .warning {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🍬</div>
                        <h1>Admin Login OTP</h1>
                    </div>
                    
                    <p class="info">Hello Admin,</p>
                    <p class="info">You have requested to login to the Purna Gummies Admin Panel. Please use the OTP below to complete your login:</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0; font-size: 14px;">Your OTP Code</p>
                        <div class="otp-code">{otp}</div>
                        <p style="margin: 0; font-size: 12px;">Valid for {settings.OTP_EXPIRY_MINUTES} minutes</p>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong><br>
                        • Do not share this OTP with anyone<br>
                        • This OTP will expire in {settings.OTP_EXPIRY_MINUTES} minutes<br>
                        • Maximum {settings.MAX_OTP_ATTEMPTS} attempts allowed
                    </div>
                    
                    <p class="info">If you did not request this OTP, please ignore this email or contact support immediately.</p>
                    
                    <div class="footer">
                        <p>© 2024 Purna Gummies. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Attach HTML content
            part = MIMEText(html, "html")
            message.attach(part)
            
            # Send email via Gmail SMTP
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()  # Secure connection
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
            
            return True
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False
    
    @staticmethod
    def calculate_otp_expiry() -> datetime:
        """Calculate OTP expiry time"""
        return datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)

# Create singleton instance
email_service = EmailService()
