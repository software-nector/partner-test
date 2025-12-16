"""
Google OAuth Configuration and Helper Functions
"""
from google.oauth2 import id_token
from google.auth.transport import requests
import os

class GoogleOAuth:
    def __init__(self):
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/auth/google/callback')
    
    def verify_token(self, token: str):
        """Verify Google ID token and return user info"""
        try:
            print(f"[DEBUG] Verifying token with Client ID: {self.client_id}")
            
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                self.client_id
            )
            
            print(f"[DEBUG] Token verified successfully")
            print(f"[DEBUG] User info: {idinfo.get('email')}, {idinfo.get('name')}")
            
            # Token is valid, extract user info
            return {
                'email': idinfo.get('email'),
                'name': idinfo.get('name'),
                'picture': idinfo.get('picture'),
                'google_id': idinfo.get('sub'),
                'email_verified': idinfo.get('email_verified', False)
            }
        except ValueError as e:
            # Invalid token
            print(f"[ERROR] Token verification failed: {str(e)}")
            raise Exception(f"Invalid token: {str(e)}")
        except Exception as e:
            print(f"[ERROR] Unexpected error in token verification: {str(e)}")
            raise Exception(f"Token verification error: {str(e)}")
    
    def get_authorization_url(self):
        """Generate Google OAuth authorization URL"""
        from urllib.parse import urlencode
        
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'prompt': 'consent'
        }
        
        base_url = 'https://accounts.google.com/o/oauth2/v2/auth'
        return f"{base_url}?{urlencode(params)}"

google_oauth = GoogleOAuth()
