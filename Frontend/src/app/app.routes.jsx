import { createBrowserRouter } from "react-router-dom";
import ProtectedSellerRoute from "../components/ProtectedSellerRoute";
import CreateProduct from "../features/products/pages/CreateProduct";
import SellerDashboard from "../features/products/pages/SellerDashboard";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import AllProducts from "../features/products/pages/AllProducts";
import ProductDetail from "../features/products/pages/ProductDetail";
import Layout from "../components/Layout";

export const routes = createBrowserRouter([
  {
    // Public Layout Routes
    element: <Layout />,
    children: [
      { path: "/", element: <AllProducts /> },
      { path: "/product/:id", element: <ProductDetail /> },
    ],
  },
  {
    // Protected Seller Routes
    element: <ProtectedSellerRoute />,
    children: [
      { path: "/seller/dashboard", element: <SellerDashboard /> },
      { path: "/seller/create-product", element: <CreateProduct /> },
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