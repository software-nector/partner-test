"""
Add rejection_reason column to rewards and reels tables
"""
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

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

try:
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    print(f"✅ Connected to MySQL: {database}")
    
    with connection.cursor() as cursor:
        # Check if rejection_reason column exists in rewards table
        cursor.execute("DESCRIBE rewards")
        rewards_columns = [col['Field'] for col in cursor.fetchall()]
        
        if 'rejection_reason' not in rewards_columns:
            print("\n➕ Adding rejection_reason to rewards table...")
            cursor.execute("ALTER TABLE rewards ADD COLUMN rejection_reason TEXT AFTER status")
            print("✅ rejection_reason added to rewards")
        else:
            print("\n✅ rejection_reason already exists in rewards")
        
        # Check if rejection_reason column exists in reels table
        cursor.execute("DESCRIBE reels")
        reels_columns = [col['Field'] for col in cursor.fetchall()]
        
        if 'rejection_reason' not in reels_columns:
            print("\n➕ Adding rejection_reason to reels table...")
            cursor.execute("ALTER TABLE reels ADD COLUMN rejection_reason TEXT AFTER status")
            print("✅ rejection_reason added to reels")
        else:
            print("\n✅ rejection_reason already exists in reels")
        
        # Make product_name NOT NULL in reels if it's nullable
        cursor.execute("DESCRIBE reels")
        reels_cols = cursor.fetchall()
        product_col = next((col for col in reels_cols if col['Field'] == 'product_name'), None)
        
        if product_col and product_col['Null'] == 'YES':
            print("\n🔧 Making product_name required in reels...")
            cursor.execute("ALTER TABLE reels MODIFY COLUMN product_name VARCHAR(200) NOT NULL")
            print("✅ product_name is now required")
        
        connection.commit()
        print("\n✅ Database migration completed!")
        
        # Show updated table structures
        print("\n📋 Rewards table structure:")
        cursor.execute("DESCRIBE rewards")
        for col in cursor.fetchall():
            if col['Field'] in ['status', 'rejection_reason', 'admin_notes']:
                nullable = "NULL" if col['Null'] == 'YES' else "NOT NULL"
                print(f"  - {col['Field']} ({col['Type']}) - {nullable}")
        
        print("\n📋 Reels table structure:")
        cursor.execute("DESCRIBE reels")
        for col in cursor.fetchall():
            if col['Field'] in ['status', 'rejection_reason', 'product_name', 'admin_notes']:
                nullable = "NULL" if col['Null'] == 'YES' else "NOT NULL"
                print(f"  - {col['Field']} ({col['Type']}) - {nullable}")

except pymysql.Error as e:
    print(f"\n❌ MySQL Error: {e}")
finally:
    if connection:
        connection.close()
        print("\n🔌 Database connection closed.")
