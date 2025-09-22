# 📱 COMPLETE AI PROMPT FOR MOBILE APP INTEGRATION

## 🎯 PROJECT OVERVIEW
You are building a **React Native / Flutter / Ionic Mobile App** that integrates with a comprehensive **Property Booking API**. This API provides complete hotel/property booking management, user authentication, payment processing, real-time notifications, and multilingual support.

## 🚀 MOBILE APP FEATURES TO IMPLEMENT

### **Base API Configuration:**
- **Base URL:** `http://localhost:3000` (replace with your deployed URL)
- **Content-Type:** `application/json`
- **Authentication:** Bearer Token (JWT)
- **Language Support:** Arabic (`ar`) and English (`en`) with full i18n
- **Phone Format:** Saudi format required: `+966XXXXXXXXX`

---

## 🔐 **FEATURE 1: USER AUTHENTICATION & REGISTRATION**

### **1.1 Customer Registration:**
```javascript
// Customer Registration (Free for everyone)
POST /auth/register
POST /auth/register/customer  // Explicit customer registration

Request Body:
{
  "name": "أحمد محمد",
  "phone": "+966501234567",  // Required Saudi format
  "email": "ahmed@example.com",  // Optional
  "password": "123456",  // Minimum 6 characters
  "language": "ar"  // Optional, defaults to 'en'
}

Success Response (201):
{
  "success": true,
  "message": "تم تسجيل العميل بنجاح",
  "data": {
    "user": {
      "id": "uuid-string",
      "name": "أحمد محمد",
      "phone": "+966501234567",
      "email": "ahmed@example.com",
      "language": "ar",
      "roleId": 1,  // Customer role
      "Role": {
        "id": 1,
        "name": "customer",
        "description": "عميل - يمكنه تصفح المنتجات وإنشاء الطلبات"
      }
    },
    "token": "jwt-token-here",
    "userType": "customer"
  }
}
```

### **1.2 Login System:**
```javascript
POST /auth/login

Request Body:
{
  "phone": "+966501234567",
  "password": "123456"
}

Success Response (200):
{
  "success": true,
  "message": "Login success",
  "data": {
    "user": {
      "id": "uuid-string",
      "name": "أحمد محمد",
      "phone": "+966501234567",
      "email": "ahmed@example.com",
      "language": "ar",
      "roleId": 1,
      "Role": {
        "name": "customer",
        "description": "Customer"
      }
    },
    "token": "jwt-token-here"
  }
}

// Mobile Implementation:
const login = async (phone, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });
  
  const result = await response.json();
  if (result.success) {
    // Store token securely
    await AsyncStorage.setItem('authToken', result.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
  }
  return result;
};
```

### **1.3 Password Reset Flow:**
```javascript
// Step 1: Request OTP
POST /auth/forgot-password
{
  "phone": "+966501234567"
}

// Step 2: Reset with OTP
POST /auth/reset-password
{
  "phone": "+966501234567",
  "otp": "123456",  // 6 digits
  "newPassword": "newpassword123"
}
```

### **1.4 Logout:**
```javascript
POST /auth/logout
Authorization: Bearer {token}

// Mobile Implementation:
const logout = async () => {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  // Clear local storage
  await AsyncStorage.multiRemove(['authToken', 'userData']);
};
```

---

## 🏠 **FEATURE 2: PROPERTY BROWSING & SEARCH**

