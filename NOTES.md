# Stylix — Developer Notes & Technical Architecture

This document contains internal technical documentation, key architectural decisions, state management strategies, and performance guidelines for developers working on the Stylix codebase.

---

## 📌 1. Key Architectural Principles

### Stale-While-Revalidate (SWR) & 0ms Navigation
To achieve instant page navigation without intrusive full-screen loaders or screen flickering:
- **Redux-First Data Strategy:** Always inspect Redux store state before showing loaders. If cached items exist, display them immediately.
- **Silent Background Fetch:** Initiate background API calls inside `useEffect` hooks without setting global blocking `loading` states.
- **Localized Skeletons:** If data is missing on initial load, render skeleton placeholders inside content sections only—never unmount or block the Navbar, Sidebar, or Page Layout.
- **Reference Stability:** Define fallback constants (`EMPTY_ARRAY = []`, `EMPTY_OBJECT = {}`) outside component scope to prevent unnecessary re-render loops caused by `useSelector` default values.

### Authentication Flow & Route Guards
- `App.jsx` triggers a one-shot boot authentication check (`initAuth`) calling `getMe()`.
- Upon completion, `isAuthChecked` is set to `true` in Redux (`auth.slice`).
- `ProtectedRoute.jsx` gates rendering **ONLY on `isAuthChecked`**, NOT on the shared `loading` flag.
  - *Why?* The `loading` flag is shared by `login`, `register`, and `updateProfile`. Using `loading` in `ProtectedRoute` causes full-page unmounting whenever a user updates their profile.

---

## 🛠️ 2. State Management & Hooks

### Feature-Sliced Structure
Each domain feature (`auth`, `products`, `cart`, `order`, `wishlist`) contains:
- `hook/`: Custom React hooks encapsulating dispatchers and selectors (`useAuth`, `useProduct`, `useCart`, `useOrder`, `useWishlist`).
- `services/`: Axios API call definitions.
- `state/`: Redux Toolkit slices.
- `pages/` & `components/`: UI interfaces.

### Optimistic UI Updates
For Cart & Wishlist operations:
1. Dispatch local state updates immediately to give instant UI feedback.
2. Trigger the backend API call asynchronously.
3. In case of API rejection, rollback the Redux state and present a toast notification.

---

## ⚡ 3. Backend & Database Optimization

### MongoDB Aggregation Pipelines (Filter Engine)
- The product filter endpoint (`/api/products/shop`) uses `$match`, `$text`, `$sort`, `$facet`, `$skip`, and `$limit` for paginated faceted searching.
- Text indexes are created on `title`, `description`, and `tags`.
- Compound index on `{ category: 1, "price.amount": 1 }` enables high-speed range queries across large catalogs.

### Cloud Storage & Cascade Deletion
- Images are processed in-memory via `Multer` before uploading to Cloudinary.
- When deleting a product or variant, backend cleanup routines automatically delete associated Cloudinary assets and pull the item references out of existing carts.

---

## 📋 4. Developer Conventions & Rules

1. **Never use inline fallback arrays/objects** in `useSelector` (e.g., `state.items || []`). Use a module-scoped `EMPTY_ARRAY` constant.
2. **Do not add `loading` state to ProtectedRoute checks.**
3. **Always use `currentUser?._id`** rather than `currentUser` object references in dependency arrays to prevent loops on profile mutation.
4. **Use Toast notifications (`react-hot-toast`)** with consistent styling (Dark background `#000000`, accent text `#ccff00` / error `#ff4444`).
