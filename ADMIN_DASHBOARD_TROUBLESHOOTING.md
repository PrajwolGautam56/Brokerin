# 🔧 Admin Dashboard 404 Troubleshooting Guide

## ✅ Current Configuration Status

### Frontend Configuration (Verified ✓)

1. **Proxy Configuration** (`package.json`):
   ```json
   "proxy": "http://localhost:3030"
   ```
   ✅ Correctly configured

2. **Axios Configuration** (`src/axiosConfig.js`):
   - Uses proxy in development (empty baseURL)
   - Automatically adds Authorization header with token
   - ✅ Correctly configured

3. **Admin Service** (`src/services/adminService.js`):
   - Calls `/api/admin/dashboard/overview`
   - ✅ Correctly configured

### Expected Request Flow

1. Frontend (port 3000) → Makes request to `/api/admin/dashboard/overview`
2. React proxy → Forwards to `http://localhost:3030/api/admin/dashboard/overview`
3. Backend (port 3030) → Processes request and returns response

---

## 🔍 Troubleshooting Steps

### 1. Verify Backend Server is Running

```bash
# Check if backend is running on port 3030
lsof -i :3030

# Or check process
ps aux | grep node
```

**Expected:** Should see Node.js process running

**If not running:**
```bash
cd backend  # or wherever your backend code is
npm start   # or npm run dev
```

---

### 2. Verify Backend Route is Registered

The route should be registered in your backend:

**Expected Route:**
```
GET /api/admin/dashboard/overview
```

**Check in backend code:**
- `src/routes/adminRoutes.ts` or similar
- Should have: `router.get('/dashboard/overview', ...)`
- Should be mounted at: `app.use('/api/admin', adminRoutes)`

---

### 3. Check Authentication

**Required:**
- User must be logged in
- User must have admin role (`isAdmin: true` or `role: 'admin'`)

**Verify in browser console:**
```javascript
// Check token
localStorage.getItem('token')

// Check user
JSON.parse(localStorage.getItem('user'))
```

**If not admin:**
- Update user in database:
  ```javascript
  // MongoDB
  db.users.updateOne(
    { email: 'your@email.com' },
    { $set: { isAdmin: true } }
  )
  ```

---

### 4. Test the Endpoint Directly

**Using curl:**
```bash
curl -X GET http://localhost:3030/api/admin/dashboard/overview \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Using browser console:**
```javascript
fetch('http://localhost:3030/api/admin/dashboard/overview', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

### 5. Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload the admin dashboard page
4. Look for request to `/api/admin/dashboard/overview`
5. Check:
   - **Status Code:** Should be 200 (not 404)
   - **Request URL:** Should show the full URL
   - **Request Headers:** Should include `Authorization: Bearer ...`
   - **Response:** Should show JSON data or error message

---

### 6. Common Error Codes & Solutions

#### 404 Not Found
**Causes:**
- Backend route not registered
- Wrong URL path
- Backend server not running

**Solutions:**
1. Verify route exists in backend code
2. Restart backend server
3. Check backend logs for route registration

#### 401 Unauthorized
**Causes:**
- Missing or invalid token
- Token expired

**Solutions:**
1. Log out and log back in
2. Check token in localStorage
3. Verify token is being sent in headers

#### 403 Forbidden
**Causes:**
- User is not admin
- Admin middleware rejecting request

**Solutions:**
1. Verify user has `isAdmin: true` in database
2. Check admin middleware in backend

#### Network Error / CORS Error
**Causes:**
- Backend server not running
- CORS not configured
- Proxy not working

**Solutions:**
1. Ensure backend is running on port 3030
2. Check CORS configuration in backend
3. Verify proxy in package.json

---

### 7. Enhanced Error Messages

The Dashboard component now shows detailed error messages:

- **404 Errors:** Shows specific troubleshooting steps
- **401/403 Errors:** Shows authentication-related guidance
- **Network Errors:** Shows connection troubleshooting

**Error Display Includes:**
- Clear error message
- Troubleshooting checklist
- Retry button

---

### 8. Backend Logs

Check backend console for:
```
✅ Server is running on 0.0.0.0:3030
✅ Connected to MongoDB
GET /api/admin/dashboard/overview
```

If you see route not found errors, the route isn't registered.

---

### 9. Quick Verification Checklist

- [ ] Backend server running on port 3030
- [ ] Frontend server running on port 3000
- [ ] Proxy configured in package.json: `"proxy": "http://localhost:3030"`
- [ ] Route registered: `GET /api/admin/dashboard/overview`
- [ ] User logged in with valid token
- [ ] User has admin role (`isAdmin: true`)
- [ ] No CORS errors in browser console
- [ ] Network request shows correct URL in DevTools

---

## 📝 Expected Response Format

If everything is working, you should receive:

```json
{
  "success": true,
  "data": {
    "totalProperties": {
      "count": 245,
      "change": 12,
      "changeType": "increase",
      "available": 180,
      "sold": 45,
      "pending": 20
    },
    "activeUsers": {
      "count": 1200,
      "change": 8,
      "changeType": "increase",
      "verified": 1100,
      "unverified": 100,
      "newThisMonth": 150
    },
    "serviceRequests": {
      "count": 89,
      "change": -2,
      "changeType": "decrease",
      "pending": 25,
      "accepted": 30,
      "ongoing": 15,
      "completed": 19
    },
    "totalRevenue": {
      "amount": 2400000,
      "currency": "INR",
      "change": 18,
      "changeType": "increase",
      "thisMonth": 450000,
      "lastMonth": 380000,
      "rentalRevenue": 1800000,
      "furnitureRevenue": 500000,
      "serviceRevenue": 100000
    },
    "recentProperties": [...],
    "recentActivities": [...],
    "quickStats": {...}
  }
}
```

---

## 🚀 Quick Fix Commands

```bash
# Restart backend
cd backend
npm start

# Restart frontend (in another terminal)
cd frontend  # or root directory
npm start

# Check if ports are in use
lsof -i :3030  # Backend
lsof -i :3000  # Frontend

# Kill processes if needed
lsof -ti :3030 | xargs kill -9
lsof -ti :3000 | xargs kill -9
```

---

## 📞 Still Having Issues?

1. **Check browser console** for detailed error logs
2. **Check backend logs** for server-side errors
3. **Verify network tab** in DevTools for request/response details
4. **Test endpoint directly** using curl or Postman
5. **Verify database** - ensure user has admin role

---

*Last Updated: December 2024*

