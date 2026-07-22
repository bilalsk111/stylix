# Stylix - Premium E-Commerce Platform

![Stylix E-Commerce](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![React](https://img.shields.io/badge/React-19.1-blue.svg)
![Express.js](https://img.shields.io/badge/Express.js-5.2-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg)
![Redis](https://img.shields.io/badge/Redis-Caching-red.svg)

A full-stack, feature-rich E-Commerce platform inspired by modern premium clothing brands like Stylix. The application provides a seamless, high-performance shopping experience for customers and a robust, intuitive dashboard for sellers to manage their inventory and product variants.

---

## 🚀 Detailed Features & Modules

### 1. 👤 Advanced Authentication & Security

The platform ensures secure and seamless user access through a multi-tiered authentication system:

- **Local & Social Login:** Supports traditional Email/Password login as well as **1-Click Google OAuth** integration using Passport.js.
- **JWT & HTTP-Only Cookies:** Secure session management preventing XSS attacks.
- **Password Recovery Flow:** Includes a comprehensive "Forgot Password" system that generates a 6-character OTP token sent via email (Nodemailer), allowing users to reset their passwords securely.
- **Role-Based Access (RBAC):** Distinct roles for **Buyers** and **Sellers**. Sellers get access to exclusive inventory management dashboards.

### 2. 🛍️ Dynamic Product & Variant Management (Seller Dashboard)

Sellers have total control over their catalog with advanced inventory tools:

- **Variant Engine:** Products aren't just flat entries. Sellers can add multiple **Variants** (e.g., Size, Color) for a single product. Each variant can have its own specific stock, price, and image gallery.
- **Media Uploads:** Seamless image uploads powered by **Multer** and **Cloudinary/ImageKit**.
- **Automated Cleanup:** When a seller deletes a product or variant, the system automatically deletes the associated images from the Cloudinary cloud storage and removes the items from active user Carts and Wishlists.

### 3. 🔍 High-Performance Search & Filtering (Aggregation Pipeline)

The backend uses a highly optimized **MongoDB Aggregation Pipeline** ("Pro Filter Engine") for searching and sorting products:

- **Faceted Search:** Users can filter products by Category (Men, Women), Size, Color, and Price Range simultaneously.
- **Fuzzy Search:** Built-in RegEx-based text search for finding products by title.
- **Sorting & Pagination:** Sort by Price (Low/High) or Newest arrivals, fully paginated at the database level for lightning-fast frontend rendering.

### 4. 🛒 Cart, Wishlist & Checkout

- **Variant-Specific Cart:** Users add specific variants (e.g., "Black Shirt - Size L") to their cart, locking in the variant's exact price and stock.
- **Secure Payments:** Integrated with **Razorpay** to process secure checkout transactions for the Indian market, complete with UI integrations (`react-razorpay`).

### 5. ✨ Modern UI/UX (Frontend)

- **Vite & React 19:** Built on the bleeding edge of React for maximum performance.
- **State Management:** Utilizing **Redux Toolkit** for centralized state (Auth, Cart, Products) and Custom Hooks (e.g., `useAuth`) for clean component logic.
- **Beautiful Design:** Styled with **TailwindCSS 4** and animated using **Framer Motion** for a premium, app-like feel. Toast notifications (`react-hot-toast`) provide real-time feedback for all user actions.

---

## 💻 Tech Stack

### Frontend

- **Framework:** React 19 (via Vite)
- **Styling:** TailwindCSS 4, Lucide React (Icons)
- **State Management:** Redux Toolkit (`react-redux`, `@reduxjs/toolkit`)
- **Routing:** React Router v7
- **Animations:** Framer Motion
- **Payments:** React Razorpay
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** MongoDB (Mongoose with Aggregation Pipelines)
- **Caching:** Redis (ioredis)
- **Authentication:** Passport.js (Google OAuth), JWT, bcrypt
- **Media Storage:** Cloudinary & ImageKit
- **Payments Gateway:** Razorpay
- **Emails:** Nodemailer

---

## 📂 Project Structure

```text
Stylix/
├── Backend/                 # Express.js server
│   ├── src/
│   │   ├── controllers/     # Business logic (e.g., product, auth, cart)
│   │   ├── models/          # Mongoose schemas (Product, User, Cart, Wishlist)
│   │   ├── routes/          # Express API routes
│   │   ├── services/        # Third-party integrations (Cloudinary, Email)
│   │   ├── middlewares/     # Auth checks, Upload processing
│   │   └── ...
│   ├── server.js            # Entry point for backend
│   └── package.json
└── Frontend/                # React application (Vite)
    ├── src/
    │   ├── features/        # Feature-sliced design (auth, products, checkout)
    │   ├── components/      # Reusable UI components (Buttons, Modals)
    │   ├── pages/           # Page layouts (Login, SellerDashboard, Profile)
    │   ├── hooks/           # Custom React hooks (e.g., useAuth, useResetPassword)
    │   └── App.jsx
    └── package.json
```

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have the following installed on your local development environment:

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Redis Server
- Razorpay Account (for test API keys)
- Cloudinary or ImageKit Account (for media uploads)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/Stylix.git
   cd Stylix
   ```

2. **Setup the Backend:**

   ```bash
   cd Backend
   npm install
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../Frontend
   npm install
   ```

### ⚙️ Environment Variables

Create a `.env` file in the **Backend** directory and provide the necessary credentials:

```env
# Server Config
PORT=5000
MONGO_URI=your_mongodb_connection_string

# Redis Config
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT & Authentication
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary / ImageKit
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Email (Nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 🏃‍♂️ Running the Application

**Start the Backend Server (Development Mode):**

```bash
cd Backend
npm run dev
```

_The server will start at `http://localhost:5000`_

**Start the Frontend Application:**

```bash
cd Frontend
npm run dev
```

_The React app will be accessible at `http://localhost:5173`_

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/your-username/Stylix/issues).

## 📄 License

This project is licensed under the ISC License.
