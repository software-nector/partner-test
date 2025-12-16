import sqlite3

# Connect to database
conn = sqlite3.connect('purna_gummies.db')
cursor = conn.cursor()

try:
    # Delete all existing rewards
    cursor.execute("DELETE FROM rewards")
    conn.commit()
    
    print("✅ All old rewards deleted!")
    print("Now run: python add_dummy_rewards.py")
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()
