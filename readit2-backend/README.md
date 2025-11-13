# READit2 Backend

Express.js backend API for the READit2 reading platform.

## Environment Variables

Create a `.env` file in the root of this directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Frontend URL (for CORS) - Update after deploying frontend
FRONTEND_URL=https://your-frontend.vercel.app

# Server Port (automatically set by Railway/Render)
PORT=5000
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your environment variables

3. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Deployment

### Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Select the `readit2-backend` directory
4. Add environment variables in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL` (your Vercel frontend URL)
5. Railway will automatically deploy

### Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the root directory to `readit2-backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables in Render dashboard
7. Deploy

### Other Platforms

This app can also be deployed to:
- Heroku (uses Procfile)
- Fly.io
- DigitalOcean App Platform
- Any platform that supports Node.js

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/upload-audio` - Upload audio reflection
- `GET /api/reflections` - Get all reflections
- `POST /api/reflections` - Create a new reflection
- `GET /api/recommendations` - Get all recommendations
- `POST /api/recommendations` - Create a new recommendation
- `GET /api/badges/:userId` - Get user badges
- `GET /api/leaderboard` - Get leaderboard

## Updating Frontend

After deploying the backend, update your frontend environment variables:

1. In Vercel, go to your project settings
2. Add environment variable: `REACT_APP_API_BASE=https://your-backend.railway.app/api`
3. Redeploy the frontend

