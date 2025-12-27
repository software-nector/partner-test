from sqlalchemy import create_engine, text
from app.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    print(f"Connecting to {settings.DATABASE_URL}...")
    
    with engine.connect() as conn:
        def add_column(table, column, type_def):
            try:
                print(f"Adding '{column}' to '{table}'...")
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {type_def}"))
                conn.commit()
                print(f"Successfully added '{column}'.")
            except Exception as e:
                conn.rollback()
                if "1060" in str(e) or "Duplicate column name" in str(e):
                    print(f"'{column}' already exists in '{table}'.")
                else:
                    print(f"Error adding '{column}' to '{table}': {e}")

        # 1. Products table
        add_column("products", "cashback_amount", "FLOAT DEFAULT 100.0")

        # 2. Rewards table
        add_column("rewards", "coupon_code", "VARCHAR(50)")
        add_column("rewards", "admin_notes", "TEXT")

        # 3. Reels table
        add_column("reels", "admin_notes", "TEXT")

        # 4. QR Codes table
        add_column("qr_codes", "last_scanned_at", "DATETIME")
        add_column("qr_codes", "is_used", "BOOLEAN DEFAULT FALSE")

    print("Migration finished!")

if __name__ == "__main__":
    migrate()