### **2.1 Property Listing with Advanced Filters:**
```javascript
GET /properties?type_id=1&location=الرياض&min_price=100&max_price=500&capacity=4&featured=true&available_only=true&page=1&limit=10&sort_by=price&sort_order=ASC

Query Parameters:
- type_id: Filter by property type
- location: Filter by city/location
- min_price, max_price: Price range
- capacity: Minimum guest capacity
- featured: Show featured properties only
- available_only: Show available properties only
- page, limit: Pagination
- sort_by: createdAt, full_price, rating, name
- sort_order: ASC, DESC

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "فيلا فاخرة بالرياض",
      "description": "فيلا مع مسبح خاص",
      "location": "الرياض",
      "address": "حي الملك فهد",
      "latitude": 24.7136,
      "longitude": 46.6753,
      "full_price": "500.00",
      "deposit_type": "percentage",
      "deposit_value": "30.00",
      "capacity": 4,
      "bedrooms": 2,
      "bathrooms": 2,
      "amenities": ["wifi", "parking", "pool", "kitchen"],
      "check_in_time": "15:00:00",
      "check_out_time": "12:00:00",
      "featured": true,
      "available": true,
      "rating": 4.5,
      "reviews_count": 25,
      "PropertyType": {
        "id": 1,
        "name_ar": "فيلا",
        "name_en": "Villa"
      },
      "PropertyMedia": [
        {
          "id": 1,
          "url": "https://storage.com/image1.jpg",
          "type": "image",
          "is_primary": true,
          "alt_text": "فيلا خارجية"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### **2.2 Property Types:**
```javascript
GET /properties/types

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name_en": "Villa",
      "name_ar": "فيلا",
      "description_en": "Luxury villa with private amenities",
      "description_ar": "فيلا فاخرة مع مرافق خاصة",
      "icon": "villa"
    },
    {
      "id": 2,
      "name_en": "Apartment",
      "name_ar": "شقة",
      "description_en": "Modern apartment",
      "description_ar": "شقة عصرية",
      "icon": "apartment"
    }
  ]
}
```

### **2.3 Property Details:**
```javascript
GET /properties/{id}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "فيلا فاخرة بالرياض",
    "description": "فيلا مع مسبح خاص ومرافق عصرية",
    "full_price": "500.00",
    "capacity": 4,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["wifi", "parking", "pool", "kitchen", "air_conditioning"],
    "PropertyMedia": [
      {
        "url": "https://storage.com/image1.jpg",
        "type": "image",
        "is_primary": true
      }
    ],
    "PropertyType": {
      "name_ar": "فيلا",
      "name_en": "Villa"
    },
    "avgRating": 4.5,
    "reviewsCount": 25,
    "isAvailable": true
  }
}
```

---

## 📅 **FEATURE 3: BOOKING SYSTEM**

### **3.1 Create Property Booking:**
```javascript
POST /user/property-booking
Authorization: Bearer {token}

Request Body:
{
  "property_id": 1,
  "check_in": "2025-02-01T15:00:00.000Z",
  "check_out": "2025-02-03T12:00:00.000Z",
  "guest_count": 2,
  "payment_method": "mada",  // mada, visa, mastercard, apple_pay, stc_pay
  "special_requests": "Late check-in please",
  "couponCode": "SAVE20"  // Optional
}

Success Response:
{
  "success": true,
  "message": "BOOKING_CREATED",
  "data": {
    "booking": {
      "id": "booking-uuid",
      "status": "pending",  // pending, confirmed, cancelled, completed
      "payment_status": "pending"  // pending, partial, paid, refunded
    },
    "payment_summary": {
      "total_price": 500.00,
      "deposit_amount": 150.00,  // 30% deposit
      "deposit_paid": 0,
      "remaining_amount": 500.00,
      "coupon_discount": 50.00,
      "final_amount": 450.00
    },
    "payment_url": "https://payment.gateway.com/pay/12345"
  }
}
```

### **3.2 Get User Bookings:**
```javascript
GET /user/booking/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "property_id": 1,
    "check_in": "2025-02-01T15:00:00.000Z",
    "check_out": "2025-02-03T12:00:00.000Z",
    "guest_count": 2,
    "status": "confirmed",
    "payment_status": "partial",
    "total_price": "500.00",
    "deposit_amount": "150.00",
    "deposit_paid": "150.00",
    "remaining_amount": "350.00",
    "couponCode": "SAVE20",
    "originalAmount": 500.00,
    "discountAmount": 50.00,
    "finalAmount": 450.00,
    "special_requests": "Late check-in please",
    "Property": {
      "id": 1,
      "name": "فيلا فاخرة بالرياض",
      "location": "الرياض",
      "PropertyMedia": [
        {
          "url": "https://storage.com/image1.jpg",
          "is_primary": true
        }
      ]
    },
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

