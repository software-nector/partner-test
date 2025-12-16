import os
import base64
from typing import Dict, Optional
import google.generativeai as genai
from PIL import Image
import io
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AIAnalysisService:
    """Service for analyzing review screenshots using Google Gemini Vision API"""
    
    def __init__(self):
        # Get API key from environment
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ GEMINI_API_KEY not found in environment variables")
            print(f"   Current working directory: {os.getcwd()}")
            print(f"   .env file exists: {os.path.exists('.env')}")
            self.model = None
            return
        
        try:
            genai.configure(api_key=api_key)
            # Use Gemini 2.0 Flash model with vision capabilities
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            print("✅ Gemini AI Service initialized successfully with gemini-2.0-flash-exp")
        except Exception as e:
            print(f"❌ Failed to initialize Gemini: {str(e)}")
            self.model = None
    
    def analyze_screenshot(self, image_path: str) -> Dict:
        """
        Analyze a review screenshot to extract rating and comment
        
        Args:
            image_path: Path to the screenshot image
            
        Returns:
            Dict with keys: rating, comment, confidence, status
        """
        # Check if model is available
        if not self.model:
            return {
                'rating': 0,
                'comment': '',
                'platform': '',
                'confidence': 0.0,
                'status': 'failed',
                'error': 'Gemini API not configured'
            }
        
        try:
            # Open and validate image
            img = Image.open(image_path)
            
            # Create prompt for Gemini
            prompt = """
            Analyze this product review screenshot carefully and extract the following information:
            
            1. **Star Rating**: How many stars out of 5 did the reviewer give? (Return as integer 1-5)
            2. **Review Comment**: What is the exact review text/comment written by the reviewer?
            3. **Platform**: Which platform is this from? (Amazon, Flipkart, Meesho, etc.)
            
            IMPORTANT RULES:
            - Look for star icons (★ or ⭐) to count the rating
            - Extract the complete review text exactly as written
            - If you cannot detect the rating clearly, return 0
            - If no comment is visible, return empty string
            
            Return your response in this EXACT JSON format (no extra text):
            {
                "rating": 5,
                "comment": "extracted review text here",
                "platform": "platform name",
                "confidence": 0.95
            }
            
            Only return the JSON, nothing else.
            """
            
            # Generate content with image
            response = self.model.generate_content([prompt, img])
            
            # Parse response
            result = self._parse_response(response.text)
            result['status'] = 'success'
            
            return result
            
        except Exception as e:
            print(f"AI Analysis Error: {str(e)}")
            return {
                'rating': 0,
                'comment': '',
                'platform': '',
                'confidence': 0.0,
                'status': 'failed',
                'error': str(e)
            }
    
    def _parse_response(self, response_text: str) -> Dict:
        """Parse Gemini response and extract JSON"""
        try:
            import json
            import re
            
            # Remove markdown code blocks if present
            response_text = response_text.strip()
            response_text = re.sub(r'^```json\s*', '', response_text)
            response_text = re.sub(r'^```\s*', '', response_text)
            response_text = re.sub(r'\s*```$', '', response_text)
            
            # Parse JSON
            data = json.loads(response_text)
            
            return {
                'rating': int(data.get('rating', 0)),
                'comment': str(data.get('comment', '')),
                'platform': str(data.get('platform', '')),
                'confidence': float(data.get('confidence', 0.0))
            }
            
        except Exception as e:
            print(f"Parse Error: {str(e)}")
            print(f"Response text: {response_text}")
            return {
                'rating': 0,
                'comment': '',
                'platform': '',
                'confidence': 0.0
            }
    
    def verify_five_star(self, image_path: str) -> tuple[bool, Dict]:
        """
        Verify if screenshot shows a 5-star review
        
        Returns:
            (is_five_star, analysis_result)
        """
        result = self.analyze_screenshot(image_path)
        is_five_star = result.get('rating') == 5 and result.get('status') == 'success'
        return is_five_star, result


# Create singleton instance
ai_service = AIAnalysisService()
