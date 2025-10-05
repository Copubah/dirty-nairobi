# Vercel Deployment Guide

## Current Issue
Vercel is showing a 404 error because it's trying to serve a full-stack application, but Vercel is optimized for frontend applications and serverless functions.

## Solution: Split Deployment

### Step 1: Deploy Backend to Railway/Render
1. **Railway (Recommended)**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Render Alternative**:
   - Go to render.com
   - Connect your GitHub repo
   - Create a new Web Service
   - Set build command: `cd backend && pip install -r requirements.txt`
   - Set start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 2: Deploy Frontend to Vercel
1. **Set Environment Variable in Vercel**:
   - Go to your Vercel project settings
   - Add environment variable: `REACT_APP_API_URL`
   - Set value to your backend URL (e.g., `https://your-app.railway.app/api/v1`)

2. **Deploy Frontend**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

### Step 3: Update Vercel Configuration
The `vercel.json` file has been created to properly build and serve the React frontend.

## Alternative: Use Railway for Full-Stack
Deploy both frontend and backend to Railway:

```bash
# Create railway.json in project root
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health"
  }
}
```

## Environment Variables Needed
- `REACT_APP_API_URL`: Backend API URL
- `AWS_ACCESS_KEY_ID`: AWS credentials (for S3)
- `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `AWS_REGION`: AWS region
- `S3_BUCKET_NAME`: S3 bucket name

## Quick Fix for Current Vercel Deployment
1. Delete the current Vercel deployment
2. Deploy only the frontend folder
3. Set the backend URL environment variable
4. Deploy backend separately to Railway/Render