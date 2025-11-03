# Local Development Setup Guide

## Configuration Complete ✅

Your BrokerIn frontend is now configured for local development with the furniture/appliance booking system.

## What's New

### 1. Furniture & Appliance Booking System
- **Page:** `/furniture` - Browse and book furniture/appliances
- **Buy/Rent Options:** Separate tabs for purchasing or renting
- **8 Items Available:** 
  - Furniture: Sofas, Beds, Dining Sets, TV Units, Study Tables
  - Appliances: Washing Machines, Refrigerators, Smart TVs

### 2. Admin Management
- **Page:** `/admin/furniture-requests` - Manage customer requests
- **Features:**
  - View all furniture/appliance requests
  - Update status (Requested → Confirmed → Delivered → Completed)
  - View detailed request information
  - Delete requests

### 3. API Configuration
- **Local Backend:** `http://localhost:3030/api`
- **API Service:** `src/services/furnitureService.js`
- **Endpoints:**
  - `POST /api/furniture-requests` - Submit booking
  - `GET /api/furniture-requests` - Admin view
  - `PATCH /api/furniture-requests/:id` - Update status
  - `DELETE /api/furniture-requests/:id` - Delete request

## Running the Application

### Start Frontend
```bash
npm start
```
Opens at `http://localhost:3000`

### Start Backend (if not already running)
```bash
# Navigate to backend directory
cd ../backend-brokerin
npm run dev
```
Runs at `http://localhost:3030`

## Testing the Furniture Booking

1. **Visit Furniture Page:**
   - Go to `http://localhost:3000/furniture`
   - Browse available items (furniture and appliances)

2. **Place a Booking:**
   - Select "Buy" or "Rent" tab
   - Click on any item (e.g., "55-inch Smart LED TV")
   - Click "Buy Now" or "Rent Now"
   - Fill in the form:
     - Name, Email, Phone
     - Address
     - Duration (for rentals): 1, 3, 6, 12, or 24 months
     - Preferred date and time
     - Additional message (optional)
   - Submit request

3. **Check Admin Panel:**
   - Login as admin (`admin@brokerin.com` / `admin123`)
   - Navigate to "Furniture Requests" in sidebar
   - View submitted requests
   - Update status as needed

## API Structure

### Furniture Request Payload
```javascript
{
  furniture_id: "8",
  type: "buy", // or "rent"
  name: "John Doe",
  email: "john@example.com",
  phone: "+91 9876543210",
  address: "123 Main Street, Bangalore",
  duration: "12", // months (only for rent)
  preferred_date: "2024-12-20",
  preferred_time: "09:00-12:00",
  message: "Need quick delivery"
}
```

### Response
```javascript
{
  message: "Furniture request submitted successfully",
  request: { /* request details */ }
}
```

## Environment Setup

Create a `.env` file in the project root (optional):
```env
REACT_APP_API_BASE_URL=http://localhost:3030/api
```

For production, it will use the Railway backend by default.

## Files Created/Modified

1. **New Files:**
   - `src/services/furnitureService.js` - API service layer
   - `src/pages/admin/FurnitureRequests.js` - Admin management page
   - `FRONTEND_CONFIG.md` - API configuration documentation

2. **Modified Files:**
   - `src/pages/Furniture.js` - Enhanced with booking modal and API integration
   - `src/axiosConfig.js` - Updated to use localhost for development
   - `src/layouts/AdminLayout.js` - Added Furniture Requests menu
   - `src/App.js` - Added furniture-requests route

## Navigation

### Public Pages
- Home: `/`
- Properties: `/properties`
- **Furniture: `/furniture`** ← NEW
- Services: `/services`
- About: `/about`
- Contact: `/contact`

### Admin Pages
- Dashboard: `/admin`
- Properties: `/admin/properties`
- Property Requests: `/admin/property-requests`
- **Furniture Requests: `/admin/furniture-requests`** ← NEW
- Services: `/admin/services`

## Next Steps for Backend

Your backend needs to implement these endpoints:

```javascript
// routes/furniture-requests.js

// POST /api/furniture-requests - Submit request
// GET /api/furniture-requests - Admin get all
// PATCH /api/furniture-requests/:id - Update status
// DELETE /api/furniture-requests/:id - Delete request
```

Check `FRONTEND_CONFIG.md` for detailed API structure.

## Troubleshooting

### Backend Not Running
If you see CORS errors or connection refused:
1. Make sure backend is running on port 3030
2. Check backend CORS configuration allows `http://localhost:3000`
3. Verify backend API base path is `/api`

### Furniture Page Not Loading
1. Clear browser cache
2. Check browser console for errors
3. Verify all imports are correct (no lint errors)

### Admin Login Issues
- Use test credentials: `admin@brokerin.com` / `admin123`
- Check token is being stored in localStorage
- Verify ProtectedRoute is working correctly

## Happy Coding! 🚀

