# Frontend Configuration for BrokerIn Backend

## API Configuration

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:3030';
```

### Example Axios Setup (React/Next.js)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3030/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Key Endpoints

**Authentication:**
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/signin` - Login
- POST `/api/auth/verify-otp` - Verify OTP
- POST `/api/auth/refresh-token` - Refresh access token
- GET `/api/auth/check-admin` - Check if user is admin

**Properties:**
- GET `/api/properties` - Get all properties (with filters)
- GET `/api/properties/:id` - Get property by ID
- POST `/api/properties` - Add property (Admin, with auth token)
- PUT `/api/properties/:id` - Update property (Admin)
- DELETE `/api/properties/:id` - Delete property (Admin)

**Services:**
- GET `/api/services` - Get all services
- GET `/api/services/:id` - Get service by ID
- POST `/api/services` - Create service (Admin)
- PUT `/api/services/:id` - Update service (Admin)
- DELETE `/api/services/:id` - Delete service (Admin)

**Furniture:**
- GET `/api/furniture` - Get all furniture
- GET `/api/furniture/:id` - Get furniture by ID
- POST `/api/furniture` - Add furniture (Admin)
- PUT `/api/furniture/:id` - Update furniture (Admin)
- DELETE `/api/furniture/:id` - Delete furniture (Admin)
- PATCH `/api/furniture/:id/status` - Update furniture status (Admin)

**Furniture Forms/Requests:**
- POST `/api/furniture-forms` - Submit furniture request (Public, optional auth)
- GET `/api/furniture-forms` - Get all furniture requests (Admin)
- PUT `/api/furniture-forms/:id` - Update furniture request (Admin)
- PATCH `/api/furniture-forms/:id/status` - Update request status (Admin)
- DELETE `/api/furniture-forms/:id` - Delete furniture request (Admin)

## Authentication Flow

1. **Sign Up:**
```javascript
const signup = async (userData) => {
  const response = await fetch('http://localhost:3030/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName, username, email, 
      phoneNumber, nationality, password
    })
  });
  // Returns: { message: 'User created. Please verify your OTP.' }
};
```

2. **Verify OTP:**
```javascript
const verifyOtp = async (email, otp) => {
  const response = await fetch('http://localhost:3030/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  // Returns: { message: 'OTP verified successfully...' }
};
```

3. **Sign In:**
```javascript
const signin = async (identifier, password) => {
  const response = await fetch('http://localhost:3030/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  const data = await response.json();
  // Store: data.token and data.refreshToken
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
};
```

4. **Submit Furniture Request:**
```javascript
const submitFurnitureRequest = async (requestData) => {
  const token = localStorage.getItem('token');
  const payload = {
    furniture_id: 'FURN-2024-1028-ABC123', // Required
    name: 'John Doe',                       // Required
    email: 'john@example.com',             // Required
    phoneNumber: '1234567890',             // Required
    message: 'Interested in this item',     // Required
    listing_type: 'Rent',                   // Optional: 'Rent', 'Sell', 'Rent & Sell'
  };

  const response = await fetch('http://localhost:3030/api/furniture-forms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
};
```

5. **Authenticated Requests:**
```javascript
const fetchProperties = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3030/api/properties', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.properties;
};
```

## Important Notes

- **CORS:** Already configured for all origins
- **Token Format:** `Bearer <your-token>`
- **Token Storage:** Save token in localStorage
- **Admin Routes:** Require both token AND isAdmin check
- **File Uploads:** Properties use multipart/form-data for images

## Environment Variables (Optional)
Create `.env.local` or similar in your frontend:

```
REACT_APP_API_URL=http://localhost:3030
# or
NEXT_PUBLIC_API_URL=http://localhost:3030
```

