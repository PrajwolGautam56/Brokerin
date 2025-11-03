# Furniture/Appliances API Integration Guide

## 🎯 Overview
The Furniture/Appliances feature allows users to browse, rent, or buy furniture, appliances, electronics, and home items through your BrokerIn platform.

## 📡 Base URL Configuration

Your frontend is already configured to use:
```
http://localhost:3030/api
```

## ✅ What's Already Integrated

### 1. **Furniture Service** (`src/services/furnitureService.js`)
All API methods are ready:
- `getAllFurniture(filters)` - Get all furniture with filtering
- `getFurnitureById(id)` - Get specific furniture item
- `addFurniture(formData)` - Admin: Add new furniture
- `updateFurniture(id, formData)` - Admin: Update furniture
- `deleteFurniture(id)` - Admin: Delete furniture
- `updateFurnitureStatus(id, status, availability)` - Admin: Update status
- `submitFurnitureRequest(data)` - Submit booking request
- `getAllFurnitureRequests()` - Admin: Get all requests
- `updateFurnitureRequest(id, data)` - Admin: Update request status
- `deleteFurnitureRequest(id)` - Admin: Delete request

### 2. **Furniture Page** (`src/pages/Furniture.js`)
- Buy/Rent tabs
- Static demo data (8 items)
- Ready to connect to backend when available
- Booking modal with full form
- Success/error handling

### 3. **Admin Panel** (`src/pages/admin/FurnitureRequests.js`)
- View all booking requests
- Update request status
- Delete requests
- View detailed information

---

## 📋 Backend API Endpoints Expected

### 1. **Get All Furniture** (Public)
```javascript
GET /api/furniture
GET /api/furniture?category=Furniture&listingType=Rent&page=1&limit=10
```

**Query Parameters:**
- `category`: Furniture | Appliance | Electronic | Decoration | Kitchenware
- `listingType`: Rent | Sell | Rent & Sell
- `condition`: New | Like New | Good | Fair | Needs Repair
- `status`: Available | Rented | Sold
- `brand`: string
- `city`: string
- `minPrice`: number
- `maxPrice`: number
- `page`: number
- `limit`: number

**Expected Response:**
```json
{
  "furniture": [
    {
      "_id": "68ffbfc20710b8e29c38d385",
      "name": "Comfortable Sofa Set",
      "description": "3-seater sofa in excellent condition",
      "category": "Furniture",
      "item_type": "Sofa",
      "brand": "IKEA",
      "condition": "Like New",
      "listing_type": "Rent & Sell",
      "price": {
        "rent_monthly": 1500,
        "sell_price": 25000,
        "deposit": 2000
      },
      "photos": ["https://..."],
      "features": ["3-seater", "Leather", "Reclining"],
      "dimensions": {
        "length": 220,
        "width": 95,
        "height": 85,
        "unit": "cm"
      },
      "location": "Mumbai",
      "delivery_available": true,
      "delivery_charge": 500,
      "age_years": 1,
      "warranty": true,
      "warranty_months": 12,
      "added_by": {
        "fullName": "John Doe",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "zipcode": "400001",
      "address": {
        "street": "Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India"
      },
      "status": "Available",
      "availability": "Available",
      "createdAt": "2024-03-19T10:00:00.000Z",
      "updatedAt": "2024-03-19T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

### 2. **Get Furniture by ID** (Public)
```javascript
GET /api/furniture/:id
```

### 3. **Add Furniture Item** (Admin Only)
```javascript
POST /api/furniture
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Fields:**
```javascript
{
  name: "Sofa Set" (required),
  description: "3-seater sofa",
  category: "Furniture" (required),
  item_type: "Sofa" (required),
  brand: "IKEA",
  condition: "Like New" (required),
  listing_type: "Rent" | "Sell" | "Rent & Sell" (required),
  "price[rent_monthly]": 1500,
  "price[sell_price]": 25000,
  "price[deposit]": 2000,
  photos: File[],
  features: JSON.stringify(["feature1", "feature2"]),
  location: "Mumbai" (required),
  delivery_available: true,
  delivery_charge: 500,
  zipcode: "400001" (required, 6 digits),
  "address[street]": "Main Street",
  "address[city]": "Mumbai",
  "address[state]": "Maharashtra",
  "address[country]": "India"
}
```

