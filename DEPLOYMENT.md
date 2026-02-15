# QuantumPay Deployment Guide

Complete guide to deploy QuantumPay to production.

## 🚀 Quick Start - Recommended (Free Hosting)

This guide uses **Render** for backend and **Vercel** for frontend (both free tier).

---

## Prerequisites

- [ ] GitHub account
- [ ] MongoDB Atlas account (free tier)
- [ ] Render.com account (free)
- [ ] Vercel account (free)

---

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://arashvandh85:Rashvandh123@cluster0.nqpuj.mongodb.net/quantumpay`)
5. Replace `<password>` with your actual password
6. Save this connection string for later

---

## Step 2: Push Code to GitHub

```bash
cd "e:\nithish anna"
git init
git add .
git commit -m "Initial commit - QuantumPay"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

## Step 3: Deploy Backend to Render

### 3.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `quantumpay-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Instance Type**: `Free`

### 3.2 Add Environment Variables

In Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate a random string (e.g., `openssl rand -base64 32`) |
| `NODE_ENV` | `production` |

### 3.3 Deploy

Click **"Create Web Service"** and wait for deployment to complete.

**Copy your backend URL** (e.g., `https://quantumpay-backend.onrender.com`)

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 4.2 Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.3 Add Environment Variable

Add this environment variable in Vercel:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | Your Render backend URL + `/api` (e.g., `https://quantumpay-backend.onrender.com/api`) |

### 4.4 Deploy

Click **"Deploy"** and wait for completion.

---

## Step 5: Update Backend CORS

After getting your Vercel URL, update backend CORS settings:

**File**: `backend/index.js`

```javascript
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

Commit and push changes - Render will auto-redeploy.

---

## Alternative: Deploy to Railway (All-in-One)

Railway hosts both frontend and backend together.

### Setup

1. Go to [Railway.app](https://railway.app/)
2. Create new project from GitHub repo
3. Add MongoDB plugin
4. Configure environment variables
5. Deploy both services

**Pros**: Simpler setup, integrated database  
**Cons**: Free tier has usage limits

---

## Verification Checklist

After deployment:

- [ ] Visit your frontend URL
- [ ] Register a new user
- [ ] Login successfully
- [ ] Add money to wallet
- [ ] Send money to another user
- [ ] Check transaction history
- [ ] Verify all animations work

---

## Troubleshooting

### Backend not connecting to MongoDB
- Verify MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)
- Check connection string format
- Ensure database user has read/write permissions

### Frontend can't reach backend
- Verify `VITE_API_BASE_URL` is correct
- Check CORS configuration in backend
- Ensure backend is deployed and running

### 500 Errors
- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set

---

## Production URLs

After deployment, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://quantumpay-backend.onrender.com`
- **Database**: MongoDB Atlas cluster

---

## Cost Summary

**Free Tier (Recommended)**:
- MongoDB Atlas: Free (512MB storage)
- Render: Free (750 hours/month)
- Vercel: Free (100GB bandwidth)

**Total**: $0/month 🎉

---

## Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Review CORS configuration
