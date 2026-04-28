import { useState } from "react";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Shield, Lock, Zap, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

export default function Register() {
  const { handleRegister, currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  
  // 🔥 FIX 1: Exact backend match - 'fullname' and 'contact'
  const [form, setForm] = useState({
    fullname: "", 
    contact: "", 
    email: "",
    password: "",
    isSeller: false,
  });
  
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Reusable state updater
  const set = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
    if (errors.auth) setErrors((p) => ({ ...p, auth: null }));
  };

  // Password strength logic
  const pwStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s += 25;
    if (/[A-Z]/.test(pw)) s += 25;
    if (/[0-9]/.test(pw)) s += 25;
    if (/[^A-Za-z0-9]/.test(pw)) s += 25;
    return s;
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!form.fullname.trim()) newErrors.fullname = "Full name is required";
      if (!form.contact.trim()) newErrors.contact = "Contact number is required";
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        newErrors.email = "Invalid email address";
      if (!form.password) newErrors.password = "Password is required";
      else if (form.password.length < 8) newErrors.password = "Min 8 characters required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const response = await handleRegister(form);
      
      const rawRole = response?.role || response?.user?.role || response?.data?.user?.role || currentUser?.role || (form.isSeller ? "seller" : "buyer");
      const role = rawRole ? rawRole.toLowerCase() : "buyer";

      if (role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      setErrors({ auth: err.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Implement your Google Auth Logic here
    console.log("Initiating Google Auth...");
  };

  // ── Exact Input Styles from your Login ─────────────────────────────────────
  const inputStyle = (fieldName, error) => {
    const isFocused = focusedField === fieldName;
    return [
      "w-full text-stone-900 text-sm px-3 pb-3 rounded-t-md py-3 outline-none bg-transparent",
      "border-0 border-b-2 transition-all duration-300",
      "placeholder:text-stone-300 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]",
      error
        ? "border-red-400"
        : isFocused
          ? "border-stone-900"
          : "border-stone-200 hover:border-stone-300",
    ].join(" ");
  };

  const labelStyle = (fieldName, error) => {
    const isFocused = focusedField === fieldName;
    return [
      "text-[9px] font-black uppercase tracking-[0.25em] mb-1.5 block transition-colors duration-300",
      error ? "text-red-500" : isFocused ? "text-stone-900" : "text-stone-400",
    ].join(" ");
  };

  return (
    <div className="min-h-screen flex bg-[#f7f6f4] font-sans selection:bg-stone-900 selection:text-white">

      {/* ── LEFT — editorial panel ─────────────────── */}
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
            <h2 className="text-white text-md font-black tracking-[0.45em] uppercase">stylix.</h2>
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-bold tracking-[0.35em] uppercase mb-5">
              New Member
            </p>
            <h1 className="text-white font-black leading-[0.82] text-[6.5rem] tracking-tighter mb-7">
              JOIN
              <br />
              <span className="text-stone-400">THE ELITE.</span>
            </h1>
            <p className="text-white/40 text-base max-w-xs font-light leading-relaxed">
              Create your account to unlock curated collections and secure your access to exclusive drops.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-px bg-[#c8ff00]" />
              <span className="text-[9px] text-white/25 tracking-[0.4em] font-bold uppercase">Terminal v.2.0</span>
            </div>
            <p className="text-[9px] text-white/20 tracking-widest font-bold uppercase">
              © 2026 Stylix. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT — form panel ────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] min-h-screen flex items-center justify-center p-8 py-16 bg-white relative">
        <div className="w-full max-w-[400px]">

          <div className="lg:hidden flex items-center gap-2 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00]" />
            <span className="text-stone-900 text-sm font-black tracking-[0.4em] uppercase">stylix.</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-stone-900" />
                <span className="text-[9px] text-stone-400 font-black tracking-[0.3em] uppercase">
                  Secure Registration
                </span>
              </div>
              <span className="text-[9px] text-stone-400 font-bold tracking-[0.2em] uppercase bg-stone-100 px-2 py-1 rounded">
                Step {step} of 2
              </span>
            </div>
            <h2 className="text-stone-900 text-[2.4rem] font-black tracking-tight uppercase leading-none mb-2">
              Register
            </h2>
            <p className="text-stone-400 text-[11px] font-medium tracking-wide">
              {step === 1 ? "Tell us who you are." : "Secure your account credentials."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-7" noValidate>

            {errors.auth && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[9px] p-3.5 rounded-xl tracking-widest uppercase text-center font-bold">
                ✕ {errors.auth}
              </div>
            )}

            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-500">

                {/* Full Name */}
                <div>
                  <label className={labelStyle("fullname", errors.fullname)}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.fullname}
                    onChange={(e) => set("fullname", e.target.value)}
                    onFocus={() => setFocusedField("fullname")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="JOHN DOE"
                    className={inputStyle("fullname", errors.fullname)}
                  />
                  {errors.fullname && (
                    <p className="text-red-500 text-[9px] mt-1.5 tracking-wide flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.fullname}
                    </p>
                  )}
                </div>

                {/* Contact (Previously Phone) */}
                <div>
                  <label className={labelStyle("contact", errors.contact)}>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={form.contact}
                    onChange={(e) => set("contact", e.target.value)}
                    onFocus={() => setFocusedField("contact")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="+1 (555) 000-0000"
                    className={inputStyle("contact", errors.contact)}
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-[9px] mt-1.5 tracking-wide flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.contact}
                    </p>
                  )}
                </div>

                {/* Role Toggle */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] mb-3 block text-stone-900">
                    Account Type
                  </label>
                  <div className="flex p-1 bg-stone-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => set("isSeller", false)}
                      className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${!form.isSeller ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                    >
                      Buyer
                    </button>
                    <button
                      type="button"
                      onClick={() => set("isSeller", true)}
                      className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${form.isSeller ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                    >
                      Seller
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-4">
                  <button
                    type="submit"
                    className="group w-full bg-stone-900 text-white font-black py-[18px] rounded-2xl text-[11px] uppercase tracking-[0.35em] hover:bg-stone-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.20)] hover:-translate-y-[1px] transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    Next Phase
                    <ArrowRight size={15} strokeWidth={2.5} className="transition-transform duration-200 group-hover:translate-x-1.5" />
                  </button>

                  <div className="flex items-center gap-3 pt-3 pb-1">
                    <span className="flex-1 h-px bg-stone-200"></span>
                    <span className="text-[8px] font-black tracking-[0.2em] text-stone-400 uppercase">OR</span>
                    <span className="flex-1 h-px bg-stone-200"></span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="w-full bg-white border border-stone-200 text-[#3c4043] font-medium py-[12px] rounded-xl text-[14px] tracking-normal normal-case hover:bg-[#f8f9fa] hover:border-stone-300 hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.649-3.342-11.127-8.029l-6.571 4.82C9.656 39.663 16.318 44 24 44z" />
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Credentials ── */}
            {step === 2 && (
              <div className="space-y-7 animate-in fade-in slide-in-from-left-4 duration-500">

                {/* Email */}
                <div>
                  <label className={labelStyle("email", errors.email)}>
                    Identity (Email)
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="EMAIL@PROVIDER.COM"
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
                  <label className={labelStyle("password", errors.password)}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className={inputStyle("password", errors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-700 transition-colors p-1"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Styled Password Strength Indicator */}
                  {form.password && (
                    <div className="mt-3 flex gap-1">
                      {[1, 2, 3, 4].map((i) => {
                        const strength = pwStrength(form.password);
                        const isActive = strength >= i * 25;
                        return (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${isActive
                                ? strength <= 50 ? "bg-stone-500" : "bg-stone-900"
                                : "bg-stone-100"
                              }`}
                          />
                        );
                      })}
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-red-500 text-[9px] mt-1.5 tracking-wide flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 bg-stone-100 text-stone-900 hover:bg-stone-200 rounded-2xl transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex-1 bg-stone-900 text-white font-black py-[18px] rounded-2xl text-[11px] uppercase tracking-[0.35em] hover:bg-stone-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.20)] hover:-translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Creating…
                      </span>
                    ) : (
                      <>
                        Create Account
                        <Check size={15} strokeWidth={3} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-5 pt-3">
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

          {/* Login link */}
          <p className="mt-8 text-center text-stone-300 text-[9px] font-bold uppercase tracking-[0.3em]">
            Already a member?{" "}
            <a href="/login" className="text-stone-800 hover:text-stone-600 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-500 transition-all">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}