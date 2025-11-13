# Railway Deployment Setup for Backend

## Important: Configure Root Directory

When deploying to Railway, you **MUST** set the root directory to `readit2-backend` in the Railway dashboard.

### Step-by-Step Railway Setup

1. **Create a New Project on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your READIT2 repository

2. **Configure the Service**
   - After the project is created, Railway will create a service
   - Click on the service to open settings
   - Go to **Settings** tab
   - Scroll down to **Root Directory**
   - Set it to: `readit2-backend`
   - Click **Save**

3. **Add Environment Variables**
   - Go to the **Variables** tab
   - Add the following environment variables:
     ```
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     FRONTEND_URL=https://your-frontend.vercel.app
     ```
   - Note: `PORT` and `RAILWAY_PUBLIC_DOMAIN` are set automatically by Railway

4. **Deploy**
   - Railway will automatically detect the Node.js app
   - It will run `npm install` in the `readit2-backend` directory
   - It will start the server with `node server.js`
   - Wait for deployment to complete

5. **Get Your Backend URL**
   - Once deployed, Railway will provide a URL
   - Copy this URL (e.g., `https://your-app.railway.app`)
   - You'll need this for the frontend `REACT_APP_API_BASE` environment variable

## Alternative: Using Railway CLI

If you prefer using the Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project (in the repository root)
railway init

# Link to existing project or create new one
railway link

# Set root directory (this sets it for the current service)
railway variables set RAILWAY_SERVICE_ROOT=readit2-backend

# Deploy
railway up
```

## Troubleshooting

### Error: "No start command was found"
- **Solution**: Make sure you've set the Root Directory to `readit2-backend` in Railway dashboard
- The `readit2-backend/package.json` has a `start` script that Railway needs to find

### Error: "Node_modules directory found in project root"
- **Solution**: This is expected - the root has node_modules for the frontend build
- Railway will use the `readit2-backend` directory which has its own node_modules
- Make sure Root Directory is set to `readit2-backend`

### Error: "Cannot find module"
- **Solution**: Check that all dependencies are listed in `readit2-backend/package.json`
- Railway runs `npm install` in the root directory you specify
- Make sure the root directory is `readit2-backend`

## Verification

After deployment, verify it's working:

1. Visit your Railway URL (e.g., `https://your-app.railway.app`)
2. You should see: "READit2 API is running successfully with Supabase Storage! 🎤"
3. Test an endpoint: `https://your-app.railway.app/api/leaderboard`
4. You should get a JSON response (even if empty)

## Next Steps

After backend is deployed:
1. Update Vercel environment variable: `REACT_APP_API_BASE=https://your-app.railway.app/api`
2. Redeploy frontend on Vercel
3. Test the full application

