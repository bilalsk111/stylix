import { createBrowserRouter } from "react-router-dom";
import ProtectedSellerRoute from "../components/ProtectedSellerRoute";
import CreateProduct from "../features/products/pages/CreateProduct";
import SellerDashboard from "../features/products/pages/SellerDashboard";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import AllProducts from "../features/products/pages/AllProducts";
import ProductDetail from "../features/products/pages/ProductDetail";
import Layout from "../components/Layout";
import SellerProductDetails from "../features/products/pages/SellerProductDeatails";
import Cart from "../features/cart/pages/Cart";
import ProtectedRoute from "../components/ProtectedRoute";
import Chackout from "../features/products/pages/Checkout";
import Success from "../features/cart/pages/Success";
import SellerOrder from "../features/order/pages/SellerOrder";
import Profile from "../features/products/pages/Profile";
export const routes = createBrowserRouter([
  {
    // Public Layout Routes
    element: <Layout />,
    children: [
      { path: "/", element: <AllProducts /> },
      { path: "/product/:id", element: <ProductDetail /> },
      {
        path: '/profile',
        element: <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      },
    ],
  },
  {
    path: "/bag",
    element: <ProtectedRoute>
      <Cart />
    </ProtectedRoute>
  },
  {
    path: "/checkout",
    element: <ProtectedRoute>
      <Chackout />
    </ProtectedRoute>
  },
  {
    path: '/success',
    element: <Success />
  },
  {
    element: <ProtectedSellerRoute />,
    children: [
      { path: "/seller/dashboard", element: <SellerDashboard /> },
      { path: "/seller/create-product", element: <CreateProduct /> },
      { path: "/seller/productdetail/:id", element: <SellerProductDetails /> },
      { path: "/seller/orders", element: <SellerOrder /> },
    ],
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
]);