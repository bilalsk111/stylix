import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setError } from "../state/auth.slice";
import { login, logoutApi, register } from "../services/auth.api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading, error, isAuthChecked } = useSelector((state) => state.auth);


  const handleRegister = async (payload) => {
    dispatch(setLoading(true));
    try {
      const data = await register(payload);
      dispatch(setUser(data.user));
      toast.success("Account created successfully!", {
        style: { background: '#000000', color: '#ccff00', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
        duration: 2000
      });
      return data.user; 
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      dispatch(setError(msg));
      toast.error(msg, {
        style: { background: '#000000', color: '#ff4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
        duration: 2000
      });
      throw new Error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogin = async (payload) => {
    dispatch(setLoading(true));
    try {
      const data = await login(payload);
      dispatch(setUser(data.user));
      toast.success("Welcome back!", {
        style: { background: '#000000', color: '#ccff00', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
        duration: 2000
      });
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      dispatch(setError(msg));
      toast.error(msg, {
        style: { background: '#000000', color: '#ff4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
        duration: 2000
      });
      throw new Error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };
// Example of logout function
 const handleLogout = async () => {
    try {
        // Agar backend api hai logout ki (cookies clear karne ke liye)
        await logoutApi(); 
        
        // Redux/Context state clear karo
        dispatch(logoutApi()); 
        
        toast.success("Logged out successfully", {
          style: { background: '#000000', color: '#ccff00', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
          duration: 2000
        });
        navigate("/login");
    } catch (error) {
        toast.error(`Logout failed: ${error.message}`, {
          style: { background: '#000000', color: '#ff4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
          duration: 2000
        });
    }
};
return { 
  currentUser: user, 
  isLoading: loading,
  isAuthChecked,
  authError: error,
  handleRegister, 
  handleLogin,
  handleLogout,
};
};