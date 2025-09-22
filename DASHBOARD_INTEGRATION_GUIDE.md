# 🚀 COMPLETE AI PROMPT FOR DASHBOARD INTEGRATION

## 📋 PROJECT OVERVIEW
You are building a **React/Vue/Angular Admin Dashboard** that integrates with a **Room Booking API**. This API provides comprehensive booking management, property management, user management, and payment processing.

## 🎯 ONE-PAY-ONE-FEATURE INTEGRATION STRATEGY

### **Base API Information:**
- **Base URL:** `http://localhost:3000` (or your deployed URL)
- **Content-Type:** `application/json`
- **Authentication:** Bearer Token (JWT)
- **Language Support:** Arabic (`ar`) and English (`en`)

---

## 🔐 **FEATURE 1: AUTHENTICATION SYSTEM**

### **Login Endpoint:**
```javascript
POST /auth/login
Content-Type: application/json

Request Body:
{
  "phone": "+966501234567",  // Saudi phone format required
  "password": "password123"
}

Success Response (200):
{
  "success": true,
  "message": "Login success",
  "data": {
    "user": {
      "id": "uuid-string",
      "name": "Admin Name",
      "phone": "+966501234567",
      "email": "admin@example.com",
      "language": "en",
      "roleId": 2,  // 1=customer, 2=admin, 3=staff
      "token": "jwt-token-here"
    },
    "token": "jwt-token-here"
  }
}

Error Response (400/404):
{
  "success": false,
  "message": "INVALID_CREDENTIALS",
  "data": null
}
```

### **Register Admin Endpoint:**
```javascript
POST /auth/register/admin
Content-Type: application/json

Request Body:
{
  "name": "Admin Name",
  "phone": "+966501234567",
  "email": "admin@example.com",
  "password": "admin123456",  // min 8 chars for admin
  "language": "en"
}
```

### **Dashboard Implementation:**
```javascript
// Store token in localStorage/sessionStorage
const token = response.data.token;
localStorage.setItem('authToken', token);

// Use token in subsequent requests
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};
```

---

## 🏢 **FEATURE 2: PROPERTY MANAGEMENT**

### **Get All Properties:**
```javascript
GET /properties?page=1&limit=10&sort_by=createdAt&sort_order=DESC
Authorization: Bearer {token}

Query Parameters:
- page: 1 (pagination)
- limit: 10 (items per page)
- type_id: 1 (filter by property type)
- location: "Riyadh" (filter by city)
- min_price: 100
- max_price: 1000
- capacity: 4 (minimum guests)
- featured: true (featured properties only)
- available_only: true
- sort_by: "createdAt"|"full_price"|"rating"|"name"
- sort_order: "ASC"|"DESC"

Success Response:
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": 1,
        "name": "Luxury Apartment",
        "description": "Beautiful 2BR apartment",
        "type_id": 1,
        "PropertyType": {
          "id": 1,
          "name_en": "Apartment",
          "name_ar": "شقة",
          "icon": "apartment"
        },
        "location": "Riyadh",
        "address": "King Fahd Road",
        "latitude": "24.7136",
        "longitude": "46.6753",
        "full_price": "500.00",
        "deposit_type": "percentage",
        "deposit_value": "30.00",
        "calculated_deposit": "150.00",
        "capacity": 4,
        "bedrooms": 2,
        "bathrooms": 2,
        "amenities": ["wifi", "parking", "pool"],
        "check_in_time": "15:00:00",
        "check_out_time": "12:00:00",
        "is_available": true,
        "is_active": true,
        "featured": false,
        "rating": "4.50",
        "reviews_count": 10,
        "Media": [
          {
            "id": 1,
            "url": "https://example.com/image1.jpg",
            "media_type": "image",
            "is_primary": true,
            "alt_text": "Main view"
          }
        ],
        "Creator": {
          "id": "uuid",
          "name": "Staff Name"
        },
        "createdAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "total_properties": 50,
      "available_properties": 35,
      "featured_properties": 8
    }
  }
}
```

