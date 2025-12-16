"""
Add admin user to MySQL partner_program database
"""
import pymysql
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Admin credentials
admin_email = "software1.nector@gmail.com"
admin_password = "Admin123"
admin_phone = "7554545545"
admin_name = "Admin"

# Generate fresh bcrypt hash
password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
print(f"[DEBUG] Generated password hash: {password_hash}")

# Parse DATABASE_URL
db_url = os.getenv('DATABASE_URL')
connection_string = db_url.replace('mysql+pymysql://', '')

if '@' in connection_string:
    user_pass, host_db = connection_string.split('@')
    if ':' in user_pass:
        user, password = user_pass.split(':')
    else:
        user = user_pass
        password = ''
    
    host, database = host_db.split('/')
else:
    print("Error: Invalid DATABASE_URL format")
    exit(1)

try:
    # Connect to MySQL
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    print(f"✅ Connected to MySQL database: {database}")
    
    with connection.cursor() as cursor:
        # Check if admin exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (admin_email,))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing admin
            cursor.execute("""
                UPDATE users 
                SET password_hash = %s, is_admin = 1, otp_attempts = 0
                WHERE email = %s
            """, (password_hash, admin_email))
            print(f"✅ Admin user updated!")
        else:
            # Insert new admin
            cursor.execute("""
                INSERT INTO users (phone, name, email, password_hash, is_admin, otp_attempts)
                VALUES (%s, %s, %s, %s, 1, 0)
            """, (admin_phone, admin_name, admin_email, password_hash))
            print(f"✅ Admin user created!")
        
        connection.commit()
        
        print(f"\n" + "="*60)
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: Admin123")
        print(f"="*60)
        print(f"\n🔗 Login at: http://localhost:3000/admin/login")
        print(f"\n⚠️  Next Steps:")
        print(f"   1. Update server/.env with Gmail SMTP credentials")
        print(f"   2. Test login with above credentials")
        print(f"   3. Check email for OTP")
        
except pymysql.Error as e:
    print(f"❌ MySQL Error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    if connection:
        connection.close()
        print(f"\n🔌 Database connection closed.")
