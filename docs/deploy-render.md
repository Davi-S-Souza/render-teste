# Deploying Corrige Aqui to Render

## Prerequisites
- GitHub account
- Render account (sign up at [render.com](https://render.com))
- Your code pushed to GitHub

---

## Step-by-Step Deployment Guide

### 1. Push Your Code to GitHub

First, make sure all changes are committed and pushed:

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Create a Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started"**
3. Sign up with your **GitHub account** (easiest option)
4. Authorize Render to access your repositories

### 3. Deploy Using Blueprint (Easiest Method)

#### Option A: One-Click Deploy

1. Go to your Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository: `ifsc-arliones/projeto-daio`
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**
6. Wait 5-10 minutes for deployment

#### Option B: Manual Service Creation

If blueprint doesn't work, create services manually:

##### 3a. Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Settings:
   - **Name:** `corrigeaqui-db`
   - **Database:** `corrigeaqui`
   - **User:** (auto-generated)
   - **Region:** Choose closest to you
   - **Plan:** **Free**
3. Click **"Create Database"**
4. **IMPORTANT:** Copy the **Internal Database URL** (you'll need this)

##### 3b. Create Backend Service

1. Click **"New +"** → **"Web Service"**
2. Connect your repository: `ifsc-arliones/projeto-daio`
3. Settings:
   - **Name:** `corrigeaqui-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** **Docker**
   - **Dockerfile Path:** `backend/Dockerfile`
   - **Plan:** **Free**
4. **Environment Variables** (click "Add Environment Variable"):
   ```
   SPRING_DATASOURCE_URL=<paste Internal Database URL from step 3a>
   SPRING_DATASOURCE_USERNAME=<database username>
   SPRING_DATASOURCE_PASSWORD=<database password>
   JWT_SECRET=your-super-secret-key-change-this-in-production-minimum-32-characters
   JWT_EXPIRATION=86400000
   UPLOAD_PATH=/app/uploads
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   ```
   (You'll update ALLOWED_ORIGINS after frontend deployment)
5. Click **"Create Web Service"**
6. Wait for deployment (~5-10 minutes)
7. **Copy the backend URL** (something like `https://corrigeaqui-backend.onrender.com`)

##### 3c. Create Frontend Service

1. Click **"New +"** → **"Web Service"**
2. Connect your repository: `ifsc-arliones/projeto-daio`
3. Settings:
   - **Name:** `corrigeaqui-frontend`
   - **Region:** Same as backend
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Runtime:** **Docker**
   - **Dockerfile Path:** `frontend/Dockerfile.prod`
   - **Plan:** **Free**
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=<paste backend URL from step 3b>
   NODE_ENV=production
   ```
5. Click **"Create Web Service"**
6. Wait for deployment

##### 3d. Update Backend CORS

1. Go back to **backend service** settings
2. Update **ALLOWED_ORIGINS** environment variable:
   ```
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   ```
3. Backend will auto-redeploy

### 4. Access Your Application

- **Frontend:** `https://corrigeaqui-frontend.onrender.com`
- **Backend:** `https://corrigeaqui-backend.onrender.com`
- **API Docs:** `https://corrigeaqui-backend.onrender.com/swagger-ui.html`

---

## Important Notes

### Free Tier Limitations
- ⚠️ **Services sleep after 15 minutes of inactivity**
- ⚠️ First request after sleep takes ~30-60 seconds to wake up
- ⚠️ **PostgreSQL free tier expires after 90 days** (you can recreate it)
- ✅ Unlimited bandwidth
- ✅ Free SSL certificates

### Automatic Deployments
- Every `git push` to `main` triggers auto-deployment
- Check deployment logs in Render dashboard
- Rollback available from dashboard

### Troubleshooting

**Backend won't start:**
- Check environment variables are set correctly
- Verify database connection string
- Check logs: Dashboard → Backend Service → Logs

**Frontend can't reach backend:**
- Verify `NEXT_PUBLIC_API_URL` matches backend URL
- Check `ALLOWED_ORIGINS` in backend includes frontend URL
- Must use HTTPS URLs (Render provides free SSL)

**Database connection failed:**
- Use **Internal Database URL** (not external)
- Verify username and password
- Check database is in same region

**Build fails:**
- Check Dockerfile paths are correct
- Verify `render.yaml` syntax
- Review build logs in dashboard

### Monitoring

- **Logs:** Dashboard → Service → Logs tab
- **Metrics:** Dashboard → Service → Metrics tab
- **Health Checks:** Backend includes `/actuator/health` endpoint

---

## Alternative: Deploy via CLI

Install Render CLI:
```bash
npm install -g @render/cli
```

Deploy:
```bash
render login
render blueprint launch
```

---

## Costs & Upgrades

- **Free Tier:** Perfect for testing/demos
- **Starter ($7/month):** No sleep, better performance
- **PostgreSQL Paid:** $7/month for persistent database

---

## Next Steps

1. ✅ Test all features on production
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring/alerts
4. ✅ Set up staging environment (optional)

---

**Need help?** Check [Render Documentation](https://render.com/docs) or contact support.
