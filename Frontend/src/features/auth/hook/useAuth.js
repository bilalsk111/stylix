import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setError } from "../state/auth.slice";
import { login, register } from "../services/auth.api";
import toast from "react-hot-toast";

export const useAuth = () => {
  const dispatch = useDispatch();

  const { user, loading, error, isAuthChecked } = useSelector((state) => state.auth);

  const handleRegister = async (payload) => {
    dispatch(setLoading(true));
    try {
      const data = await register(payload);
      dispatch(setUser(data.user));
      toast.success("Account created successfully!");
      return data.user; 
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      dispatch(setError(msg));
      toast.error(msg);
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
      toast.success("Welcome back!");
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      dispatch(setError(msg));
      toast.error(msg);
      throw new Error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

return { 
  currentUser: user, 
  isLoading: loading,
  isAuthChecked,
  authError: error,
  handleRegister, 
  handleLogin 
};
};