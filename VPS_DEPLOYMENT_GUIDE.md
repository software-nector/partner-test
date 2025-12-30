# VPS Deployment Guide - Purna Cashback System

## Prerequisites
- VPS with Ubuntu 20.04+ (DigitalOcean, AWS, Linode, etc.)
- Domain name (e.g., partner.mypurna.com)
- MySQL database
- SSH access to VPS

---

## Part 1: GitHub Upload

### 1. Initialize Git (if not done)
```bash
cd "d:\Purna Cashback"
git init
git add .
git commit -m "Initial commit: Purna Cashback System with AI verification"
```

### 2. Create GitHub Repository
- Go to https://github.com/new
- Repository name: `purna-cashback`
- Keep it **Private** (recommended)
- Don't initialize with README

### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/purna-cashback.git
git branch -M main
git push -u origin main
```

**IMPORTANT:** `.env` files will NOT be uploaded (they're in `.gitignore`)

---

## Part 2: VPS Server Setup

### Step 1: Connect to VPS
```bash
ssh root@your-vps-ip
```

### Step 2: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Python 3.10+
apt install python3.10 python3.10-venv python3-pip -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y

# Install MySQL
apt install mysql-server -y

# Install Nginx
apt install nginx -y

# Install Git
apt install git -y
```

### Step 3: Clone Repository
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/purna-cashback.git
cd purna-cashback
```

---

## Part 3: Backend Setup

### Step 1: Create Virtual Environment
```bash
cd /var/www/purna-cashback/server
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Create `.env` File
```bash
nano .env
```

**Paste this (replace with your actual values):**
```env
# Database
DATABASE_URL=mysql+pymysql://username:password@localhost/purna_cashback

# Security
SECRET_KEY=your-super-secret-key-here-min-32-chars

# OpenAI (for AI verification)
OPENAI_API_KEY=sk-proj-your-actual-openai-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://partner.mypurna.com/auth/google/callback

# URLs
FRONTEND_URL=https://partner.mypurna.com
BACKEND_URL=https://partner.mypurna.com
```

Save: `Ctrl+O`, Exit: `Ctrl+X`

### Step 4: Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE purna_cashback;
CREATE USER 'purna_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON purna_cashback.* TO 'purna_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Run Migrations
```bash
cd /var/www/purna-cashback/server
source venv/bin/activate
alembic upgrade head
```

### Step 6: Create Systemd Service
```bash
nano /etc/systemd/system/purna-backend.service
```

**Paste:**
```ini
[Unit]
Description=Purna Cashback Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/purna-cashback/server
Environment="PATH=/var/www/purna-cashback/server/venv/bin"
ExecStart=/var/www/purna-cashback/server/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

**Start Service:**
```bash
systemctl daemon-reload
systemctl enable purna-backend
systemctl start purna-backend
systemctl status purna-backend
```

---

## Part 4: Frontend Setup

### Step 1: Build Frontend
```bash
cd /var/www/purna-cashback/client

# Create .env file
nano .env
```

**Paste:**
```env
VITE_API_URL=https://partner.mypurna.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Build:**
```bash
npm install
npm run build
```

### Step 2: Configure Nginx
```bash
nano /etc/nginx/sites-available/purna-cashback
```

**Paste:**
```nginx
server {
    listen 80;
    server_name partner.mypurna.com;

    # Frontend (React build)
    location / {
        root /var/www/purna-cashback/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Auth endpoints
    location /auth {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files (uploads)
    location /uploads {
        alias /var/www/purna-cashback/server/uploads;
    }
}
```

**Enable site:**
```bash
ln -s /etc/nginx/sites-available/purna-cashback /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Part 5: SSL Certificate (HTTPS)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d partner.mypurna.com

# Auto-renewal (already setup by certbot)
```

---

## Part 6: Post-Deployment

### 1. Create Admin User
```bash
cd /var/www/purna-cashback/server
source venv/bin/activate
python3
```

```python
from app.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

db = SessionLocal()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

admin = User(
    email="admin@mypurna.com",
    phone="9876543210",
    password_hash=pwd_context.hash("YourStrongPassword123"),
    is_admin=True,
    is_verified=True
)

db.add(admin)
db.commit()
print("Admin created!")
exit()
```

### 2. Add Product URLs
- Login to Admin Dashboard
- Go to Product Hub
- Add Amazon/Flipkart/Meesho URLs for each product

### 3. Test Flow
1. Generate QR codes
2. Scan QR → Upload 5-star review
3. Check if AI auto-approves or sends to pending

---

## Maintenance Commands

### View Logs
```bash
# Backend logs
journalctl -u purna-backend -f

# Nginx logs
tail -f /var/log/nginx/error.log
```

### Update Code
```bash
cd /var/www/purna-cashback
git pull origin main

# Backend
cd server
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
systemctl restart purna-backend

# Frontend
cd ../client
npm install
npm run build
systemctl restart nginx
```

### Database Backup
```bash
mysqldump -u purna_user -p purna_cashback > backup_$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Backend not starting?
```bash
systemctl status purna-backend
journalctl -u purna-backend -n 50
```

### Database connection error?
- Check `DATABASE_URL` in `.env`
- Verify MySQL is running: `systemctl status mysql`

### AI verification not working?
- Check `OPENAI_API_KEY` in `.env`
- View logs: `journalctl -u purna-backend | grep "OpenAI"`

---

## Security Checklist
- ✅ `.env` files are NOT in GitHub
- ✅ Strong MySQL password
- ✅ SSL certificate installed
- ✅ Firewall configured (UFW)
- ✅ Regular backups scheduled

**Your system is now LIVE!** 🚀
