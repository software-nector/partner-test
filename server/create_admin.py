"""
Simple script to create admin user - Fixed version
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Database URL
DATABASE_URL = "sqlite:///./purna_gummies.db"

# Create engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin():
    db = SessionLocal()
    
    # Admin credentials - CHANGE THESE!
    admin_email = "software1.nector@gmail.com"
    admin_password = "Admin123"  # Simple password for testing
    
    try:
        # Hash password (bcrypt automatically handles length)
        hashed_password = pwd_context.hash(admin_password)
        
        # Check if admin exists using text()
        result = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": admin_email}
        ).fetchone()
        
        if result:
            # Update existing admin
            db.execute(
                text("UPDATE users SET password_hash = :password, is_admin = 1 WHERE email = :email"),
                {"password": hashed_password, "email": admin_email}
            )
            db.commit()
            print(f"✅ Admin password updated!")
        else:
            # Insert new admin using text()
            db.execute(
                text("""INSERT INTO users (phone, name, email, password_hash, is_admin, otp_attempts) 
                       VALUES (:phone, :name, :email, :password, :is_admin, :otp_attempts)"""),
                {
                    "phone": "0000000000",
                    "name": "Admin",
                    "email": admin_email,
                    "password": hashed_password,
                    "is_admin": 1,
                    "otp_attempts": 0
                }
            )
            db.commit()
            print(f"✅ Admin user created successfully!")
        
        print(f"\n" + "="*50)
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
        print(f"="*50)
        print(f"\n🔗 Login at: http://localhost:3000/admin/login")
        print(f"\n⚠️  Next Steps:")
        print(f"   1. Update .env with Gmail SMTP credentials:")
        print(f"      SMTP_USER=your-gmail@gmail.com")
        print(f"      SMTP_PASSWORD=your-16-digit-app-password")
        print(f"      ADMIN_EMAIL={admin_email}")
        print(f"   2. Get App Password: https://myaccount.google.com/apppasswords")
        print(f"   3. Test login!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
