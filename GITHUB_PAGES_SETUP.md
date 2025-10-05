# GitHub Pages Deployment

## Automatic Deployment Setup

Your React frontend will automatically deploy to GitHub Pages when you push to the main branch.

## Setup Steps

### 1. Enable GitHub Pages
1. Go to your GitHub repository: `https://github.com/Copubah/dirty-nairobi`
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**

### 2. Update Backend URL
Once your Railway backend is deployed, update the workflow file:

Edit `.github/workflows/deploy-gh-pages.yml` and replace:
```yaml
REACT_APP_API_URL: https://your-railway-app.railway.app/api/v1
```

With your actual Railway URL.

### 3. Deploy
Push your changes to trigger the deployment:
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

## Your App URLs
- **Frontend**: https://copubah.github.io/dirty-nairobi
- **Backend**: https://your-railway-app.railway.app (from Railway)

## Manual Deployment (Alternative)
If you prefer manual deployment:
```bash
cd frontend
npm run build
npx gh-pages -d build
```

## Notes
- The workflow automatically builds and deploys on every push to main
- Make sure to update the `REACT_APP_API_URL` with your Railway backend URL
- GitHub Pages is free for public repositories