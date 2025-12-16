# MySQL Database Setup Guide

## Prerequisites

1. **Install MySQL**
   - Download from: https://dev.mysql.com/downloads/installer/
   - Or use XAMPP/WAMP which includes MySQL

2. **Start MySQL Server**
   - If using XAMPP: Start MySQL from control panel
   - If standalone: MySQL should auto-start

## Database Setup

### Step 1: Create Database

Open MySQL command line or phpMyAdmin and run:

```sql
CREATE DATABASE purna_gummies CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Create User (Optional)

```sql
CREATE USER 'purna_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON purna_gummies.* TO 'purna_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Update .env File

Edit `server/.env`:

**For root user (no password):**
```env
DATABASE_URL=mysql+pymysql://root:@localhost:3306/purna_gummies
```

**For root user (with password):**
```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/purna_gummies
```

**For custom user:**
```env
DATABASE_URL=mysql+pymysql://purna_user:your_password@localhost:3306/purna_gummies
```

## Connection String Format

```
mysql+pymysql://username:password@host:port/database_name
```

- **username**: MySQL username (default: `root`)
- **password**: MySQL password (leave empty if no password)
- **host**: Server address (default: `localhost`)
- **port**: MySQL port (default: `3306`)
- **database_name**: Database name (`purna_gummies`)

## Create Tables

After updating `.env`, run the FastAPI server to auto-create tables:

```bash
cd "d:\Purna Cashback\server"
uvicorn app.main:app --reload
```

SQLAlchemy will automatically create all tables based on your models.

## Verify Connection

1. Start the server
2. Check terminal for connection messages
3. Visit: http://localhost:8000/docs
4. Try any API endpoint

## Common Issues

### Issue: "Access denied for user"
**Solution**: Check username/password in DATABASE_URL

### Issue: "Unknown database 'purna_gummies'"
**Solution**: Create database first using SQL command above

### Issue: "Can't connect to MySQL server"
**Solution**: 
- Make sure MySQL is running
- Check if port 3306 is correct
- Try `localhost` instead of `127.0.0.1` or vice versa

### Issue: "No module named 'pymysql'"
**Solution**: 
```bash
pip install pymysql cryptography
```

## Database Tables

The following tables will be auto-created:

1. **users** - User accounts
2. **coupons** - Coupon codes
3. **rewards** - Reward claims
4. **reels** - Reel submissions

## Viewing Data

**Option 1: phpMyAdmin**
- If using XAMPP: http://localhost/phpmyadmin

**Option 2: MySQL Workbench**
- Download from: https://dev.mysql.com/downloads/workbench/

**Option 3: Command Line**
```bash
mysql -u root -p
USE purna_gummies;
SHOW TABLES;
SELECT * FROM users;
```

## Next Steps

1. ✅ Install MySQL
2. ✅ Create database
3. ✅ Update .env file
4. ✅ Run server to create tables
5. ✅ Test API endpoints
