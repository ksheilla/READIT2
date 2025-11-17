# 📚 READit2 - Interactive Reading Platform for Students

READit2 is an engaging web platform designed to encourage reading among students by allowing them to share book reflections, recommend books to peers, and compete on leaderboards. The platform features audio recordings, gamification elements like badges and streaks, and a beautiful, child-friendly interface.

## 🌟 Features

### 📖 Reading Reflections
- **Written Reflections**: Share your thoughts about books you've read
- **Audio Reflections**: Record voice reflections (up to 5 minutes)
- **Text-to-Speech**: Listen to others' reflections read aloud
- **Mood Selection**: Express how books made you feel with emojis
- **Interactive Audio Player**: Full-featured player with waveform visualization

### 📚 Book Recommendations
- **Recommend Books**: Share your favorite books with friends
- **Genre Tags**: Categorize books by genre (Fiction, Mystery, Fantasy, etc.)
- **Author Information**: Include author details in recommendations
- **Community Feed**: Browse recommendations from other students

### 🏆 Gamification
- **Reading Streaks**: Track consecutive days of reading
- **Leaderboard**: Compete with classmates on reading streaks
- **Badges System**: Earn badges for achievements:
  - ⭐ First Reflection
  - 📚 Bookworm (3 reflections)
  - 💡 Book Sharer (1 recommendation)
  - 🏆 Reading Champion (3 reflections + 1 recommendation)
  - 🔥 5-Day Streak
  - 📖 Dedicated Reader (10 reflections)
  - 🤝 Community Helper (5 recommendations)

### 🎨 Beautiful UI/UX
- **Colorful Animations**: Smooth transitions with Framer Motion
- **Kid-Friendly Design**: Engaging emojis and vibrant gradients
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, loading states, and celebrations
- **Dark Mode Ready**: Comfortable viewing in any lighting

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - Modern UI library
- **Material-UI (MUI) 7.3.4** - Component library
- **Framer Motion 12.23** - Animation library
- **Axios 1.13.1** - HTTP client
- **React Router 7.9.5** - Client-side routing

### Backend
- **Node.js 20+** - Runtime environment
- **Express 5.1.0** - Web framework
- **Supabase** - Database and storage
- **bcryptjs 3.0.2** - Password hashing
- **Multer 2.0.2** - File upload handling
- **Helmet 8.1.0** - Security headers

### Infrastructure
- **Frontend**: Vercel (Automatic deployments)
- **Backend**: Railway (Automatic deployments)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (Audio files)

## 📁 Project Structure

```
readit2/
├── readit2-frontend/          # React frontend application
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── AudioPlayer.jsx
│   │   │   ├── AudioRecorder.jsx
│   │   │   ├── BadgeDisplay.jsx
│   │   │   └── TextToSpeech.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── ReflectionPage.jsx
│   │   │   ├── RecommendationsPage.jsx
│   │   │   └── LeaderboardPage.jsx
│   │   ├── services/          # API services
│   │   │   ├── api.js
│   │   │   └── badgeChecker.js
│   │   ├── utils/             # Utility functions
│   │   │   └── soundEffects.js
│   │   ├── App.js             # Main app component
│   │   └── index.js           # Entry point
│   └── package.json
│
├── readit2-backend/           # Express backend API
│   ├── server.js              # Main server file
│   ├── package.json
│   ├── .env                   # Environment variables
│   ├── Procfile              # Heroku deployment
│   ├── railway.json          # Railway configuration
│   └── README.md             # Backend documentation
│
├── .gitignore
├── vercel.json               # Vercel configuration
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm 9+
- Supabase account (free tier available)
- Git installed

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/readit2.git
cd readit2
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd readit2-backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in `readit2-backend/`:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:3000
```


#### Start Backend Server
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd readit2-frontend
npm install
```

#### Configure Environment Variables
Create a `.env` file in `readit2-frontend/`:
```env
REACT_APP_API_BASE=http://localhost:5000/api
```

#### Start Frontend Development Server
```bash
npm start
```
Frontend will run on `http://localhost:3000`

### 4. Test the Application
1. Open `http://localhost:3000`
2. Register a new account
3. Login and start posting reflections!

## 🌐 Deployment

### Backend Deployment (Railway)

1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Connect GitHub Repository**
3. **Configure Settings**:
   - Root Directory: `readit2-backend`
   - Start Command: `node server.js`
4. **Add Environment Variables**:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. **Deploy**: Railway auto-deploys on push to main branch

### Frontend Deployment (Vercel)

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com)
2. **Import GitHub Repository**
3. **Configure Build Settings**:
   - Framework Preset: Create React App
   - Root Directory: `readit2-frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Add Environment Variables**:
   ```
   REACT_APP_API_BASE=https://your-backend.up.railway.app/api
   ```
5. **Deploy**: Vercel auto-deploys on push to main branch

## 📡 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Reflections
- `GET /api/reflections` - Get all reflections
- `POST /api/reflections` - Create new reflection
- `POST /api/upload-audio` - Upload audio file

### Recommendations
- `GET /api/recommendations` - Get all recommendations
- `POST /api/recommendations` - Create new recommendation

### Gamification
- `GET /api/badges/:userId` - Get user badges
- `GET /api/leaderboard` - Get top 10 users by streak

##  Key Features Explained

### Audio Recording System
- Uses Web Audio API and MediaRecorder
- Supports multiple audio formats (WebM, MP4, WAV)
- Real-time recording timer and waveform visualization
- 10MB file size limit, 5-minute duration limit
- Stored in Supabase Storage with public URLs

### Badge System
The badge system automatically awards achievements based on:
- Number of reflections posted
- Number of recommendations shared
- Reading streak consistency
- Badges stored in localStorage to prevent duplicate celebrations

### Text-to-Speech
- Uses Web Speech API
- Adjustable speed and pitch
- Multiple voice options
- Child-friendly default voice selection

### Security Features
- Password hashing with bcrypt (10 salt rounds)
- Helmet.js for security headers
- CORS protection with whitelist
- SQL injection prevention via Supabase
- File type validation for uploads

## 🐛 Troubleshooting

### Common Issues

**Login not working?**
- Check `REACT_APP_API_BASE` includes `/api` suffix
- Verify CORS origins in backend include your frontend URL
- Check browser console for detailed error messages

**Audio upload failing?**
- Verify Supabase Storage bucket is PUBLIC
- Check file size is under 10MB
- Ensure audio format is supported (WebM, MP4, WAV, OGG)

**Reflections not loading?**
- Check Supabase credentials are correct
- Verify database tables exist and have proper structure
- Check browser console for API errors

**CORS errors?**
- Add your frontend URL to allowed origins in `server.js`
- Ensure `FRONTEND_URL` environment variable is set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

##  Authors

- **RUVUGABIGWI KEZA Sheilla** 

##  Acknowledgments

- Material-UI for the component library
- Framer Motion for animations
- Supabase for backend infrastructure
- Railway and Vercel for hosting



**Made with ❤️ for young readers everywhere! 📚✨**
