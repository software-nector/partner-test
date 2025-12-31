import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request
from app.config import settings

class GoogleDriveService:
    def __init__(self):
        self.scopes = ['https://www.googleapis.com/auth/drive.file']
        self.folder_id = settings.GOOGLE_DRIVE_FOLDER_ID
        self.service = None
        self._authenticate()

    def _authenticate(self):
        """Authenticate using Refresh Token for personal Google Drive"""
        try:
            if not all([settings.GOOGLE_DRIVE_CLIENT_ID, 
                       settings.GOOGLE_DRIVE_CLIENT_SECRET, 
                       settings.GOOGLE_DRIVE_REFRESH_TOKEN]):
                print("⚠️ Google Drive OAuth credentials missing in .env")
                return

            creds = Credentials(
                token=None,  # Will be fetched via refresh token
                refresh_token=settings.GOOGLE_DRIVE_REFRESH_TOKEN,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_DRIVE_CLIENT_ID,
                client_secret=settings.GOOGLE_DRIVE_CLIENT_SECRET,
                scopes=self.scopes
            )

            # Refresh the token to get a valid access token
            creds.refresh(Request())
            self.service = build('drive', 'v3', credentials=creds)
            print("✅ Google Drive OAuth Service initialized successfully")
            
        except Exception as e:
            print(f"❌ Google Drive Auth Error: {str(e)}")
            self.service = None

    def upload_file(self, local_path, file_name, mime_type='image/jpeg'):
        """Upload a file to Google Drive and return its view link"""
        if not self.service:
            # Try to re-authenticate once if service is down
            self._authenticate()
            if not self.service:
                return None
            
        try:
            file_metadata = {
                'name': file_name,
                'parents': [self.folder_id]
            }
            media = MediaFileUpload(local_path, mimetype=mime_type, resumable=True)
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, webViewLink, webContentLink'
            ).execute()
            
            file_id = file.get('id')
            
            # Make the file readable by anyone (Personal accounts can do this if enabled)
            self.service.permissions().create(
                fileId=file_id,
                body={'type': 'anyone', 'role': 'reader'}
            ).execute()
            
            # Return a direct image link format
            return f"https://docs.google.com/uc?export=view&id={file_id}"
            
        except Exception as e:
            print(f"❌ Google Drive Upload Error: {str(e)}")
            return None

# Singleton instance
google_drive_service = GoogleDriveService()
