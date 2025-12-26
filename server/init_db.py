import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from app.database import Base
from app.models import User, Coupon, Reward, Reel, Company, Product, QRCode

load_dotenv()
db_url = os.getenv("DATABASE_URL")

engine = create_engine(db_url)

print("Creating tables in Hostinger MySQL (All Models)...")
try:
    Base.metadata.create_all(bind=engine)
    print("SUCCESS: All tables created successfully!")
except Exception as e:
    print(f"FAILED: Error creating tables: {str(e)}")