## 🎫 **FEATURE 4: COUPON VALIDATION**

### **4.1 Validate Coupon:**
```javascript
POST /user/validate-coupon
Authorization: Bearer {token}

Request Body:
{
  "couponCode": "SAVE20",
  "orderAmount": 500.00
}

Success Response:
{
  "success": true,
  "message": "COUPON_VALID",
  "data": {
    "couponId": 1,
    "code": "SAVE20",
    "type": "percentage",  // percentage or fixed_amount
    "value": 20.00,
    "discountAmount": 100.00,
    "finalAmount": 400.00,
    "description": "خصم 20% على جميع الحجوزات"
  }
}

Error Response:
{
  "success": false,
  "message": "COUPON_EXPIRED" | "COUPON_NOT_FOUND" | "COUPON_USAGE_EXCEEDED" | "MINIMUM_ORDER_NOT_MET",
  "data": null
}
```

---

## ⭐ **FEATURE 5: REVIEWS & RATINGS**

### **5.1 Create Review:**
```javascript
POST /reviews
Authorization: Bearer {token}

Request Body:
{
  "bookingId": "booking-uuid",
  "rating": 5,  // 1-5 stars
  "comment": "تجربة رائعة، الفيلا نظيفة والخدمة ممتازة",
  "media": ["https://storage.com/review1.jpg"]  // Optional
}

Success Response:
{
  "success": true,
  "message": "تم إضافة التقييم بنجاح",
  "data": {
    "id": "review-uuid",
    "rating": 5,
    "comment": "تجربة رائعة",
    "status": "pending",  // pending, approved, rejected
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### **5.2 Get Property Reviews:**
```javascript
GET /reviews/property/{propertyId}?page=1&limit=10&rating=5

Response:
{
  "success": true,
  "data": [
    {
      "id": "review-uuid",
      "rating": 5,
      "comment": "تجربة رائعة، الفيلا نظيفة والخدمة ممتازة",
      "media": ["https://storage.com/review1.jpg"],
      "status": "approved",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "User": {
        "name": "أحمد محمد",
        "avatar": "https://storage.com/avatar1.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "total": 25,
    "pages": 3
  }
}
```

### **5.3 Get Review Statistics:**
```javascript
GET /reviews/stats/{propertyId}

Response:
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalReviews": 25,
    "ratingDistribution": {
      "5": 15,
      "4": 8,
      "3": 2,
      "2": 0,
      "1": 0
    }
  }
}
```

### **5.4 Get User Reviews:**
```javascript
GET /reviews/user?page=1&limit=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "review-uuid",
      "rating": 5,
      "comment": "تجربة رائعة",
      "status": "approved",
      "Property": {
        "name": "فيلا فاخرة بالرياض",
        "PropertyMedia": [{"url": "image.jpg", "is_primary": true}]
      },
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## 🔔 **FEATURE 6: PUSH NOTIFICATIONS & MESSAGING**

### **6.1 FCM Token Registration:**
```javascript
// Save FCM token for push notifications
PATCH /user/profile
Authorization: Bearer {token}

Request Body:
{
  "fcmToken": "firebase-cloud-messaging-token"
}
```

