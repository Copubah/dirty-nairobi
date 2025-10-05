# 🚀 Manual AWS Deployment Guide

Since the automated deployment encountered some compatibility issues, here's a step-by-step manual deployment approach that will definitely work.

## 🎯 **Simplified Deployment Strategy**

Instead of complex serverless deployment, let's use a simpler approach:

### **Option 1: Deploy Frontend Only (Recommended for Demo)**

Since your app works perfectly locally, the easiest way to share it is:

1. **Deploy Frontend to Netlify/Vercel** (Free & Easy)
2. **Keep Backend Running Locally** (For demo purposes)
3. **Use ngrok** to expose local backend to internet

### **Option 2: Traditional AWS Deployment**

Deploy both frontend and backend to AWS using simpler services.

---

## 🌐 **Option 1: Quick Demo Deployment (5 minutes)**

### **Step 1: Deploy Frontend to Netlify**

```bash
# 1. Build the frontend
cd frontend
npm run build

# 2. Go to netlify.com
# 3. Drag and drop the 'build' folder
# 4. Your app will be live instantly!
```

### **Step 2: Expose Local Backend**

```bash
# 1. Install ngrok
sudo apt install ngrok

# 2. Expose your local backend
ngrok http 8000

# 3. Copy the https URL (e.g., https://abc123.ngrok.io)
# 4. Update frontend environment variable
```

### **Step 3: Update Frontend API URL**

```bash
cd frontend
echo "REACT_APP_API_URL=https://your-ngrok-url.ngrok.io/api/v1" > .env.production
npm run build
# Re-upload to Netlify
```

**Result**: Your app will be live on the internet in 5 minutes! ✨

---

## 🏗️ **Option 2: Full AWS Deployment**

### **Step 1: Deploy Backend to AWS App Runner**

AWS App Runner is simpler than Lambda for our use case:

```bash
# 1. Create a Dockerfile (already exists)
# 2. Push code to GitHub
# 3. Go to AWS App Runner Console
# 4. Create service from GitHub repository
# 5. Select backend folder
# 6. Deploy automatically
```

### **Step 2: Deploy Frontend to AWS Amplify**

```bash
# 1. Go to AWS Amplify Console
# 2. Connect GitHub repository
# 3. Select frontend folder
# 4. Set environment variable: REACT_APP_API_URL=your-app-runner-url
# 5. Deploy automatically
```

---

## 🎯 **Recommended Next Steps**

### **For Quick Demo (Choose This!)**

1. **Deploy to Netlify** (drag & drop build folder)
2. **Use ngrok** for backend (temporary but works great)
3. **Share the Netlify URL** with others

### **For Production**

1. **Use AWS App Runner** for backend (simpler than Lambda)
2. **Use AWS Amplify** for frontend (automatic deployments)
3. **Set up custom domain** if needed

---

## 🛠️ **Step-by-Step: Netlify + ngrok (Recommended)**

### **1. Build Frontend**
```bash
cd dirty-nairobi/frontend
npm run build
```

### **2. Deploy to Netlify**
- Go to [netlify.com](https://netlify.com)
- Sign up (free)
- Drag the `build` folder to deploy
- Get your URL (e.g., `https://amazing-app-123.netlify.app`)

### **3. Expose Backend**
```bash
# Make sure backend is running
cd dirty-nairobi/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Install and run ngrok
sudo apt install ngrok
ngrok http 8000
# Copy the https URL
```

### **4. Update Frontend**
```bash
cd dirty-nairobi/frontend
echo "REACT_APP_API_URL=https://your-ngrok-url.ngrok.io/api/v1" > .env.production
npm run build
# Re-upload build folder to Netlify
```

### **5. Test Your Live App! 🎉**

Your Dirty Nairobi app is now live on the internet!

---

## 💡 **Why This Approach Works Better**

1. **No AWS complexity** - Netlify handles everything
2. **No Python version issues** - Your local backend works perfectly
3. **Free hosting** - Netlify is free for personal projects
4. **Instant deployment** - Drag and drop, done!
5. **Easy updates** - Just re-upload when you make changes

---

## 🔄 **Alternative: GitHub Pages + Railway**

If you prefer:
- **Frontend**: Deploy to GitHub Pages (free)
- **Backend**: Deploy to Railway.app (free tier)

Both are simpler than AWS for getting started.

---

## 🎯 **What Would You Like to Do?**

1. **Quick Demo** - Netlify + ngrok (5 minutes)
2. **Full AWS** - App Runner + Amplify (30 minutes)
3. **Alternative** - GitHub Pages + Railway (15 minutes)
4. **Keep Local** - Continue development locally

**I recommend Option 1 (Netlify + ngrok) for the quickest way to get your app live and shareable!** 🚀