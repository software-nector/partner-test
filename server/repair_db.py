import sys
import os
from sqlalchemy import create_engine, text, inspect
from app.config import settings

def repair():
    engine = create_engine(settings.DATABASE_URL)
    
    print(f"Connecting to database: {settings.DATABASE_URL}")
    
    # Check for missing columns in rewards table
    with engine.connect() as conn:
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('rewards')]
        
        # Add coupon_code if missing
        if 'coupon_code' not in columns:
            print("Adding 'coupon_code' to 'rewards' table...")
            conn.execute(text("ALTER TABLE rewards ADD COLUMN coupon_code VARCHAR(255)"))
            conn.commit()
            
        # Add admin_notes if missing
        if 'admin_notes' not in columns:
            print("Adding 'admin_notes' to 'rewards' table...")
            conn.execute(text("ALTER TABLE rewards ADD COLUMN admin_notes TEXT"))
            conn.commit()
            
        # Check for user_id in reels
        reel_columns = [c['name'] for c in inspector.get_columns('reels')]
        if 'user_id' not in reel_columns:
            print("Adding 'user_id' to 'reels' table...")
            conn.execute(text("ALTER TABLE reels ADD COLUMN user_id INTEGER"))
            conn.commit()

        # Check for is_used in qr_codes
        qr_columns = [c['name'] for c in inspector.get_columns('qr_codes')]
        if 'is_used' not in qr_columns:
            print("Adding 'is_used' to 'qr_codes' table...")
            conn.execute(text("ALTER TABLE qr_codes ADD COLUMN is_used BOOLEAN DEFAULT FALSE"))
            conn.commit()

    print("Database repair complete. Metadata refreshed.")

if __name__ == "__main__":
    repair()