### **6.2 Get Notifications:**
```javascript
GET /user/notifications
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "notification-uuid",
      "title": "تم تأكيد حجزك",
      "body": "تم تأكيد حجزك لـ فيلا فاخرة بالرياض",
      "data": {
        "type": "booking_confirmed",
        "bookingId": "booking-uuid",
        "propertyId": 1
      },
      "read": false,
      "type": "booking",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### **6.3 Notification Types:**
- `booking_confirmed` - تأكيد الحجز
- `payment_completed` - اكتمال الدفع
- `review_invitation` - دعوة للتقييم
- `booking_reminder` - تذكير بالحجز
- `offer_notification` - عروض خاصة

---

## 💰 **FEATURE 7: PAYMENT INTEGRATION**

### **7.1 Supported Payment Methods:**
```javascript
const paymentMethods = [
  "mada",         // بطاقة مدى
  "visa",         // فيزا
  "mastercard",   // ماستركارد
  "apple_pay",    // آبل باي
  "stc_pay"       // STC Pay
];
```

### **7.2 Payment Flow:**
```javascript
// Step 1: Create booking (returns payment_url)
const booking = await createBooking(bookingData);

// Step 2: Open payment gateway
if (booking.data.payment_url) {
  // Open WebView or redirect to payment
  openPaymentGateway(booking.data.payment_url);
}

// Step 3: Listen for payment completion via Socket.IO
socket.on('paymentCompleted', (payment) => {
  if (payment.bookingId === booking.data.booking.id) {
    // Payment successful, update UI
    showPaymentSuccess();
  }
});
```

### **7.3 Stripe Integration:**
```javascript
// The API handles Stripe integration automatically
// Mobile app only needs to handle the payment flow
```

---

## 🌐 **FEATURE 8: MULTILINGUAL SUPPORT (i18n)**

### **8.1 Language Configuration:**
```javascript
// Supported languages
const supportedLanguages = ['ar', 'en'];

// Language switching
const switchLanguage = async (language) => {
  // Update user preference
  await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ language })
  });
  
  // Update local storage
  await AsyncStorage.setItem('selectedLanguage', language);
  
  // Restart app or update i18n
  i18n.changeLanguage(language);
};
```

### **8.2 API Response Localization:**
```javascript
// Add Accept-Language header to requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept-Language': currentLanguage  // 'ar' or 'en'
};
```

---

## 📄 **FEATURE 9: STATIC PAGES**

### **9.1 Get Static Pages:**
```javascript
GET /pages/{slug}?lang=ar

// Available slugs:
// - privacy-policy (سياسة الخصوصية)
// - terms (الشروط والأحكام)
// - about-us (عنا)
// - contact (اتصل بنا)

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "privacy-policy",
    "title": "سياسة الخصوصية",
    "content": "محتوى سياسة الخصوصية...",
    "language": "ar",
    "isActive": true,
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

## 🔄 **FEATURE 10: REAL-TIME UPDATES**

### **10.1 Socket.IO Integration:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Connect with authentication
socket.on('connect', () => {
  socket.emit('authenticate', { token });
});

// Listen for real-time events
socket.on('newBooking', (booking) => {
  // Update booking list
  updateBookingList(booking);
});

socket.on('paymentCompleted', (payment) => {
  // Update payment status
  updatePaymentStatus(payment);
});

socket.on('bookingStatusChanged', (booking) => {
  // Update booking status
  updateBookingStatus(booking);
});

