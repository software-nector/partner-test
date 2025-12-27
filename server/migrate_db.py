from sqlalchemy import create_engine, text
from app.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    print(f"Connecting to {settings.DATABASE_URL}...")
    
    with engine.connect() as conn:
        # 1. Products table
        try:
            print("Checking 'products' table...")
            conn.execute(text("ALTER TABLE products ADD COLUMN cashback_amount FLOAT DEFAULT 100.0"))
            conn.commit()
            print("Added 'cashback_amount' to 'products'.")
        except Exception as e:
            conn.rollback()
            if "Duplicate column name" in str(e) or "1060" in str(e):
                print("'cashback_amount' already exists in 'products'.")
            else:
                print(f"Error migrating 'products': {e}")

        # 2. Rewards table
        try:
            print("Checking 'rewards' table...")
            conn.execute(text("ALTER TABLE rewards ADD COLUMN coupon_code VARCHAR(50)"))
            conn.execute(text("ALTER TABLE rewards ADD COLUMN admin_notes TEXT"))
            conn.commit()
            print("Added columns to 'rewards'.")
        except Exception as e:
            conn.rollback()
            if "Duplicate column name" in str(e) or "1060" in str(e):
                print("Columns already exist in 'rewards'.")
            else:
                print(f"Error migrating 'rewards': {e}")

        # 3. Reels table
        try:
            print("Checking 'reels' table...")
            conn.execute(text("ALTER TABLE reels ADD COLUMN admin_notes TEXT"))
            conn.commit()
            print("Added 'admin_notes' to 'reels'.")
        except Exception as e:
            conn.rollback()
            if "Duplicate column name" in str(e) or "1060" in str(e):
                print("'admin_notes' already exists in 'reels'.")
            else:
                print(f"Error migrating 'reels': {e}")

        # 4. QR Codes table
        try:
            print("Checking 'qr_codes' table...")
            conn.execute(text("ALTER TABLE qr_codes ADD COLUMN last_scanned_at DATETIME"))
            conn.execute(text("ALTER TABLE qr_codes ADD COLUMN is_used BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Added columns to 'qr_codes'.")
        except Exception as e:
            conn.rollback()
            if "Duplicate column name" in str(e) or "1060" in str(e):
                print("Columns already exist in 'qr_codes'.")
            else:
                print(f"Error migrating 'qr_codes': {e}")

    print("Migration finished!")

if __name__ == "__main__":
    migrate()
