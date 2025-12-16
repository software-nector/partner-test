from app.services.ai_service import ai_service
import os

# Test with actual uploaded image
test_image = "uploads/rewards/1765804036_1.png"

if os.path.exists(test_image):
    print(f"🔍 Testing AI analysis on: {test_image}")
    print("-" * 50)
    
    result = ai_service.analyze_screenshot(test_image)
    
    print(f"📊 Analysis Result:")
    print(f"   Rating: {result.get('rating')} stars")
    print(f"   Comment: {result.get('comment')}")
    print(f"   Platform: {result.get('platform')}")
    print(f"   Confidence: {result.get('confidence')}")
    print(f"   Status: {result.get('status')}")
    
    if result.get('error'):
        print(f"   ❌ Error: {result.get('error')}")
else:
    print(f"❌ Image not found: {test_image}")
