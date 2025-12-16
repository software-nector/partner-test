"""
Add missing columns to MySQL users table for Google OAuth
"""
import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Parse DATABASE_URL
# Format: mysql+pymysql://root:password@localhost/purna_gummies
db_url = os.getenv('DATABASE_URL')
print(f"Database URL: {db_url}")

# Extract connection details
# Remove 'mysql+pymysql://'
connection_string = db_url.replace('mysql+pymysql://', '')

# Split user:pass@host/db
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

print(f"Connecting to MySQL: {user}@{host}/{database}")

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
    
    print("✅ Connected to MySQL successfully!")
    
    with connection.cursor() as cursor:
        # Check current columns
        print("\n📋 Current users table structure:")
        cursor.execute("DESCRIBE users")
        current_columns = cursor.fetchall()
        for col in current_columns:
            print(f"  - {col['Field']} ({col['Type']})")
        
        column_names = [col['Field'] for col in current_columns]
        
        # Add email column if missing
        if 'email' not in column_names:
            print("\n➕ Adding 'email' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE AFTER name")
            print("✅ email column added")
        else:
            print("\n⚠️ email column already exists")
        
        # Add google_id column if missing
        if 'google_id' not in column_names:
            print("\n➕ Adding 'google_id' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE AFTER is_admin")
            print("✅ google_id column added")
        else:
            print("\n⚠️ google_id column already exists")
        
        # Add profile_picture column if missing
        if 'profile_picture' not in column_names:
            print("\n➕ Adding 'profile_picture' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500) AFTER google_id")
            print("✅ profile_picture column added")
        else:
            print("\n⚠️ profile_picture column already exists")
        
        # Make phone column nullable if it's NOT NULL
        print("\n🔧 Making phone column nullable...")
        cursor.execute("ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NULL")
        print("✅ phone column is now nullable")
        
        # Commit changes
        connection.commit()
        print("\n✅ All changes committed successfully!")
        
        # Show updated structure
        print("\n📋 Updated users table structure:")
        cursor.execute("DESCRIBE users")
        updated_columns = cursor.fetchall()
        for col in updated_columns:
            nullable = "NULL" if col['Null'] == 'YES' else "NOT NULL"
            print(f"  - {col['Field']} ({col['Type']}) - {nullable}")

except pymysql.Error as e:
    print(f"\n❌ MySQL Error: {e}")
    
finally:
    if connection:
        connection.close()
        print("\n🔌 Database connection closed.")