socket.on('reviewInvitation', (invitation) => {
  // Show review invitation
  showReviewInvitation(invitation);
});
```

---

## 📱 **MOBILE APP IMPLEMENTATION GUIDE**

### **11.1 Authentication Flow:**
```javascript
// Auth Service
class AuthService {
  static async login(phone, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await AsyncStorage.setItem('authToken', result.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
      }
      
      return result;
    } catch (error) {
      throw new Error('Network error');
    }
  }

  static async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    return await response.json();
  }

  static async logout() {
    const token = await AsyncStorage.getItem('authToken');
    
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    await AsyncStorage.multiRemove(['authToken', 'userData']);
  }

  static async getToken() {
    return await AsyncStorage.getItem('authToken');
  }

  static async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }
}
```

### **11.2 API Service with Token Management:**
```javascript
class ApiService {
  static async request(endpoint, options = {}) {
    const token = await AuthService.getToken();
    const language = await AsyncStorage.getItem('selectedLanguage') || 'ar';
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': language,
        ...options.headers
      },
      ...options
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        // Token expired, logout user
        await AuthService.logout();
        // Navigate to login screen
        return;
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Network error');
    }
  }

  // Property Services
  static async getProperties(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return this.request(`/properties?${queryString}`);
  }

  static async getPropertyDetails(id) {
    return this.request(`/properties/${id}`);
  }

  static async getPropertyTypes() {
    return this.request('/properties/types');
  }

  // Booking Services
  static async createBooking(bookingData) {
    return this.request('/user/property-booking', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  static async getBooking(id) {
    return this.request(`/user/booking/${id}`);
  }

  // Review Services
  static async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  static async getPropertyReviews(propertyId, page = 1) {
    return this.request(`/reviews/property/${propertyId}?page=${page}&limit=10`);
  }

  // Coupon Services
  static async validateCoupon(couponCode, orderAmount) {
    return this.request('/user/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ couponCode, orderAmount })
    });
  }

  // Notification Services
  static async getNotifications() {
    return this.request('/user/notifications');
  }

  // Static Pages
  static async getStaticPage(slug) {
    const language = await AsyncStorage.getItem('selectedLanguage') || 'ar';
    return this.request(`/pages/${slug}?lang=${language}`);
  }
}
```

### **11.3 State Management (Redux/Context):**
```javascript
// Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AuthService.getToken();
      if (token) {
        const userData = await AsyncStorage.getItem('userData');
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone, password) => {
    const result = await AuthService.login(phone, password);
    if (result.success) {
      setUser(result.data.user);
    }
    return result;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### **11.4 Navigation Structure:**
```javascript
// App Navigation
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Auth Stack */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        
        {/* Main App Stack */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        
        {/* Modal Screens */}
        <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="ReviewForm" component={ReviewFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
```

---

## 🎨 **UI/UX COMPONENTS TO BUILD**

### **12.1 Essential Screens:**
1. **Splash/Loading Screen**
2. **Onboarding Screens**
3. **Login/Register Screens**
4. **Home Screen** (Featured Properties)
5. **Search/Filter Screen**
6. **Property Listing Screen**
7. **Property Details Screen**
8. **Booking Form Screen**
9. **Payment Screen**
10. **Booking Confirmation Screen**
11. **My Bookings Screen**
12. **Review Form Screen**
13. **Profile/Settings Screen**
14. **Notifications Screen**
15. **Static Pages Screen** (Terms, Privacy)

### **12.2 Key Components:**
1. **PropertyCard** - Display property info
2. **SearchFilters** - Filter properties
3. **BookingCard** - Display booking info
4. **ReviewCard** - Display reviews
5. **PaymentMethods** - Payment selection
6. **DatePicker** - Check-in/out dates
7. **GuestCounter** - Guest selection
8. **NotificationCard** - Notification display
9. **LoadingSpinner** - Loading states
10. **ErrorBoundary** - Error handling

---

## 🔐 **SECURITY & VALIDATION**

### **13.1 Input Validation:**
```javascript
// Phone validation (Saudi format)
const validateSaudiPhone = (phone) => {
  const regex = /^\+966[5][0-9]{8}$/;
  return regex.test(phone);
};

// Password validation
const validatePassword = (password, isAdmin = false) => {
  const minLength = isAdmin ? 8 : 6;
  return password.length >= minLength;
};

// Date validation
const validateDates = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  
  return checkInDate >= today && checkOutDate > checkInDate;
};
```

### **13.2 Error Handling:**
```javascript
// Global Error Handler
const handleApiError = (error, result) => {
  if (!result.success) {
    switch (result.message) {
      case 'INVALID_CREDENTIALS':
        return 'بيانات الدخول غير صحيحة';
      case 'PHONE_ALREADY_EXISTS':
        return 'رقم الهاتف مسجل مسبقاً';
      case 'COUPON_EXPIRED':
        return 'انتهت صلاحية الكوبون';
      case 'PROPERTY_NOT_AVAILABLE':
        return 'العقار غير متاح للحجز';
      default:
        return 'حدث خطأ، حاول مرة أخرى';
    }
  }
};
```

---

## 📊 **PERFORMANCE OPTIMIZATION**

### **14.1 Image Optimization:**
```javascript
// Lazy loading for property images
const PropertyImage = ({ uri, style }) => {
  return (
    <FastImage
      source={{ uri, priority: FastImage.priority.normal }}
      style={style}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
};
```

### **14.2 Data Caching:**
```javascript
// Cache property types and frequently accessed data
const CacheService = {
  async getPropertyTypes() {
    const cached = await AsyncStorage.getItem('propertyTypes');
    if (cached) {
      return JSON.parse(cached);
    }
    
    const result = await ApiService.getPropertyTypes();
    if (result.success) {
      await AsyncStorage.setItem('propertyTypes', JSON.stringify(result.data));
    }
    return result;
  }
};
```

---

## 🚀 **DEPLOYMENT & ENVIRONMENT**

### **15.1 Environment Configuration:**
```javascript
// environment.js
const environments = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    SOCKET_URL: 'http://localhost:3000',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_...',
  },
  production: {
    API_BASE_URL: 'https://api.yourdomain.com',
    SOCKET_URL: 'https://api.yourdomain.com',
    STRIPE_PUBLISHABLE_KEY: 'pk_live_...',
  }
};

export default environments[__DEV__ ? 'development' : 'production'];
```

### **15.2 Build Configuration:**
- **iOS:** Configure App Transport Security for HTTPS
- **Android:** Configure network security config
- **Firebase:** Setup FCM for push notifications
- **Stripe:** Configure payment methods
- **Maps:** Setup Google Maps API for location features

---

## 📝 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Core Authentication (Week 1)**
- [ ] Login/Register screens
- [ ] Token management
- [ ] Password reset flow
- [ ] Basic navigation

### **Phase 2: Property Browsing (Week 2)**
- [ ] Property listing
- [ ] Search and filters
- [ ] Property details
- [ ] Image gallery

### **Phase 3: Booking System (Week 3)**
- [ ] Booking form
- [ ] Date selection
- [ ] Payment integration
- [ ] Booking confirmation

### **Phase 4: Reviews & Notifications (Week 4)**
- [ ] Review system
- [ ] Push notifications
- [ ] Notification center
- [ ] Real-time updates

### **Phase 5: Polish & Optimization (Week 5)**
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing
- [ ] Deployment

---

## 🎯 **SUCCESS METRICS**

1. **User Engagement:**
   - App downloads and registrations
   - Daily/Monthly active users
   - Session duration

2. **Booking Performance:**
   - Booking conversion rate
   - Average booking value
   - Payment completion rate

3. **User Satisfaction:**
   - App store ratings
   - Review scores
   - Customer support tickets

---

## 📞 **API TESTING & SUPPORT**

### **Health Check:**
```javascript
GET /health
Response: {"status": "OK"}
```

### **API Documentation:**
- Swagger UI: `http://localhost:3000/api-docs`
- Postman Collection: Available in `/docs/postman_collection.json`

### **Test Credentials:**
```
Admin Login:
Phone: +966500000000
Password: Admin@123456

Test Customer:
Create via registration endpoint
```

---

**🎯 REMEMBER:** This is a comprehensive property booking system with advanced features including real-time notifications, payment processing, multilingual support, and role-based access. Build incrementally, test thoroughly, and focus on user experience!
