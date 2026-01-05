import os
import base64
from typing import Dict, Optional
from openai import OpenAI
from PIL import Image
import io
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AIAnalysisService:
    """Service for analyzing review screenshots using OpenAI GPT-4 Vision API"""
    
    def __init__(self):
        # Get API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("⚠️ OPENAI_API_KEY not found in environment variables")
            print(f"   Current working directory: {os.getcwd()}")
            print(f"   .env file exists: {os.path.exists('.env')}")
            self.client = None
            return
        
        try:
            self.client = OpenAI(api_key=api_key)
            print("✅ OpenAI GPT-4 Vision Service initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize OpenAI: {str(e)}")
            self.client = None
    
    def autonomous_verification(self, image_path: str, target_product_name: str, target_urls: Dict[str, str]) -> Dict:
        """
        Perform a fully autonomous verification of a review screenshot
        
        Args:
            image_path: Path to the screenshot
            target_product_name: The expected product name from DB
            target_urls: Dictionary of authorized marketplace links (amazon, flipkart)
            
        Returns:
            Dict with verification results and auto-approval status
        """
        if not self.client:
            return {'status': 'failed', 'error': 'AI Model not initialized'}
            
        try:
            # Encode image to base64
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Format URLs for AI context
            urls_context = "\n".join([f"- {plat.capitalize()}: {url}" for plat, url in target_urls.items() if url])
            
            prompt = f"""
            SYSTEM TASK: AUTONOMOUS REVIEW VERIFICATION
            You are the final judge for a reward program. Your job is to verify if this screenshot shows a GENUINE, 5-STAR review for a specific product.
            
            TARGET PRODUCT DATA:
            - Authorized Name: "{target_product_name}"
            - Authorized Store Links:
            {urls_context}
            
            INSTRUCTIONS (FORENSIC AUDIT):
            1. **Extract Reviewer Identity**: Find the name of the person who wrote the review.
            2. **Extract Unique Text Snippet**: Extract the first 2-3 sentences of the review text. 
            3. **Verify Product Match**: Does the product name in the screenshot match our "Authorized Name"? Look for "Purna" keyword.
            4. **Verify Rating**: Is it a 5-star review?
            5. **Verify Marketplace**: Is it from Amazon, Flipkart, Meesho, Myntra, Nykaa, or JioMart?
            
            6. **FORGERY DETECTION (CRITICAL)**: 
               - Look for "Photoshop" or editing markers. 
               - Check if the font of the Reviewer Name or Review Text looks different from the rest of the UI.
               - Check for inconsistent lighting or blurry edges around the text.
               - If the text looks "pasted" or the alignment is slightly off, flag it as fraudulent.
            
            7. **Search Matching**: If you were to search this text on the marketplace, would it be a clear match?
            
            SAFETY NET LOGIC:
            - If you see ANY sign of digital editing or font mismatch, set is_match to false and auto_approve to false.
            - If you are 100% CONFIDENT (Product Match + 5 Stars + Authentic App UI + No Forgery Signs), set auto_approve to true.
            - If you are UNSURE, set auto_approve to false so a Human Admin can check.
            
            Return your response in this JSON format:
            {{
                "is_match": true/false,
                "confidence_score": 0.95,
                "extracted_reviewer": "Name",
                "extracted_text_snippet": "Full text...",
                "detected_rating": 5,
                "detected_platform": "Amazon",
                "is_verified_badge_present": true,
                "is_edited_or_fake": false,
                "decision_reasoning": "Forensic reasoning. Must mention if fonts/UI look authentic or edited."
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o",  # GPT-4 Vision model
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            result = self._parse_json(response.choices[0].message.content)
            
            # Final Autonomous Decision
            result['auto_approve'] = (
                result.get('is_match', False) and 
                result.get('detected_rating') == 5 and 
                result.get('confidence_score', 0) > 0.85
            )
            
            return result
            
        except Exception as e:
            return {'status': 'failed', 'error': str(e)}

    def _parse_json(self, text: str) -> Dict:
        """Helper to safely parse JSON from AI response"""
        import json
        import re
        try:
            # Clean possible markdown
            clean_text = re.sub(r'```json\s*|\s*```', '', text).strip()
            return json.loads(clean_text)
        except:
            return {"error": "JSON parse failed", "raw": text}
    
    def analyze_screenshot(self, image_path: str) -> Dict:
        """
        Analyze a review screenshot to extract rating and comment
        
        Args:
            image_path: Path to the screenshot image
            
        Returns:
            Dict with keys: rating, comment, confidence, status
        """
        # Check if client is available
        if not self.client:
            return {
                'rating': 0,
                'comment': '',
                'platform': '',
                'confidence': 0.0,
                'status': 'failed',
                'error': 'OpenAI API not configured'
            }
        
        try:
            # Encode image to base64
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Create prompt for OpenAI
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
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=300
            )
            
            # Parse response
            result = self._parse_response(response.choices[0].message.content)
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