### **Create Property:**
```javascript
POST /properties
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
{
  "name": "New Property",
  "description": "Property description",
  "type_id": 1,
  "location": "Riyadh",
  "address": "Detailed address",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "full_price": 500.00,
  "deposit_type": "percentage", // or "fixed_amount"
  "deposit_value": 30.00,
  "capacity": 4,
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": JSON.stringify(["wifi", "parking"]),
  "check_in_time": "15:00:00",
  "check_out_time": "12:00:00",
  "media": [File1, File2, File3] // Max 10 files
}
```

### **Property Types Management:**
```javascript
// Get all property types
GET /properties/types

// Create property type (Admin only)
POST /properties/types
Authorization: Bearer {token}
{
  "name_en": "Villa",
  "name_ar": "فيلا",
  "description_en": "Luxury villa",
  "description_ar": "فيلا فاخرة",
  "icon": "villa"
}
```

---

## 👥 **FEATURE 3: USER MANAGEMENT**

### **Get All Users:**
```javascript
GET /admin/users
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "User Name",
      "phone": "+966501234567",
      "email": "user@example.com",
      "language": "en",
      "roleId": 1,
      "Role": {
        "id": 1,
        "name": "customer",
        "description": "Customer"
      },
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### **Update User:**
```javascript
PATCH /admin/users/{userId}
Authorization: Bearer {token}

Request Body:
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "roleId": 2
}
```

---

## 📅 **FEATURE 4: BOOKING MANAGEMENT**

### **Get All Bookings:**
```javascript
GET /admin/bookings
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "userId": "user-uuid",
      "property_id": 1,
      "startDate": "2025-02-01",
      "endDate": "2025-02-03",
      "status": "confirmed", // pending, confirmed, cancelled, completed
      "payment_status": "partial", // pending, partial, paid, refunded
      "total_price": "500.00",
      "deposit_amount": "150.00",
      "deposit_paid": "150.00",
      "remaining_amount": "350.00",
      "couponCode": "SAVE20",
      "originalAmount": 500.00,
      "discountAmount": 100.00,
      "finalAmount": 400.00,
      "User": {
        "id": "uuid",
        "name": "Customer Name",
        "phone": "+966501234567"
      },
      "PropertyBooking": {
        "id": 1,
        "name": "Property Name",
        "location": "Riyadh"
      },
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### **Create Property Booking (Customer):**
```javascript
POST /user/property-booking
Authorization: Bearer {token}

Request Body:
{
  "property_id": 1,
  "check_in": "2025-02-01T15:00:00.000Z",
  "check_out": "2025-02-03T12:00:00.000Z",
  "guest_count": 2,
  "payment_method": "mada", // mada, visa, mastercard, apple_pay, stc_pay
  "special_requests": "Late check-in",
  "couponCode": "SAVE20" // optional
}

Success Response:
{
  "success": true,
  "message": "BOOKING_CREATED",
  "data": {
    "booking": {
      "id": "uuid",
      "status": "pending",
      "payment_status": "pending"
    },
    "payment_summary": {
      "total_price": 500.00,
      "deposit_amount": 150.00,
      "deposit_paid": 0,
      "remaining_amount": 500.00,
      "coupon_discount": 50.00
    },
    "payment_url": "https://payment.gateway.com/pay/12345"
  }
}
```

---

## 🎫 **FEATURE 5: COUPON MANAGEMENT**

### **Get All Coupons:**
```javascript
GET /admin/coupons
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "SAVE20",
      "type": "percentage", // or "fixed_amount"
      "value": 20.00,
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-12-31T23:59:59.000Z",
      "min_order_amount": 100.00,
      "usage_limit": 100,
      "used_count": 25,
      "is_active": true,
      "description": "20% off winter promotion"
    }
  ]
}
```

