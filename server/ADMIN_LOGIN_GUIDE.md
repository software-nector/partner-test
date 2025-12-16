# Admin Login Test Guide

## Current Setup

✅ **System Ready:**
- Backend API running on http://127.0.0.1:8000
- Frontend running on http://localhost:3000
- Admin login page: http://localhost:3000/admin/login
- Database: SQLite (purna_gummies.db)

## How It Works

### Step 1: Enter Email & Password
- User enters email and password
- System validates credentials from database
- **If wrong email/password → Error message shown ❌**
- **If correct → OTP sent to email ✅**

### Step 2: Enter OTP
- 6-digit OTP box appears
- User enters OTP received in email
- System verifies OTP
- **If correct OTP → Login successful! ✅**
- **If wrong OTP → Error message (3 attempts max) ❌**

## First Time Setup

### Option 1: Auto-Create Admin (First Login)
The system will automatically create an admin user on first login attempt:

1. Go to: http://localhost:3000/admin/login
2. Enter:
   - Email: `admin@purnagummies.com`
   - Password: `Admin123` (or any password you want)
3. Click "Send OTP"
4. System will create admin user and send OTP

### Option 2: Manual Database Entry
Run this SQL in your SQLite database:

```sql
INSERT INTO users (phone, name, email, password_hash, is_admin, otp_attempts) 
VALUES (
  '0000000000',
  'Admin',
  'admin@purnagummies.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ztP.eJ7Oe6ue',  -- Password: Admin123
  1,
  0
);
```

## Gmail SMTP Setup (Required for OTP)

Update `server/.env`:

```env
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-16-digit-app-password
SMTP_FROM_EMAIL=your-gmail@gmail.com
ADMIN_EMAIL=admin@purnagummies.com
```

Get App Password: https://myaccount.google.com/apppasswords

## Testing

### Test 1: Wrong Credentials
- Email: `wrong@email.com`
- Password: `anything`
- **Expected:** Error message "Not authorized as admin" ❌

### Test 2: Correct Email, Wrong Password
- Email: `admin@purnagummies.com`
- Password: `WrongPassword`
- **Expected:** Error message "Invalid email or password" ❌

### Test 3: Correct Credentials
- Email: `admin@purnagummies.com`
- Password: `Admin123`
- **Expected:** OTP sent message, OTP input box appears ✅

### Test 4: Wrong OTP
- Enter wrong 6-digit code
- **Expected:** Error "Invalid OTP. X attempts remaining" ❌

### Test 5: Correct OTP
- Enter correct OTP from email
- **Expected:** Login successful, redirect to dashboard ✅

## Security Features

- ✅ Password hashing (bcrypt)
- ✅ OTP expiration (10 minutes)
- ✅ Max 3 OTP attempts
- ✅ Email validation
- ✅ Admin-only access
- ✅ JWT token authentication

## Default Credentials

**Email:** admin@purnagummies.com  
**Password:** Admin123

⚠️ **Change these in production!**
