import sqlite3

# Connect to database
conn = sqlite3.connect('purna_gummies.db')
cursor = conn.cursor()

try:
    # Add platform_name column
    cursor.execute("ALTER TABLE rewards ADD COLUMN platform_name VARCHAR(50)")
    print("✅ Added platform_name column")
except Exception as e:
    if "duplicate column name" in str(e).lower():
        print("ℹ️  platform_name column already exists")
    else:
        print(f"❌ Error adding platform_name: {e}")

try:
    # Add screenshot_quality column
    cursor.execute("ALTER TABLE rewards ADD COLUMN screenshot_quality VARCHAR(20)")
    print("✅ Added screenshot_quality column")
except Exception as e:
    if "duplicate column name" in str(e).lower():
        print("ℹ️  screenshot_quality column already exists")
    else:
        print(f"❌ Error adding screenshot_quality: {e}")

conn.commit()
conn.close()

print("\n✅ Database migration completed!")
print("Now run: python add_dummy_rewards.py")
