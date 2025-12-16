# AI Screenshot Analysis - Setup Instructions

## 1. Install Dependencies

```bash
cd server
pip install google-generativeai pillow
```

## 2. Get Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the generated key

## 3. Add to Environment Variables

Add to your `.env` file:

```bash
GEMINI_API_KEY=your_api_key_here
```

## 4. Run Database Migration

Execute the SQL migration:

```sql
ALTER TABLE rewards 
ADD COLUMN ai_verified BOOLEAN DEFAULT FALSE AFTER rejection_reason,
ADD COLUMN detected_rating INT NULL AFTER ai_verified,
ADD COLUMN detected_comment TEXT NULL AFTER detected_rating,
ADD COLUMN ai_confidence FLOAT NULL AFTER detected_comment,
ADD COLUMN ai_analysis_status VARCHAR(50) DEFAULT 'pending' AFTER ai_confidence;
```

## 5. Restart Server

```bash
uvicorn app.main:app --reload
```

## Testing

1. **User Upload**: Try uploading a 5-star review screenshot
2. **Admin Panel**: Check if screenshot shows inline with AI analysis
3. **Validation**: Try uploading < 5-star review (should be rejected)

## Features

✅ **Backend**:
- AI analysis using Gemini Vision API
- 5-star rating verification
- Comment extraction
- Confidence scoring

✅ **Admin Panel**:
- Screenshot displayed inline (center)
- AI analysis section with:
  - Star rating visualization
  - Review comment text
  - Confidence percentage

✅ **User Upload**:
- Automatic 5-star verification
- Rejection if < 5 stars
- Error message with suggestion
