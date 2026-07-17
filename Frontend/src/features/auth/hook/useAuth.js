import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setError } from "../state/auth.slice";
import { forgotPasswordAPI, login, logoutApi, register, resetPasswordAPI } from "../services/auth.api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading, error, isAuthChecked } = useSelector((state) => state.auth);

  const handleRegister = async (payload) => {
    dispatch(setLoading(true));
    try {
      const data = await register(payload);
      dispatch(setUser(data.user));
      toast.success("Account created successfully!", {
        style: { background: '#000000', color: '#ccff00', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
        duration: 2000,
      });
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      dispatch(setError(msg));
      toast.error(msg, {
        style: { background: '#000000', color: '#ff4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
        duration: 2000,
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
        duration: 2000,
      });
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      dispatch(setError(msg));
      toast.error(msg, {
        style: { background: '#000000', color: '#ff4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
        duration: 2000,
      });
      throw new Error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
      dispatch(setUser(null));
      dispatch(setError(null));
      // toast.success("Logged out successfully", {
      //   style: { background: '#000000', color: '#ccff00', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
      //   duration: 2000,
      // });
      navigate("/login");
    } catch (error) {
      // toast.error(`Logout failed: ${error.message}`, {
      //   style: { background: '#000000', color: '#ff4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
      //   duration: 2000,
      // });
      console.error("Logout failed:", error);
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

export const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email required");

    setLoading(true);
    try {
      const res = await forgotPasswordAPI(email);
      toast.success(res.message);
      setTimeout(() => navigate("/reset-password"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, loading, handleForgot };
};

export const useResetPassword = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (token.length !== 6) return toast.error("Token must be 6 chars");
    if (newPassword.length < 6) return toast.error("Password min 6 chars");

    setLoading(true);
    try {
      const res = await resetPasswordAPI(token.toUpperCase(), newPassword);
      toast.success(res.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid token");
    } finally {
      setLoading(false);
    }
  };

  return { token, setToken, newPassword, setNewPassword, loading, handleReset };
};