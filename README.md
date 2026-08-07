# Stylix — Premium Full-Stack E-Commerce Platform

![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![React](https://img.shields.io/badge/React-19.1-blue.svg)
![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg)
![Redis](https://img.shields.io/badge/Redis-Caching-red.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-State_Mgmt-764abc.svg)

**Stylix** is a production-ready, full-stack e-commerce platform built for premium fashion brands. It features a rich buyer experience — filtering, wishlist, cart, and Razorpay-powered checkout — alongside a dedicated seller operations terminal with inventory management, product variant control, and order fulfillment tracking.

---

## 🚀 Feature Modules

### 1. 👤 Authentication & Security
- **Email/Password Registration & Login** with JWT access tokens + refresh tokens (stored in HTTP-only cookies).
- **Google OAuth 2.0** (1-Click login via Passport.js).
- **Forgot Password Flow** — 6-character OTP emailed via Nodemailer with expiry validation.
- **Role-Based Access Control (RBAC)** — `buyer` and `seller` roles with separate protected routes.
- **Profile Update** — Users can update fullname, contact, storeName, and password from the UI.
- **Token Refresh** — `/api/auth/refresh-token` endpoint to renew access without re-login.

### 2. 🛍️ Product & Variant Management (Seller)
- Sellers create products with title, description, category (`MEN`, `WOMEN`, `KID`, `UNISEX`), subcategory, tags, attributes, and price.
- **Variant Engine** — Each product can have multiple variants, each with its own images, stock, price, and attributes.
- Images uploaded directly via **Multer** (memory storage, 5MB limit) sent to **Cloudinary/ImageKit**.
- Sellers can edit or delete products and individual variants; cloud images are cleaned up upon deletion.
- Seller-specific endpoint: `GET /api/products/seller-products` — returns products owned by the authenticated seller.

### 3. 🔍 High-Performance Filtering (Pro Filter Engine)
The `GET /api/products/shop` endpoint uses a **MongoDB Aggregation Pipeline**:
- Faceted filtering by category, size, color, price range.
- RegEx full-text search on `title`, `description`, and `tags`.
- Compound indexes on `category+subCategory`, `price.amount`, `seller`, `createdAt`, `salesCount`.
- Sort by newest arrivals or price (low/high).
- Database-level pagination.

### 4. 🛒 Cart & Wishlist
- Cart is **variant-aware** — adds specific `(productId, variantId)` combinations.
- Optimistic UI updates (local dispatch) with API rollback on failure.
- Wishlist is stored in MongoDB linked to the user; toggle on/off with a single endpoint.
- Cart is loaded once at login via `Layout.jsx` and synced with Redux (`cart.slice`).

### 5. 💳 Orders & Payments (Razorpay)
- Buyers create Razorpay orders via `POST /api/orders/create-order`.
- Payment verified on backend via `POST /api/orders/verify-payment` + Razorpay Webhook.
- Buyers can view active/past orders and cancel `Processing` orders.
- Sellers view all orders, update status (`Processing` → `Shipped` → `Delivered`), and delete orders.

### 6. ✨ Frontend Architecture & Optimization
- **React 19** + **Vite** for ultra-fast bundling and HMR.
- **Redux Toolkit** for centralized state (`auth`, `product`, `cart`, `order`, `wishlist`).
- **React Router v7** with `createBrowserRouter` layout-based nested routing.
- **Stale-While-Revalidate pattern** applied across pages — no full-page blocking loaders; data renders from Redux cache instantly while background API re-fetches silently.
- `ProtectedRoute` gates on `isAuthChecked` only (not `loading`) to prevent unmounting on profile updates.
- **TailwindCSS v4** styling + **Lucide React** icons.
- **React Hot Toast** for real-time notifications.

---

## 💻 Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 + Vite | Core framework & fast bundler |
| Redux Toolkit | Global state management |
| React Router v7 | Client-side routing |
| TailwindCSS v4 | Utility-first styling |
| Lucide React | Icon library |
| Axios | HTTP client |
| React Hot Toast | Toast notifications |
| React Razorpay | Payment gateway UI |
| Framer Motion | Smooth UI animations |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express.js 5 | Server runtime & API framework |
| MongoDB + Mongoose | Database & ODM |
| Redis (ioredis) | Caching layer |
| Passport.js | Google OAuth 2.0 authentication |
| JWT + bcrypt | Token auth & password hashing |
| Cloudinary / ImageKit | Media storage service |
| Razorpay | Payment processing |
| Nodemailer | OTP email notifications |
| Morgan | Request logger |
| Multer | Multipart image upload handling |

---

## 📂 Project Structure

```
Stylix/
├── Backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup (CORS, middleware, routes)
│   │   ├── config/                # Environment config
│   │   ├── controllers/           # Auth, product, cart, order, wishlist controllers
│   │   ├── models/                # Mongoose schemas (User, Product, Cart, Order, Wishlist)
│   │   ├── routes/                # Express API routes
│   │   ├── middleware/            # Auth & seller validation middlewares
│   │   ├── services/              # Cloudinary, email, Razorpay integrations
│   │   ├── utils/                 # Helper utilities
│   │   ├── validator/             # Request body validators
│   │   └── dao/                   # Data access objects
│   └── server.js                  # Database connection & server entry point
│
└── Frontend/
    ├── src/
    │   ├── main.jsx               # React root (Redux Provider)
    │   ├── app/
    │   │   ├── App.jsx            # Boot auth check & RouterProvider
    │   │   ├── app.routes.jsx     # Route definitions (createBrowserRouter)
    │   │   └── app.store.js       # Redux store configuration
    │   ├── components/            # Layout, Navbar, Footer, ProtectedRoutes, NotFound
    │   └── features/              # Feature modules (auth, products, cart, order, wishlist)
```

---

## 🔌 API Reference

> **Access Legend:**
> - `Public` = Open endpoint (No login required)
> - `Protected` = Requires logged-in User session
> - `Seller` = Requires logged-in Seller role

### Auth — `/api/auth`
| Method | Endpoint | Access Level | Description |
|--------|----------|--------------|-------------|
| POST | `/register` | Public | Register new user (buyer/seller) |
| POST | `/login` | Public | Login user, set HTTP-only cookie |
| POST | `/logout` | Protected | Clear session cookies |
| GET | `/me` | Protected | Fetch active logged-in user |
| PUT | `/update-profile` | Protected | Update profile info / password |
| POST | `/forgot-password` | Public | Send 6-digit OTP email |
| POST | `/reset-password` | Public | Reset password using OTP |
| POST | `/refresh-token` | Public | Refresh access token |

### Products — `/api/products`
| Method | Endpoint | Access Level | Description |
|--------|----------|--------------|-------------|
| GET | `/` | Public | Fetch all products |
| GET | `/shop` | Public | Filter & search products (Aggregation Pipeline) |
| GET | `/detail/:id` | Public | Get single product details |
| GET | `/seller-products` | Seller | Get logged-in seller's products |
| POST | `/create` | Seller | Create new product |
| PUT | `/update/:productId` | Seller | Update product metadata |
| DELETE | `/:productId` | Seller | Delete product & Cloudinary images |
| POST | `/:productId/variant` | Seller | Add variant to product |
| PUT | `/:productId/variant/:variantId` | Seller | Update variant |
| DELETE | `/:productId/variant/:variantId` | Seller | Delete variant |

### Cart — `/api/cart`
| Method | Endpoint | Access Level | Description |
|--------|----------|--------------|-------------|
| GET | `/` | Protected | Fetch active user cart |
| POST | `/add` | Protected | Add variant item to cart |
| PUT | `/update` | Protected | Update item quantity |
| DELETE | `/remove` | Protected | Remove item from cart |

### Orders — `/api/orders`
| Method | Endpoint | Access Level | Description |
|--------|----------|--------------|-------------|
| POST | `/create-order` | Protected | Create Razorpay order |
| POST | `/verify-payment` | Protected | Verify Razorpay signature |
| POST | `/webhook` | Public | Razorpay Webhook listener |
| GET | `/my-orders` | Protected | Fetch buyer's order history |
| PUT | `/my-orders/:orderId/cancel` | Protected | Cancel pending order |
| GET | `/seller/all` | Seller | Fetch all customer orders |
| PUT | `/seller/:id/status` | Seller | Update order fulfillment status |
| DELETE | `/seller/:id` | Seller | Delete order record |

### Wishlist — `/api/wishlist`
| Method | Endpoint | Access Level | Description |
|--------|----------|--------------|-------------|
| GET | `/` | Protected | Fetch user's wishlist |
| POST | `/toggle` | Protected | Toggle product in wishlist (add/remove) |

---

## 🛠️ Setup & Running

```bash
# 1. Clone repository
git clone https://github.com/bilalsk111/stylix.git
cd snitch

# 2. Setup Backend
cd Backend
npm install
npm run dev

# 3. Setup Frontend (in separate terminal)
cd Frontend
npm install
npm run dev
```

---

## 📄 License

ISC License — © 2026 Stylix
