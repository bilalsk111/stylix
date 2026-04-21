import React, { useState } from "react";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (errors.auth) setErrors((prev) => ({ ...prev, auth: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await handleLogin({ email: formData.email, password: formData.password });
      
      const role = user?.role || user?.user?.role;

      if (role === "buyer") {
        navigate("/");
      } else if (role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErrors({
        auth: err.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = (error) => `
    w-full bg-white/[0.03] border-b text-white text-sm px-4 py-4 outline-none 
    rounded-t-lg transition-all duration-300 
    placeholder:text-white/20 placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-[9px]
    autofill:shadow-[0_0_0_1000px_#080808_inset]
    [-webkit-text-fill-color:white!important]
    ${error ? "border-red-500/50" : "border-white/10 focus:border-[#c8ff00] focus:bg-white/[0.07] focus:shadow-[0_10px_30px_-15px_rgba(200,255,0,0.15)]"}
  `;

  return (
    <div className="min-h-screen bg-[#080808] text-[#e5e2e1] font-sans selection:bg-[#c8ff00] selection:text-black flex overflow-hidden">
      
      {/* LEFT: Editorial Side */}
      <div className="hidden lg:block w-1/2 fixed inset-y-0 left-0 border-r border-white/5">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5 }}
          src="/sytlix.jpg"
          alt="Editorial"
          className="w-full h-full object-cover mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-90" />
        <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-[#c8ff00] to-transparent opacity-50" />
        
        <div className="absolute inset-0 flex flex-col justify-between p-20">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[#c8ff00] text-sm font-black tracking-[0.5em] uppercase"
          >
            stylix.
          </motion.h2>
          
          <div>
            <motion.h1 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white font-black leading-[0.8] text-[8rem] tracking-tighter mb-8"
            >
              STAY
              <br />
              <span className="text-[#c8ff00] drop-shadow-[0_0_30px_rgba(200,255,0,0.3)]">ICONIC.</span>
            </motion.h1>
            <p className="text-white/40 text-lg max-w-sm font-light leading-relaxed">
              Welcome back to the vault. Access your curated collection and the latest drops.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-12 h-[1px] bg-[#c8ff00]" />
            <span className="text-[9px] text-white/30 tracking-[0.4em] font-bold uppercase">
              Terminal v.2.0
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex items-center justify-center p-8 py-20 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px]"
        >
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[1px] w-6 bg-[#c8ff00]" />
              <span className="text-[10px] text-[#c8ff00] font-black tracking-widest uppercase">
                Secure Member Access
              </span>
            </div>
            <h2 className="text-white text-5xl font-black tracking-tighter uppercase">
              Login
            </h2>
          </div>

          {/* Social Auth */}
          <a
            href="/api/auth/google"
            className="w-full group flex items-center justify-center gap-3 bg-white hover:bg-[#f2f2f2] text-black py-4 rounded-xl transition-all duration-300 mb-8"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span className="text-xs font-bold tracking-tight">Continue with Google</span>
          </a>

          <div className="relative flex items-center mb-10">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[9px] text-white/20 font-bold uppercase tracking-[0.3em]">
              OR
            </span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7" noValidate>
            <AnimatePresence>
              {errors.auth && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] p-4 rounded-xl tracking-widest uppercase text-center font-bold"
                >
                  {errors.auth}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="group">
              <label className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-2 block group-focus-within:text-[#c8ff00] transition-colors">
                Identity
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="EMAIL@PROVIDER.COM"
                className={inputClasses(errors.email)}
              />
              {errors.email && <p className="text-red-400 text-[9px] mt-2 tracking-widest uppercase">{errors.email}</p>}
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] block group-focus-within:text-[#c8ff00] transition-colors">
                  Password
                </label>
                <button type="button" className="text-[9px] text-white/20 hover:text-[#c8ff00] uppercase tracking-widest transition-colors">
                  Reset?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputClasses(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#c8ff00] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-[9px] mt-2 tracking-widest uppercase">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className={`w-full group bg-[#c8ff00] text-black font-black py-5 rounded-xl text-xs uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3
                ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-white active:scale-95 shadow-[0_20px_40px_-10px_rgba(200,255,0,0.3)] hover:shadow-none"}`}
            >
              {isLoading ? "Validating..." : (
                <>
                  Enter Vault <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </motion.button>

            <p className="mt-10 text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.25em]">
              New to Stylix?{" "}
              <a href="/register" className="text-white hover:text-[#c8ff00] border-b border-white/10 transition-colors">
                Create Account
              </a>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;