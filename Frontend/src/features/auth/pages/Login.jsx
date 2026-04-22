import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Shield, Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";



export default function Login() {
  const { handleLogin,currentUser} = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
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
      const response = await handleLogin({ email: formData.email, password: formData.password });
      
      // 💡 DEBUG: Console me dekho backend exactly kya bhej raha hai
      console.log("Login Response Data:", response);

      // 🛡️ SAFE EXTRACTION: Har possible jagah se role dhundhne ki koshish karega
      const rawRole = response?.role || response?.user?.role || response?.data?.user?.role || currentUser?.role;
      
      // 🛡️ CASE INSENSITIVE: "SELLER", "Seller", "seller" sabko handle karega
      const role = rawRole ? rawRole.toLowerCase() : "buyer"; 

      if (role === "seller") {
        navigate("/seller/dashboard");
      } else {
        // Agar buyer hai ya role nahi bhi mila, toh default Home par bhej do
        navigate("/");
      }

    } catch (err) {
      setErrors({ auth: err.message || "Invalid credentials. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };
  // ── Bottom-border-only input ───────────────────────────────────────────────
  const inputStyle = (fieldName, error) => {
    const isFocused = focusedField === fieldName;
    return [
      "w-full text-stone-900 text-sm px-3 pb-3 rounded-t-md py-3 outline-none bg-transparent",
      "border-0 border-b-2 transition-all duration-300",
      "placeholder:text-stone-300 placeholder:uppercase  placeholder:tracking-widest placeholder:text-[10px]",
      error
        ? "border-red-400"
        : isFocused
        ? "border-stone-900"
        : "border-stone-200 hover:border-stone-300",
    ].join(" ");
  };

  // ── Label — turns dark/accent on focus ────────────────────────────────────
  const labelStyle = (fieldName, error) => {
    const isFocused = focusedField === fieldName;
    return [
      "text-[9px] font-black uppercase tracking-[0.25em] mb-1.5 block transition-colors duration-300",
      error ? "text-red-500" : isFocused ? "text-stone-900" : "text-stone-400",
    ].join(" ");
  };

  return (
    <div className="min-h-screen flex bg-[#f7f6f4] font-sans selection:bg-stone-900 selection:text-white">

      {/* ── LEFT — editorial panel ────────────────────────────────────────── */}
      <div className="hidden lg:block w-1/2 fixed inset-y-0 left-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800" />
        <img
          src="/sytlix.jpg"
          alt="Stylix editorial"
          className="relative w-full h-full object-cover object-center z-0"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)," +
              "repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-between p-14 z-10">
          <div className="flex items-center gap-3">
            {/* <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00]" /> */}
            <h2 className="text-white text-md font-black tracking-[0.45em] uppercase">stylix.</h2>
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-bold tracking-[0.35em] uppercase mb-5">
              Member Access
            </p>
            <h1 className="text-white font-black leading-[0.82] text-[6.5rem] tracking-tighter mb-7">
              STAY
              <br />
              <span className="text-stone-400">ICONIC.</span>
            </h1>
            <p className="text-white/40 text-base max-w-xs font-light leading-relaxed">
              Welcome back to the vault. Access your curated collection and the latest drops.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-px bg-[#c8ff00]" />
              <span className="text-[9px] text-white/25 tracking-[0.4em] font-bold uppercase">Terminal v.2.0</span>
            </div>
            <p className="text-[9px] text-white/20 tracking-widest font-bold uppercase">
              © 2025 Stylix. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT — form panel ────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] min-h-screen flex items-center justify-center p-8 py-16 bg-white">
        <div className="w-full max-w-[400px]">

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00]" />
            <span className="text-stone-900 text-sm font-black tracking-[0.4em] uppercase">stylix.</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-6 bg-stone-900" />
              <span className="text-[9px] text-stone-400 font-black tracking-[0.3em] uppercase">Secure Member Access</span>
            </div>
            <h2 className="text-stone-900 text-[2.4rem] font-black tracking-tight uppercase leading-none mb-2">
              Login
            </h2>
            <p className="text-stone-400 text-[11px] font-medium tracking-wide">
              Access exclusive drops and your curated collections.
            </p>
          </div>

          {/* Google SSO */}
          <a
            href="/api/auth/google"
            className="w-full group flex items-center justify-center gap-3 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 hover:shadow-md text-stone-700 py-3.5 rounded-2xl transition-all duration-200 mb-8 shadow-sm active:scale-[0.99]"
          >
            <svg className="w-4 h-4 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span className="text-xs font-semibold tracking-wide text-stone-600">Continue with Google</span>
          </a>

          {/* Divider */}
          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-stone-100" />
            <span className="flex-shrink mx-4 text-[9px] text-stone-300 font-bold uppercase tracking-[0.3em]">or</span>
            <div className="flex-grow border-t border-stone-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7" noValidate>

            {errors.auth && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[9px] p-3.5 rounded-xl tracking-widest uppercase text-center font-bold">
                ✕ {errors.auth}
              </div>
            )}

            {/* Email */}
            <div>
              <label className={labelStyle("email", errors.email)}>
                Identity
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="EMAIL@PROVIDER.COM"
                autoComplete="email"
                className={inputStyle("email", errors.email)}
              />
              {errors.email && (
                <p className="text-red-500 text-[9px] mt-1.5 tracking-wide flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={labelStyle("password", errors.password)}>
                  Password
                </label>
                <button
                  type="button"
                  className="text-[9px] text-stone-400 hover:text-stone-700 uppercase tracking-widest font-bold transition-colors cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={inputStyle("password", errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-700 transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-[9px] mt-1.5 tracking-wide flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Primary CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full bg-stone-900 text-white font-black py-[18px] rounded-2xl text-[11px] uppercase tracking-[0.35em]
                  hover:bg-stone-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.20)] hover:-translate-y-[1px]
                  active:translate-y-0 active:shadow-sm active:bg-stone-900
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:bg-stone-900
                  transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying…
                  </span>
                ) : (
                  <>
                    Enter Vault
                    <ArrowRight
                      size={15}
                      strokeWidth={2.5}
                      className="transition-transform duration-200 group-hover:translate-x-1.5"
                    />
                  </>
                )}
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-5">
              <div className="flex items-center gap-1.5 text-stone-400">
                <Shield size={10} strokeWidth={2} />
                <span className="text-[9px] font-semibold tracking-widest uppercase">Encrypted</span>
              </div>
              <span className="w-px h-3 bg-stone-200" />
              <div className="flex items-center gap-1.5 text-stone-400">
                <Lock size={10} strokeWidth={2} />
                <span className="text-[9px] font-semibold tracking-widest uppercase">Secure</span>
              </div>
              <span className="w-px h-3 bg-stone-200" />
              <div className="flex items-center gap-1.5 text-stone-400">
                <Zap size={10} strokeWidth={2} />
                <span className="text-[9px] font-semibold tracking-widest uppercase">Trusted</span>
              </div>
            </div>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-stone-300 text-[9px] font-bold uppercase tracking-[0.3em]">
            New to Stylix?{" "}
            <a href="/register" className="text-stone-800 hover:text-stone-600 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-500 transition-all">
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}