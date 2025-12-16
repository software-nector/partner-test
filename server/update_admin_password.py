import sqlite3
from argon2 import PasswordHasher

# Password hasher
ph = PasswordHasher()

# Connect to database
conn = sqlite3.connect('purna_gummies.db')
cursor = conn.cursor()

# Admin credentials
admin_email = "software1.nector@gmail.com"
admin_password = "Admin123"

try:
    # Hash password with argon2
    hashed_password = ph.hash(admin_password)
    
    # Check if admin exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (admin_email,))
    existing = cursor.fetchone()
    
    if existing:
        # Update existing admin with new argon2 hash
        cursor.execute("""
            UPDATE users 
            SET password_hash = ?, is_admin = 1, otp_attempts = 0
            WHERE email = ?
        """, (hashed_password, admin_email))
        conn.commit()
        print(f"✅ Admin password updated with Argon2 hash!")
    else:
        # Insert new admin
        cursor.execute("""
            INSERT INTO users (phone, name, email, password_hash, is_admin, otp_attempts)
            VALUES (?, ?, ?, ?, 1, 0)
        """, ("0000000000", "Admin", admin_email, hashed_password))
        print(f"✅ Admin user created with Argon2 hash!")
    
    conn.commit()
    
    print(f"\n" + "="*60)
    print(f"📧 Email: {admin_email}")
    print(f"🔑 Password: {admin_password}")
    print(f"🔐 Hash Method: Argon2 (Python 3.13 compatible)")
    print(f"="*60)
    print(f"\n🔗 Login at: http://localhost:3000/admin/login")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    conn.close()
