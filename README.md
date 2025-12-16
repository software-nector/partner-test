# 🚀 Purna Gummies - Full Stack Application

## React + Python (FastAPI) - SQLite Version

---

## 🎯 Quick Start (No PostgreSQL Required!)

### 1. Backend Setup

```bash
cd "d:\Purna Cashback\server"

# Install dependencies (fixed - no PostgreSQL needed!)
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Run server
uvicorn app.main:app --reload
```

**Server:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd "d:\Purna Cashback\client"

# Install dependencies
npm install

# Run dev server
npm run dev
```

**Client:** http://localhost:3000

---

## 📁 Project Structure

```
d:\Purna Cashback\
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # HomePage, LoginPage, AdminDashboard
│   │   ├── context/       # AuthContext
│   │   ├── services/      # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── server/                 # Python Backend
    ├── app/
    │   ├── api/           # auth, rewards, reels, admin
    │   ├── models/        # User, Coupon, Reward, Reel
    │   ├── schemas/       # Pydantic schemas
    │   ├── config.py
    │   ├── database.py
    │   └── main.py
    └── requirements.txt
```

---

## 🗄️ Database

Using **SQLite** - No installation needed!

Database file: `purna_gummies.db` (auto-created)

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with phone + coupon
- `GET /api/auth/me` - Get current user

### Rewards
- `POST /api/rewards/submit` - Submit reward claim
- `GET /api/rewards/my-claims` - Get user's claims

### Reels
- `POST /api/reels/submit` - Submit reel
- `GET /api/reels/my-submissions` - Get submissions

### Admin
- `GET /api/admin/rewards` - Get all rewards
- `PUT /api/admin/rewards/{id}` - Update status
- `GET /api/admin/analytics` - Get analytics

---

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- React Hot Toast

### Backend
- Python 3.10+
- FastAPI
- SQLAlchemy
- SQLite (easy setup!)
- JWT Authentication

---

## 🧪 Testing

### Test Backend
```bash
# Visit API docs
http://localhost:8000/docs

# Test endpoints directly in browser
```

### Test Frontend
```bash
# Open browser
http://localhost:3000
```

---

## 📝 Environment Variables

### Server (.env)
```env
DATABASE_URL=sqlite:///./purna_gummies.db
SECRET_KEY=your-secret-key
```

### Client (.env) - Optional
```env
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Deployment

### Backend
- Railway.app
- Render.com
- Heroku

### Frontend
- Vercel
- Netlify
- GitHub Pages

---

## ✅ Features

✅ Phone + Coupon Authentication  
✅ Reward Claims with File Upload  
✅ Reel Submissions  
✅ Admin Dashboard  
✅ Analytics  
✅ JWT Authentication  
✅ SQLite Database (no setup needed!)  
✅ API Documentation  

---

## 🎉 Ready to Use!

1. Install backend: `pip install -r requirements.txt`
2. Install frontend: `npm install`
3. Run backend: `uvicorn app.main:app --reload`
4. Run frontend: `npm run dev`

**That's it!** No database installation required! 🚀

---

## 📞 Support

- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

**Status:** ✅ Complete & Working!
