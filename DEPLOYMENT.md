# Deployment Guide for READit2

This guide will help you deploy both the frontend and backend of READit2.

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Railway or Render account (for backend)
- Supabase account (for database and storage)

## Step 1: Deploy Backend to Railway

### Option A: Railway (Recommended)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your READIT2 repository
   - Select the `readit2-backend` directory as the root

3. **Configure Environment Variables**
   - Go to your project settings
   - Navigate to "Variables" tab
   - Add the following environment variables:
     ```
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     FRONTEND_URL=https://your-frontend.vercel.app
     PORT=5000
     ```
   - Note: Railway will automatically set `PORT` and `RAILWAY_PUBLIC_DOMAIN`

4. **Deploy**
   - Railway will automatically detect the Node.js app
   - It will run `npm install` and `npm start`
   - Wait for deployment to complete
   - Copy your Railway URL (e.g., `https://your-app.railway.app`)

### Option B: Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: readit2-backend
     - **Root Directory**: readit2-backend
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Configure Environment Variables**
   - In the service settings, go to "Environment"
   - Add the same variables as Railway:
     ```
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     FRONTEND_URL=https://your-frontend.vercel.app
     ```

4. **Deploy**
   - Render will automatically deploy
   - Copy your Render URL (e.g., `https://your-app.onrender.com`)

## Step 2: Update Frontend to Use Backend URL

1. **Go to Vercel Dashboard**
   - Navigate to your frontend project
   - Go to "Settings" → "Environment Variables"

2. **Add Environment Variable**
   - **Key**: `REACT_APP_API_BASE`
   - **Value**: `https://your-backend.railway.app/api` (or your Render URL)
   - **Environment**: Production, Preview, Development (select all)

3. **Redeploy Frontend**
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger deployment

## Step 3: Update Backend CORS Settings

1. **Update Backend Environment Variables**
   - Go back to Railway/Render
   - Update `FRONTEND_URL` with your actual Vercel frontend URL:
     ```
     FRONTEND_URL=https://your-frontend.vercel.app
     ```
   - Redeploy the backend

2. **Verify CORS**
   - The backend is already configured to accept:
     - All `*.vercel.app` domains
     - Your specific `FRONTEND_URL`
     - Localhost for development

## Step 4: Test Deployment

1. **Test Backend**
   - Visit `https://your-backend.railway.app/`
   - You should see: "READit2 API is running successfully with Supabase Storage! 🎤"

2. **Test Frontend**
   - Visit your Vercel URL
   - Try to register/login
   - Verify API calls are working
   - Check browser console for any CORS errors

## Environment Variables Summary

### Backend (Railway/Render)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=https://your-frontend.vercel.app
PORT=5000 (automatically set by platform)
```

### Frontend (Vercel)
```env
REACT_APP_API_BASE=https://your-backend.railway.app/api
```

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check that the backend CORS configuration includes your frontend URL
- Verify environment variables are set correctly

### API Connection Errors
- Verify `REACT_APP_API_BASE` is set correctly in Vercel
- Check that the backend is running and accessible
- Verify the backend URL doesn't have a trailing slash

### Database Errors
- Ensure Supabase credentials are correct
- Verify Supabase tables are created
- Check Supabase storage bucket exists (`audio-reflections`)

### Build Errors
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs for specific errors

## Local Development

For local development, create `.env` files:

### Backend `.env`
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Frontend `.env`
```env
REACT_APP_API_BASE=http://localhost:5000/api
```

## Support

If you encounter any issues:
1. Check the deployment logs in Railway/Render
2. Check the Vercel deployment logs
3. Verify all environment variables are set correctly
4. Test the backend API endpoints directly using curl or Postman

