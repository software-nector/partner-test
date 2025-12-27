from sqlalchemy import create_engine, text
from app.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    print(f"Connecting to {settings.DATABASE_URL}...")
    
    with engine.connect() as conn:
        try:
            print("Adding 'cashback_amount' column to 'products' table...")
            conn.execute(text("ALTER TABLE products ADD COLUMN cashback_amount FLOAT DEFAULT 100.0"))
            conn.commit()
            print("Successfully added 'cashback_amount' column.")
        except Exception as e:
            if "Duplicate column name" in str(e) or "1060" in str(e):
                print("Column 'cashback_amount' already exists.")
            else:
                print(f"Error migrating: {e}")

if __name__ == "__main__":
    migrate()
