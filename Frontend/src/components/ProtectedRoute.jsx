import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({children}) => {
    // 🔥 FIX: Correctly extract 'isAuthChecked' instead of 'authChecked'
    const { user, loading, isAuthChecked } = useSelector((state) => state.auth);
    const location = useLocation();

    // Jab tak check nahi hota ya loading true hai, ruk jao
    if (!isAuthChecked || loading) {
        return (
            <div className="h-screen w-full bg-[#f7f6f4] flex items-center justify-center">
                <div className="text-stone-900 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
                    Authenticating Vault...
                </div>
            </div>
        );
    }

    // Checking ke baad agar user (currentUser nahi, kyuni slice me state.user hai) nahi mila, to login pe fenk do
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;