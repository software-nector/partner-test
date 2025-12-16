import sqlite3
from datetime import datetime, timedelta

# Connect to database
conn = sqlite3.connect('purna_gummies.db')
cursor = conn.cursor()

# Dummy reward data
dummy_rewards = [
    {
        'user_id': 1,
        'name': 'Rahul Kumar',
        'phone': '9876543210',
        'email': 'rahul@gmail.com',
        'address': '123, MG Road, Bangalore - 560001',
        'product_name': 'Purna Gummies - Mixed Fruit Pack',
        'purchase_date': (datetime.now() - timedelta(days=2)).isoformat(),
        'review_screenshot': 'https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Review+Screenshot+1',
        'status': 'pending',
        'upi_id': 'rahul@paytm',
        'payment_amount': 50.0,
        'platform_name': 'Amazon'
    },
    {
        'user_id': 1,
        'name': 'Priya Sharma',
        'phone': '9123456789',
        'email': 'priya@gmail.com',
        'address': '456, Park Street, Mumbai - 400001',
        'product_name': 'Purna Gummies - Strawberry Flavor',
        'purchase_date': (datetime.now() - timedelta(days=5)).isoformat(),
        'review_screenshot': 'https://via.placeholder.com/400x600/4ECDC4/FFFFFF?text=Review+Screenshot+2',
        'status': 'approved',
        'upi_id': 'priya@phonepe',
        'payment_amount': 75.0,
        'admin_notes': 'Screenshot verified. Approved for payment.',
        'platform_name': 'Flipkart'
    },
    {
        'user_id': 1,
        'name': 'Amit Patel',
        'phone': '9988776655',
        'email': 'amit@gmail.com',
        'address': '789, Nehru Nagar, Delhi - 110001',
        'product_name': 'Purna Gummies - Orange Burst',
        'purchase_date': (datetime.now() - timedelta(days=1)).isoformat(),
        'review_screenshot': 'https://via.placeholder.com/400x600/95E1D3/FFFFFF?text=Review+Screenshot+3',
        'status': 'approved',
        'upi_id': 'amit@gpay',
        'payment_amount': 60.0,
        'platform_name': 'Meesho'
    },
    {
        'user_id': 1,
        'name': 'Sneha Reddy',
        'phone': '9876512345',
        'email': 'sneha@gmail.com',
        'address': '321, Lake View, Hyderabad - 500001',
        'product_name': 'Purna Gummies - Mango Delight',
        'purchase_date': (datetime.now() - timedelta(days=10)).isoformat(),
        'review_screenshot': 'https://via.placeholder.com/400x600/F38181/FFFFFF?text=Review+Screenshot+4',
        'status': 'paid',
        'upi_id': 'sneha@paytm',
        'payment_amount': 50.0,
        'admin_notes': 'Payment sent successfully.',
        'payment_date': (datetime.now() - timedelta(days=3)).isoformat(),
        'platform_name': 'Amazon'
    },
    {
        'user_id': 1,
        'name': 'Vikram Singh',
        'phone': '9765432109',
        'email': 'vikram@gmail.com',
        'address': '654, Gandhi Road, Pune - 411001',
        'product_name': 'Purna Gummies - Berry Mix',
        'purchase_date': (datetime.now() - timedelta(days=7)).isoformat(),
        'review_screenshot': 'https://via.placeholder.com/400x600/AA96DA/FFFFFF?text=Review+Screenshot+5',
        'status': 'rejected',
        'admin_notes': 'Screenshot not clear. Please resubmit.',
        'platform_name': 'Myntra'
    }
]

try:
    for reward in dummy_rewards:
        cursor.execute("""
            INSERT INTO rewards (
                user_id, name, phone, email, address, product_name, 
                purchase_date, review_screenshot, status, upi_id, 
                payment_amount, admin_notes, payment_date, platform_name,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            reward['user_id'],
            reward['name'],
            reward['phone'],
            reward['email'],
            reward['address'],
            reward['product_name'],
            reward['purchase_date'],
            reward['review_screenshot'],
            reward['status'],
            reward.get('upi_id'),
            reward.get('payment_amount'),
            reward.get('admin_notes'),
            reward.get('payment_date'),
            reward.get('platform_name'),
            datetime.now().isoformat(),  # created_at
            datetime.now().isoformat()   # updated_at
        ))
    
    conn.commit()
    
    print("✅ Successfully added 5 dummy rewards!")
    print("\nReward Summary:")
    print("- 2 Pending rewards (need action)")
    print("- 1 Approved reward (ready for payment)")
    print("- 1 Paid reward (completed)")
    print("- 1 Rejected reward")
    print("\n🔗 View in admin panel: http://localhost:3000/admin/dashboard/rewards")
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()
