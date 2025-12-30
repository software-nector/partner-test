import os
import os.path
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from app.config import settings

class GoogleDriveService:
    def __init__(self):
        self.scopes = ['https://www.googleapis.com/auth/drive.file']
        self.creds_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'google_drive_credentials.json')
        self.folder_id = "1scIpkUKHZnV6o5milYViTlpGOw5cka_v" # User provided folder ID
        self.creds = None
        
        if os.path.exists(self.creds_path):
            self.creds = service_account.Credentials.from_service_account_file(
                self.creds_path, scopes=self.scopes
            )
            self.service = build('drive', 'v3', credentials=self.creds)
        else:
            print(f"⚠️ Google Drive credentials not found at {self.creds_path}")
            self.service = None

    def upload_file(self, local_path, file_name, mime_type='image/jpeg'):
        """Upload a file to Google Drive and return its view link"""
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
            
            # Make the file readable by anyone with the link (optional, but needed for display)
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
