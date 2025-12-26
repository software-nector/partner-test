import os
import sys
from sqlalchemy.orm import Session
from argon2 import PasswordHasher
from dotenv import load_dotenv

# Set up path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models.user import User

# Load environment variables
load_dotenv()

# Password hashing with Argon2
ph = PasswordHasher()

def add_admin():
    # Admin credentials
    admin_email = "software1.nector@gmail.com"
    admin_password = "Admin123"
    admin_phone = "7554545545"
    admin_name = "Admin"

    db: Session = SessionLocal()
    try:
        print(f"Connecting to database...")
        
        # Hash the password
        password_hash = ph.hash(admin_password)
        print(f"[DEBUG] Generated Argon2 hash")

        # Check if admin exists
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if admin:
            # Update existing admin
            admin.password_hash = password_hash
            admin.is_admin = True
            admin.phone = admin_phone
            admin.name = admin_name
            print(f"✅ Existing admin user '{admin_email}' found. Updating credentials...")
        else:
            # Create new admin
            admin = User(
                email=admin_email,
                password_hash=password_hash,
                phone=admin_phone,
                name=admin_name,
                is_admin=True
            )
            db.add(admin)
            print(f"✅ Creating new admin user '{admin_email}'...")
        
        db.commit()
        print(f"\n" + "="*60)
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
        print(f"="*60)
        print(f"\nSUCCESS: Admin user is ready.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    add_admin()
