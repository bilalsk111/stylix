import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hook/useAuth';

const ProtectedSellerRoute = () => {
const { currentUser, isLoading, isAuthChecked } = useAuth();

if (!isAuthChecked) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      Checking auth...
    </div>
  );
}

if (!currentUser) {
  return <Navigate to="/login" replace />;
}

if (currentUser.role !== 'seller') {
  return <Navigate to="/" replace />;
}

return <Outlet />;
};

export default ProtectedSellerRoute;