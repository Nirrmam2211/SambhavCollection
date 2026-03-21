# 🧵 Sambhav Collection — Full Stack MERN Application

> Bespoke menswear platform with size personalization, appointment booking, payments & admin panel.

---

## 🗂️ Project Structure

```
sambhav-collection/
├── backend/                    # Express + MongoDB API
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Image upload config
│   ├── controllers/
│   │   ├── authController.js   # Register, login, JWT, email verify
│   │   ├── productController.js# CRUD + filtering + search
│   │   ├── orderController.js  # Order lifecycle management
│   │   ├── appointmentController.js # Slot booking system
│   │   ├── paymentController.js# Razorpay + Stripe
│   │   └── adminController.js  # Dashboard analytics
│   ├── middleware/
│   │   ├── auth.js             # JWT protect, admin, tailor guards
│   │   ├── errorHandler.js     # Global error handler
│   │   └── notFound.js         # 404 handler
│   ├── models/
│   │   ├── User.js             # User + address + measurements
│   │   ├── Product.js          # Product + variants + SEO
│   │   ├── Order.js            # Order + status history
│   │   ├── Appointment.js      # Booking + time slots
│   │   ├── Review.js           # Reviews + rating aggregation
│   │   └── Coupon.js           # Discount codes
│   ├── routes/                 # All API route files
│   ├── utils/
│   │   └── email.js            # Nodemailer + HTML templates
│   ├── server.js               # Main Express server
│   └── .env.example            # Environment variable template
│
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx  # Navbar + Footer + CartDrawer
│   │   │   │   └── AdminLayout.jsx # Sidebar admin panel
│   │   │   └── ui/
│   │   │       ├── ProductCard.jsx # Hover effects + quick add
│   │   │       └── CartDrawer.jsx  # Slide-in cart
│   │   ├── context/
│   │   │   └── store.js        # Zustand: auth + cart + UI state
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Full landing page
│   │   │   ├── Shop.jsx        # Filterable product grid
│   │   │   ├── Appointments.jsx# Multi-step booking flow
│   │   │   ├── Login.jsx       # Authentication
│   │   │   ├── Register.jsx    # Registration
│   │   │   └── admin/
│   │   │       └── Dashboard.jsx # Analytics + charts
│   │   ├── services/
│   │   │   └── api.js          # Axios + all API functions
│   │   ├── styles/
│   │   │   └── index.css       # Tailwind + custom styles
│   │   ├── App.jsx             # Routes + providers
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── package.json                # Root scripts (concurrently)
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier)
- Razorpay test account

### 1. Clone & Install
```bash
git clone <repo-url>
cd sambhav-collection
npm run install:all
```

### 2. Backend Environment
```bash
cd backend
cp .env.example .env
# Fill in all values in .env
```

### 3. Run Development
```bash
# From root — runs both backend and frontend
npm run dev

# Backend only:  http://localhost:5000
# Frontend only: http://localhost:5173
```

---

## 🌐 API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login + get JWT |
| POST | `/api/auth/logout` | Clear cookie |
| POST | `/api/auth/forgot-password` | Send reset email |
| PUT  | `/api/auth/reset-password/:token` | Reset password |
| GET  | `/api/auth/verify-email/:token` | Verify email |
| GET  | `/api/auth/me` | Get current user |

### Products
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | — | List with filters & pagination |
| GET | `/api/products/featured` | — | Featured products |
| GET | `/api/products/:slug` | — | Single product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Orders
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/orders` | User | Place order |
| GET | `/api/orders/my` | User | My order history |
| GET | `/api/orders/:id` | User/Admin | Order details |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status + notify |

### Appointments
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/appointments/slots?date=` | — | Available time slots |
| POST | `/api/appointments` | Optional | Book appointment |
| GET | `/api/appointments/my` | User | My appointments |
| GET | `/api/appointments` | Admin | All appointments |
| PUT | `/api/appointments/:id` | Admin | Update status |
| DELETE | `/api/appointments/:id` | User/Admin | Cancel |

### Payments
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/payments/razorpay/create-order` | User | Create Razorpay order |
| POST | `/api/payments/razorpay/verify` | User | Verify signature |
| POST | `/api/payments/stripe/create-intent` | User | Create Stripe intent |
| POST | `/api/payments/stripe/webhook` | — | Stripe webhook |

### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/dashboard` | Admin | Full stats + analytics |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id` | Admin | Update role/status |
| GET | `/api/admin/analytics/revenue` | Admin | Revenue breakdown |

---

## 🔐 Environment Variables (Required)

```
MONGO_URI             → MongoDB Atlas connection string
JWT_SECRET            → Min 32-char secret key
CLOUDINARY_CLOUD_NAME → Cloudinary cloud name
CLOUDINARY_API_KEY    → Cloudinary API key
CLOUDINARY_API_SECRET → Cloudinary API secret
RAZORPAY_KEY_ID       → Razorpay test/live key ID
RAZORPAY_KEY_SECRET   → Razorpay secret
EMAIL_USER            → Gmail address
EMAIL_PASSWORD        → Gmail app password (not account password)
ADMIN_EMAIL           → Your admin email
CLIENT_URL            → Frontend URL (http://localhost:5173 in dev)
```

---

## 🧩 Key Features

### Customer-Facing
- ✅ Browse & filter products (category, price, occasion, sort)
- ✅ Bespoke size personalization with 17+ measurements
- ✅ Multi-step appointment booking with real-time slot availability
- ✅ Cart with slide-in drawer (Zustand persisted)
- ✅ Wishlist management
- ✅ Order tracking with status history
- ✅ Razorpay (INR) + Stripe (international) payments
- ✅ Coupon/discount code support
- ✅ Email notifications at every step
- ✅ Newsletter subscription

### Admin Panel
- ✅ Dashboard with revenue charts (Recharts)
- ✅ Order management + status updates
- ✅ Appointment calendar management
- ✅ Product CRUD with Cloudinary image upload
- ✅ User management + role assignment
- ✅ Revenue analytics by month + category

### Security
- ✅ JWT auth with HttpOnly cookies
- ✅ Rate limiting (global + auth-specific)
- ✅ Helmet security headers
- ✅ MongoDB injection sanitization
- ✅ Bcrypt password hashing (12 rounds)
- ✅ CORS configured for frontend origin
- ✅ Razorpay signature verification
- ✅ Admin/tailor role guards

---

## 🚀 Deployment

### Backend (Railway / Render / EC2)
```bash
cd backend
npm start
# Set NODE_ENV=production + all env vars
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy /dist folder
# Set VITE_API_URL=https://your-api.domain.com
```

### MongoDB Atlas
1. Create free M0 cluster
2. Whitelist IP (0.0.0.0/0 for production)
3. Copy connection string to MONGO_URI

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Zustand (cart + auth) |
| Data Fetching | TanStack React Query |
| Forms | React Hook Form |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Payments | Razorpay + Stripe |
| Images | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet, express-rate-limit, mongo-sanitize |

---

*Built with ♥ for Sambhav Collection · Mumbai*
*Every stitch. Your story.*


Email: admin@sambhavcollection.com
Password: AdminPassword123!