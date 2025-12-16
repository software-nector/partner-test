"""
Fix phone column to be nullable for Google OAuth users
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
    print("Current users table schema:")
    cursor.execute("PRAGMA table_info(users)")
    for column in cursor.fetchall():
        print(f"  - {column[1]} ({column[2]}) - NOT NULL: {column[3]}")
    
    print("\n⚠️ SQLite doesn't support ALTER COLUMN directly.")
    print("We need to recreate the table...")
    
    # Step 1: Create new table with correct schema
    print("\n1. Creating new users table...")
    cursor.execute("""
        CREATE TABLE users_new (
            id INTEGER PRIMARY KEY,
            phone VARCHAR(20) UNIQUE,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            password_hash VARCHAR(255),
            is_admin BOOLEAN DEFAULT 0,
            google_id VARCHAR(255) UNIQUE,
            profile_picture VARCHAR(500),
            otp_code VARCHAR(6),
            otp_expires_at DATETIME,
            otp_attempts INTEGER DEFAULT 0,
            created_at DATETIME,
            updated_at DATETIME
        )
    """)
    print("✅ New table created")
    
    # Step 2: Copy data from old table
    print("\n2. Copying data from old table...")
    cursor.execute("""
        INSERT INTO users_new 
        SELECT * FROM users
    """)
    rows_copied = cursor.rowcount
    print(f"✅ Copied {rows_copied} rows")
    
    # Step 3: Drop old table
    print("\n3. Dropping old table...")
    cursor.execute("DROP TABLE users")
    print("✅ Old table dropped")
    
    # Step 4: Rename new table
    print("\n4. Renaming new table...")
    cursor.execute("ALTER TABLE users_new RENAME TO users")
    print("✅ Table renamed")
    
    # Commit changes
    conn.commit()
    print("\n✅ Database migration completed successfully!")
    
    # Show updated schema
    print("\nUpdated users table schema:")
    cursor.execute("PRAGMA table_info(users)")
    for column in cursor.fetchall():
        nullable = "NULL" if column[3] == 0 else "NOT NULL"
        print(f"  - {column[1]} ({column[2]}) - {nullable}")

except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
    raise

finally:
    conn.close()
    print("\nDatabase connection closed.")
