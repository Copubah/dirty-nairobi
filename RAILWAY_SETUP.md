# Railway Free Tier Deployment

## What You Get (Free Tier)
- $5 worth of usage credits per month
- 500 hours of runtime 
- 1GB RAM, 1 vCPU
- Perfect for your FastAPI backend

## Quick Setup Steps

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login and Initialize
```bash
railway login
cd dirty-nairobi
railway init
```

### 3. Set Environment Variables
```bash
railway variables set AWS_ACCESS_KEY_ID=your_key
railway variables set AWS_SECRET_ACCESS_KEY=your_secret
railway variables set AWS_REGION=us-east-1
railway variables set S3_BUCKET_NAME=your-bucket
railway variables set DATABASE_URL=sqlite:///./photos.db
```

### 4. Deploy
```bash
railway up
```

### 5. Get Your Backend URL
```bash
railway domain
```
This will give you a URL like: `https://your-app-name.railway.app`

## Update Frontend for Production

Once deployed, update your Vercel environment variables:
- `REACT_APP_API_URL` = `https://your-app-name.railway.app/api/v1`

## Files Created
- `railway.json` - Railway configuration
- `Procfile` - Deployment command
- Backend will run on Railway's assigned port

## Cost Estimate
Your app should use ~$1-2/month on free tier, well within the $5 limit.

## Alternative: Use Railway for Both Frontend & Backend
Railway can also host your React frontend if you prefer everything in one place.