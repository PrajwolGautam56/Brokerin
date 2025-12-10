# 🚂 Railway Production Setup Guide

## ⚠️ Important: Proxy vs Base URL

### Development (Local)
- **Proxy in `package.json`** works automatically
- No need to set `REACT_APP_API_BASE_URL`
- Requests go through: `http://localhost:3000` → proxy → `http://localhost:3030`

### Production (Railway)
- **Proxy does NOT work** in production builds
- **MUST set `REACT_APP_API_BASE_URL`** in Railway environment variables
- Requests go directly to: `https://your-backend.railway.app`

---

## 🔧 Setup Steps for Railway

### 1. Get Your Backend URL

Your backend on Railway will have a URL like:
```
https://your-backend-service.railway.app
```

**Note:** Make sure to include the full URL with `https://` and no trailing slash.

---

### 2. Set Environment Variable in Railway

#### Option A: Railway Dashboard (Recommended)

1. Go to your **Frontend Service** in Railway
2. Click on **Variables** tab
3. Click **+ New Variable**
4. Add:
   - **Key:** `REACT_APP_API_BASE_URL`
   - **Value:** `https://your-backend-service.railway.app` (your actual backend URL)
5. Click **Add**

#### Option B: Railway CLI

```bash
railway variables set REACT_APP_API_BASE_URL=https://your-backend-service.railway.app
```

#### Option C: railway.json / railway.toml

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "variables": {
    "REACT_APP_API_BASE_URL": "https://your-backend-service.railway.app"
  }
}
```

---

### 3. Verify Configuration

After setting the environment variable:

1. **Redeploy** your frontend service in Railway
2. Check the build logs to ensure the variable is being used
3. In browser console, you should see API calls going to your backend URL

---

## 📝 Current Code Configuration

### `src/axiosConfig.js`

```javascript
// Development: Uses proxy (empty baseURL)
// Production: Uses REACT_APP_API_BASE_URL
const baseURL = process.env.REACT_APP_API_BASE_URL || (isProduction ? '' : '');
```

**How it works:**
- **Development:** `baseURL = ''` → Uses proxy from `package.json`
- **Production:** `baseURL = REACT_APP_API_BASE_URL` → Direct API calls

---

## 🔍 Troubleshooting

### Issue: API calls failing in production

**Check:**
1. ✅ `REACT_APP_API_BASE_URL` is set in Railway
2. ✅ URL is correct (includes `https://`, no trailing slash)
3. ✅ Backend service is running and accessible
4. ✅ CORS is configured on backend to allow your frontend domain

### Issue: Still using localhost in production

**Cause:** Environment variable not set or not loaded

**Fix:**
1. Set `REACT_APP_API_BASE_URL` in Railway
2. Redeploy the service
3. Environment variables are loaded at build time, so rebuild is required

### Issue: CORS errors

**Backend needs to allow your frontend domain:**

```javascript
// Backend CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',           // Development
    'https://your-frontend.railway.app' // Production
  ],
  credentials: true
};
```

---

## 📋 Environment Variables Checklist

### Frontend Service (Railway)

- [ ] `REACT_APP_API_BASE_URL` = `https://your-backend.railway.app`
- [ ] `NODE_ENV` = `production` (usually set automatically)

### Backend Service (Railway)

- [ ] Database connection string
- [ ] JWT secrets
- [ ] Other API keys (Cloudinary, Razorpay, etc.)

---

## 🎯 Example Configuration

### Development (.env.local - optional)
```env
# Not needed - uses proxy
# REACT_APP_API_BASE_URL=
```

### Production (Railway Variables)
```env
REACT_APP_API_BASE_URL=https://backend-brokerin-production.up.railway.app
```

### Code (No changes needed)
```javascript
// src/axiosConfig.js - Already configured correctly
const baseURL = process.env.REACT_APP_API_BASE_URL || (isProduction ? '' : '');
```

---

## ⚡ Quick Setup Commands

```bash
# Set environment variable in Railway
railway variables set REACT_APP_API_BASE_URL=https://your-backend.railway.app

# Or via Railway dashboard:
# 1. Go to your frontend service
# 2. Variables tab
# 3. Add: REACT_APP_API_BASE_URL = https://your-backend.railway.app
# 4. Redeploy
```

---

## 🔗 Related Files

- `src/axiosConfig.js` - API configuration
- `package.json` - Proxy (development only)
- Railway Dashboard - Environment variables

---

## ✅ Summary

**For Railway Production:**
1. ✅ **DO:** Set `REACT_APP_API_BASE_URL` in Railway environment variables
2. ✅ **DO:** Use your backend Railway URL (with `https://`)
3. ❌ **DON'T:** Rely on proxy in production (it doesn't work)
4. ❌ **DON'T:** Hardcode URLs in code

**No code changes needed** - just set the environment variable in Railway!

---

*Last Updated: December 2024*