### **Create Coupon:**
```javascript
POST /admin/coupons
Authorization: Bearer {token}

Request Body:
{
  "code": "SUMMER25",
  "type": "percentage",
  "value": 25.00,
  "start_date": "2025-06-01T00:00:00.000Z",
  "end_date": "2025-08-31T23:59:59.000Z",
  "min_order_amount": 200.00,
  "usage_limit": 50,
  "description": "Summer 25% discount"
}
```

### **Validate Coupon:**
```javascript
POST /user/validate-coupon
Authorization: Bearer {token}

Request Body:
{
  "couponCode": "SAVE20",
  "orderAmount": 500.00
}

Response:
{
  "success": true,
  "data": {
    "isValid": true,
    "couponId": 1,
    "discountAmount": 100.00,
    "finalAmount": 400.00,
    "message": "Coupon applied successfully"
  }
}
```

---

## ⭐ **FEATURE 6: REVIEW MANAGEMENT**

### **Get Property Reviews:**
```javascript
GET /reviews/property/{propertyId}?page=1&limit=10&rating=5
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review-uuid",
        "bookingId": "booking-uuid",
        "propertyId": 1,
        "userId": "user-uuid",
        "rating": 5,
        "comment": "Excellent property!",
        "media": ["image1.jpg", "image2.jpg"],
        "isApproved": true,
        "isFlagged": false,
        "User": {
          "name": "Customer Name"
        },
        "createdAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "total": 20
    },
    "stats": {
      "average_rating": 4.5,
      "total_reviews": 20,
      "rating_distribution": {
        "5": 10,
        "4": 5,
        "3": 3,
        "2": 1,
        "1": 1
      }
    }
  }
}
```

### **Moderate Review (Admin):**
```javascript
DELETE /admin/reviews/{reviewId}
Authorization: Bearer {token}
```

---

## 📊 **FEATURE 7: ANALYTICS & REPORTS**

### **Property Statistics:**
```javascript
GET /properties/admin/stats
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "total_properties": 50,
    "active_properties": 45,
    "featured_properties": 8,
    "average_rating": 4.2,
    "total_bookings": 200,
    "total_revenue": 50000.00,
    "occupancy_rate": 75.5,
    "top_properties": [
      {
        "id": 1,
        "name": "Property Name",
        "bookings_count": 25,
        "revenue": 12500.00,
        "rating": 4.8
      }
    ],
    "monthly_stats": {
      "current_month": {
        "bookings": 15,
        "revenue": 7500.00
      },
      "previous_month": {
        "bookings": 12,
        "revenue": 6000.00
      }
    }
  }
}
```

### **Export Bookings CSV:**
```javascript
GET /admin/reports/bookings-csv?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer {token}

// Returns CSV file for download
```

---

## 📱 **FEATURE 8: STATIC PAGES MANAGEMENT**

### **Get All Pages:**
```javascript
GET /pages/admin/all
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "privacy-policy",
      "title_ar": "سياسة الخصوصية",
      "title_en": "Privacy Policy",
      "content_ar": "محتوى سياسة الخصوصية...",
      "content_en": "Privacy policy content...",
      "updated_by": "admin-uuid",
      "updated_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### **Update Page:**
```javascript
PUT /pages/admin/{pageId}
Authorization: Bearer {token}