### 4. **Update Furniture** (Admin Only)
```javascript
PUT /api/furniture/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### 5. **Delete Furniture** (Admin Only)
```javascript
DELETE /api/furniture/:id
Authorization: Bearer <token>
```

### 6. **Update Furniture Status** (Admin Only)
```javascript
PATCH /api/furniture/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Available" | "Rented" | "Sold",
  "availability": "Available" | "Rented" | "Sold"
}
```

---

## 🔧 How to Enable Real Backend Data

### Option 1: Update Furniture.js to Use Real API

Uncomment the API call in `src/pages/Furniture.js`:

```javascript
const fetchFurniture = async () => {
  setLoading(true);
  setError(null);
  try {
    // Uncomment these lines when backend is ready:
    const data = await furnitureService.getAllFurniture(filters);
    setFurnitureItems(data.furniture || []);
    
    // Comment out the static data line:
    // setFurnitureItems(furnitureData);
  } catch (err) {
    console.error('Error fetching furniture:', err);
    setError('Failed to load furniture. Using demo data.');
    // Fallback to static data
    setFurnitureItems(furnitureData);
  } finally {
    setLoading(false);
  }
};
```

### Option 2: Start Backend Server

Make sure your Node.js backend is running:
```bash
cd backend-directory
npm run dev
```

Should be accessible at: `http://localhost:3030`

### Option 3: Configure Environment

Create a `.env` file in project root:
```env
REACT_APP_API_BASE_URL=http://localhost:3030/api
```

---

## 🎨 Frontend - Furniture Booking Request

### Current Implementation

When user clicks "Buy Now" or "Rent Now", it submits to:

```javascript
POST /api/furniture-requests
```

**Payload:**
```json
{
  "furniture_id": "68ffbfc20710b8e29c38d385",
  "type": "rent",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "address": "123 Main Street, Bangalore",
  "duration": "12",
  "preferred_date": "2024-12-20",
  "preferred_time": "09:00-12:00",
  "message": "Need quick delivery"
}
```

**You need to implement this endpoint in your backend!**

---

## 📝 Next Steps for Backend Development

Your backend needs to implement:

### 1. Furniture Management Endpoints
```javascript
// routes/furniture.js

GET    /api/furniture              // Get all with filters
GET    /api/furniture/:id         // Get by ID
POST   /api/furniture              // Add (Admin)
PUT    /api/furniture/:id          // Update (Admin)
DELETE /api/furniture/:id          // Delete (Admin)
PATCH  /api/furniture/:id/status   // Update status (Admin)
```

### 2. Furniture Request Endpoints
```javascript
// routes/furniture-requests.js

POST   /api/furniture-requests        // Submit booking
GET    /api/furniture-requests        // Get all (Admin)
GET    /api/furniture-requests/:id    // Get by ID (Admin)
PATCH  /api/furniture-requests/:id    // Update status (Admin)
DELETE /api/furniture-requests/:id    // Delete (Admin)
```

---

## 🔍 Testing

### 1. Test Frontend (Currently Running)
- Visit: `http://localhost:3000/furniture`
- Browse items (using demo data)
- Click "Buy Now" or "Rent Now"
- Submit form (will fail until backend is implemented)

### 2. Test Admin Panel
- Login as admin: `admin@brokerin.com` / `admin123`
- Visit: `http://localhost:3000/admin/furniture-requests`
- View/Manage requests (will fail until backend is implemented)

### 3. When Backend is Ready
- Start backend server on port 3030
- Uncomment API calls in Furniture.js
- Test full flow end-to-end

---

## 📚 Additional Resources

- `FRONTEND_CONFIG.md` - General API configuration
- `LOCAL_SETUP.md` - Local development guide
- `src/services/furnitureService.js` - Service layer implementation

---

## ⚡ Quick Reference

### Furniture Categories:
- **Furniture**: Sofa, Bed, Table, Chair, Cabinet, Wardrobe
- **Appliance**: Refrigerator, Washing Machine, Microwave, Oven, AC
- **Electronic**: TV, Laptop, Computer, Printer, Speaker
- **Decoration**: Vase, Painting, Sculpture, Lamp, Curtain
- **Kitchenware**: Cooker, Mixer, Blender, Dinner Set, Crockery

### Listing Types:
- `Rent` - Rental only
- `Sell` - Sale only
- `Rent & Sell` - Both options available

### Status Types:
- `Available` - Ready for rental/sale
- `Rented` - Currently rented out
- `Sold` - Item has been sold

---

## 🎉 Current Status

✅ Frontend is complete and working with demo data  
✅ All service methods are implemented  
✅ Admin panel is ready  
⏳ Backend endpoints need to be implemented  
⏳ Real data integration pending backend  

---

## 💡 Tips

1. Start with GET `/api/furniture` endpoint to test data flow
2. Use demo data first to ensure frontend works
3. Implement furniture-requests endpoint last
4. Test admin endpoints with proper authentication
5. Use the test admin credentials for testing

---

**The frontend is ready! Just implement the backend endpoints and you're good to go! 🚀**

