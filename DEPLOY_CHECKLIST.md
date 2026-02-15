# Quick Deployment Checklist

Follow these steps to deploy QuantumPay:

## ✅ Preparation (Complete)
- Configuration files created
- Package.json updated
- Environment templates ready

## 📋 Your Action Items

### 1. Setup MongoDB Atlas (5 minutes)
- Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Get connection string
- Whitelist all IPs (0.0.0.0/0)

### 2. Push to GitHub (2 minutes)
```bash
cd "e:\nithish anna"
git init
git add .
git commit -m "QuantumPay - Ready for deployment"
# Create repo on GitHub, then:
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 3. Deploy Backend to Render (10 minutes)
- Go to [render.com](https://render.com)
- New Web Service → Connect GitHub repo
- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Add environment variables:
  - `MONGO_URI`: Your Atlas connection string
  - `JWT_SECRET`: Random string
  - `NODE_ENV`: `production`

### 4. Deploy Frontend to Vercel (5 minutes)
- Go to [vercel.com](https://vercel.com)
- Import GitHub repo
- Root Directory: `frontend`
- Framework: Vite
- Add env var:
  - `VITE_API_BASE_URL`: `https://your-render-url.onrender.com/api`

### 5. Test Your Live App! 🎉
- Register new user
- Add money
- Send money
- Check transactions

---

**Total Time**: ~25 minutes  
**Total Cost**: $0 (Free tier)

See [DEPLOYMENT.md](file:///e:/nithish%20anna/DEPLOYMENT.md) for detailed instructions.
