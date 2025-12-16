"""
Add Google OAuth columns to users table
"""
import sqlite3
import os

# Get database path
db_path = os.path.join(os.path.dirname(__file__), 'purna_gummies.db')

print(f"Connecting to database: {db_path}")

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if columns already exist
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    print(f"Current columns: {columns}")
    
    # Add google_id column if it doesn't exist
    if 'google_id' not in columns:
        print("Adding google_id column...")
        cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)")
        print("✅ google_id column added")
    else:
        print("⚠️ google_id column already exists")
    
    # Add profile_picture column if it doesn't exist
    if 'profile_picture' not in columns:
        print("Adding profile_picture column...")
        cursor.execute("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500)")
        print("✅ profile_picture column added")
    else:
        print("⚠️ profile_picture column already exists")
    
    # Commit changes
    conn.commit()
    print("\n✅ Database migration completed successfully!")
    
    # Show updated schema
    cursor.execute("PRAGMA table_info(users)")
    print("\nUpdated users table schema:")
    for column in cursor.fetchall():
        print(f"  - {column[1]} ({column[2]})")

except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()

finally:
    conn.close()
    print("\nDatabase connection closed.")
