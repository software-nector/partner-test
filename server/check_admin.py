import sqlite3

conn = sqlite3.connect('purna_gummies.db')
cursor = conn.cursor()

# Check admin user
result = cursor.execute('''
    SELECT id, email, phone, name, is_admin, 
           CASE WHEN password_hash IS NOT NULL THEN 'YES' ELSE 'NO' END as has_password
    FROM users 
    WHERE email = "admin@purnagummies.com"
''').fetchone()

if result:
    print("✅ Admin User Found in Database!")
    print(f"   ID: {result[0]}")
    print(f"   Email: {result[1]}")
    print(f"   Phone: {result[2]}")
    print(f"   Name: {result[3]}")
    print(f"   Is Admin: {result[4]}")
    print(f"   Has Password: {result[5]}")
    print(f"\n📧 Login Email: {result[1]}")
    print(f"🔑 Login Password: Admin123")
else:
    print("❌ Admin user NOT found!")

conn.close()
