from sqlalchemy import create_engine, text
from app.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    print(f"Connecting to {settings.DATABASE_URL}...")
    
    with engine.connect() as conn:
        def get_columns(table):
            try:
                result = conn.execute(text(f"DESCRIBE {table}"))
                return [row[0] for row in result.fetchall()]
            except Exception:
                return []

        def fix_table(table, column_defs):
            print(f"\nChecking table: {table}")
            existing = get_columns(table)
            print(f"Existing columns: {', '.join(existing)}")
            
            for col, dtype in column_defs.items():
                if col not in existing:
                    try:
                        print(f"Adding '{col}' to '{table}'...")
                        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {dtype}"))
                        conn.commit()
                        print(f"Success: Added {col}")
                    except Exception as e:
                        conn.rollback()
                        print(f"Failed to add {col}: {e}")
                else:
                    print(f"Skipping: '{col}' already exists.")

        # 1. Products
        fix_table("products", {"cashback_amount": "FLOAT DEFAULT 100.0"})

        # 2. Rewards
        fix_table("rewards", {
            "coupon_code": "VARCHAR(50)",
            "admin_notes": "TEXT"
        })

        # 3. Reels
        fix_table("reels", {"admin_notes": "TEXT"})

        # 4. QR Codes
        fix_table("qr_codes", {
            "last_scanned_at": "DATETIME",
            "is_used": "BOOLEAN DEFAULT FALSE"
        })

    print("Migration finished!")

if __name__ == "__main__":
    migrate()