Request Body:
{
  "title_ar": "العنوان بالعربية",
  "title_en": "English Title",
  "content_ar": "المحتوى بالعربية",
  "content_en": "English content"
}
```

---

## 🚨 **ERROR HANDLING**

### **Standard Error Response:**
```javascript
{
  "success": false,
  "message": "ERROR_CODE",
  "data": null,
  "errors": [
    {
      "field": "phone",
      "message": "Phone number is required"
    }
  ]
}
```

### **Common Error Codes:**
- `USER_NOT_FOUND` (404)
- `INVALID_CREDENTIALS` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `VALIDATION_ERROR` (400)
- `PROPERTY_NOT_FOUND` (404)
- `BOOKING_NOT_FOUND` (404)
- `INSUFFICIENT_PERMISSIONS` (403)

---

## 🔧 **MIDDLEWARE REQUIREMENTS**

### **Authentication Header:**
```javascript
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json",
  "Accept-Language": "en" // or "ar"
}
```

### **File Upload:**
```javascript
// For property media upload
Headers: {
  "Authorization": "Bearer {token}",
  "Content-Type": "multipart/form-data"
}
```

---

## 🎨 **DASHBOARD UI COMPONENTS NEEDED**

### **1. Authentication Pages:**
- Login form with phone/password
- Role-based dashboard access
- Token management

### **2. Property Management:**
- Property list with filters
- Property creation form with image upload
- Property editing
- Property type management

### **3. Booking Management:**
- Booking list with status filters
- Booking details view
- Payment status tracking
- Booking timeline

### **4. User Management:**
- User list with role filters
- User role assignment
- User activity tracking

### **5. Analytics Dashboard:**
- Revenue charts
- Booking statistics
- Property performance metrics
- Occupancy rates

### **6. Coupon Management:**
- Coupon list
- Coupon creation/editing
- Usage tracking

### **7. Review Moderation:**
- Review list with approval status
- Review details with media
- Flagging system

---

## 💡 **IMPLEMENTATION TIPS**

### **State Management:**
```javascript
// Use Redux/Vuex/Context for:
const dashboardState = {
  auth: {
    user: null,
    token: null,
    permissions: []
  },
  properties: {
    list: [],
    currentProperty: null,
    filters: {},
    pagination: {}
  },
  bookings: {
    list: [],
    filters: {},
    stats: {}
  }
};
```

### **API Service Layer:**
```javascript
class ApiService {
  static async get(endpoint, params = {}) {
    const token = localStorage.getItem('authToken');
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => 
      url.searchParams.append(key, params[key])
    );
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }

  static async post(endpoint, data) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
}
```

### **Permission System:**
```javascript
// Check user permissions before showing UI elements
const hasPermission = (resource, action) => {
  return user.Role?.Permissions?.some(p => 
    p.resource === resource && p.action === action
  );
};

// Usage:
{hasPermission('properties', 'create') && (
  <CreatePropertyButton />
)}
```

---

## 🔄 **REAL-TIME FEATURES**

### **Socket.IO Integration:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Listen for real-time updates
socket.on('newBooking', (booking) => {
  // Update booking list
});

socket.on('paymentCompleted', (payment) => {
  // Update payment status
});
```

---

## 📝 **VALIDATION RULES**

### **Phone Numbers:**
- Must be Saudi format: `+966XXXXXXXXX`
- Required for all registrations

### **Passwords:**
- Customer: minimum 6 characters
- Admin: minimum 8 characters

### **Property Data:**
- Price: must be positive decimal
- Capacity: minimum 1 person
- Deposit: 0-100% for percentage type

### **Booking Dates:**
- Check-in must be future date
- Check-out must be after check-in
- Format: ISO 8601

---

## 🚀 **DEPLOYMENT CHECKLIST**

1. **Environment Variables:**
   - `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY` (for payments)
   - `TWILIO_*` (for SMS)
   - `FIREBASE_*` (for notifications)

2. **Database Setup:**
   ```bash
   npm run db:setup
   npm run setup:complete
   ```

3. **API Documentation:**
   - Available at: `/api-docs` (Swagger UI)
   - Base URL: `http://localhost:3000`

---

## 📞 **SUPPORT & TESTING**

### **Health Check:**
```javascript
GET /health
Response: {"status": "OK"}
```

### **Test Endpoints:**
- Use Postman collection: `/docs/postman_collection.json`
- Test authentication first
- Verify permissions for each role

### **Sample Test Data:**
- Admin user: Create via `/auth/register/admin`
- Test property: Use property creation endpoint
- Test booking: Create booking with valid dates

---

**🎯 IMPLEMENTATION PRIORITY:**
1. Authentication & User Management
2. Property Listing & Management
3. Booking System
4. Payment Integration
5. Analytics Dashboard
6. Review System
7. Coupon Management
8. Real-time Features

**Remember:** Each feature can be implemented independently. Start with authentication, then build upon it feature by feature!
