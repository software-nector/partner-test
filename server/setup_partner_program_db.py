"""
Setup partner_program MySQL database with all required columns
"""
import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Parse DATABASE_URL
db_url = os.getenv('DATABASE_URL')
print(f"Database URL: {db_url}")

# Extract connection details
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

print(f"Connecting to MySQL: {user}@{host}")

try:
    # Connect to MySQL (without database first)
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    print("✅ Connected to MySQL successfully!")
    
    with connection.cursor() as cursor:
        # Create database if not exists
        print(f"\n📦 Creating database '{database}' if not exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✅ Database '{database}' ready")
        
        # Use the database
        cursor.execute(f"USE {database}")
        
        # Check if users table exists
        cursor.execute("SHOW TABLES LIKE 'users'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("\n📋 Creating users table with all columns...")
            cursor.execute("""
                CREATE TABLE users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    phone VARCHAR(20) UNIQUE,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    password_hash VARCHAR(255),
                    is_admin BOOLEAN DEFAULT 0,
                    google_id VARCHAR(255) UNIQUE,
                    profile_picture VARCHAR(500),
                    otp_code VARCHAR(6),
                    otp_expires_at DATETIME,
                    otp_attempts INT DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            print("✅ Users table created")
        else:
            print("\n⚠️ Users table already exists")
            print("📋 Checking and adding missing columns...")
            
            # Get current columns
            cursor.execute("DESCRIBE users")
            current_columns = cursor.fetchall()
            column_names = [col['Field'] for col in current_columns]
            
            # Add missing columns
            if 'email' not in column_names:
                print("  ➕ Adding 'email' column...")
                cursor.execute("ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE AFTER name")
            
            if 'google_id' not in column_names:
                print("  ➕ Adding 'google_id' column...")
                cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE AFTER is_admin")
            
            if 'profile_picture' not in column_names:
                print("  ➕ Adding 'profile_picture' column...")
                cursor.execute("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500) AFTER google_id")
            
            # Make phone nullable
            print("  🔧 Making phone column nullable...")
            cursor.execute("ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NULL")
            
            print("✅ All columns updated")
        
        # Create other tables
        print("\n📋 Creating other tables...")
        
        # Coupons table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                is_used BOOLEAN DEFAULT 0,
                user_id INT,
                used_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        # Rewards table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rewards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                video_id VARCHAR(50) NOT NULL,
                screenshot_path VARCHAR(255),
                status VARCHAR(20) DEFAULT 'pending',
                payment_amount DECIMAL(10,2),
                payment_status VARCHAR(20),
                transaction_id VARCHAR(100),
                payment_method VARCHAR(50),
                platform_name VARCHAR(50),
                screenshot_quality VARCHAR(20),
                verified_by INT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (verified_by) REFERENCES users(id)
            )
        """)
        
        # Reels table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                video_id VARCHAR(50) NOT NULL,
                reel_url VARCHAR(500),
                screenshot_path VARCHAR(255),
                status VARCHAR(20) DEFAULT 'pending',
                shipping_address TEXT,
                tracking_number VARCHAR(100),
                verified_by INT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (verified_by) REFERENCES users(id)
            )
        """)
        
        print("✅ All tables created/updated")
        
        # Commit changes
        connection.commit()
        print("\n✅ Database setup completed successfully!")
        
        # Show all tables
        print("\n📋 Tables in database:")
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        for table in tables:
            table_name = list(table.values())[0]
            print(f"  - {table_name}")
        
        # Show users table structure
        print("\n📋 Users table structure:")
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        for col in columns:
            nullable = "NULL" if col['Null'] == 'YES' else "NOT NULL"
            print(f"  - {col['Field']} ({col['Type']}) - {nullable}")

except pymysql.Error as e:
    print(f"\n❌ MySQL Error: {e}")
    
finally:
    if connection:
        connection.close()
        print("\n🔌 Database connection closed.")
