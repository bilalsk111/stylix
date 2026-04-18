import { useState } from "react";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check } from "lucide-react";

export default function Register() {
  const { handleRegister,currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    isSeller: false,
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    setErrors((p) => ({ ...p, [field]: null }));
  };

  // Matches backend: uppercase, lowercase, number, special char, min 8
  const pwStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[\W_]/.test(pw)) s++;
    return s;
  };

  const step1Valid = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Name is required";
    else if (form.fullName.trim().length < 3)
      e.fullName = "Name must be at least 3 characters";
    else if (!/^[a-zA-Z\s]+$/.test(form.fullName))
      e.fullName = "Name must contain only letters";
    if (!/^\+?[1-9]\d{7,14}$/.test(form.phone.replace(/\s/g, ""))) {
      e.phone = "Enter a valid number with country code (e.g. +919876543210)";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const step2Valid = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email looks invalid";
    if (form.password.length < 8) e.password = "Minimum 8 characters";
    else if (!/[A-Z]/.test(form.password))
      e.password = "Must include an uppercase letter";
    else if (!/[a-z]/.test(form.password))
      e.password = "Must include a lowercase letter";
    else if (!/[0-9]/.test(form.password)) e.password = "Must include a number";
    else if (!/[\W_]/.test(form.password))
      e.password = "Must include a special character";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!step2Valid()) return;
    setLoading(true);
    try {
      await handleRegister({
        email: form.email,
        contact: form.phone.replace(/\s/g, ""),
        password: form.password,
        isSeller: form.isSeller,
        fullname: form.fullName,
      });
       if(currentUser.role == "buyer"){
        navigate("/")
      }else if(currentUser.role == "seller"){
        navigate("/seller/dashboard")
      }
    } catch (err) {
      const msg = err.message || "Registration failed, try again";
      if (msg.toLowerCase().includes("email")) {
        setErrors({ email: msg });
        setStep(2);
      } else if (
        msg.toLowerCase().includes("phone") ||
        msg.toLowerCase().includes("contact")
      ) {
        setErrors({ phone: msg });
        setStep(1);
      } else {
        setErrors({ submit: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = pwStrength(form.password);
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-400",
    "bg-[#c8ff00]",
    "bg-[#c8ff00]",
  ];
  const strengthLabels = ["", "WEAK", "MEH", "OK", "GOOD", "SECURE"];

  const inputStyle = (error) => `
    w-full bg-white/[0.03] border-b text-white text-sm px-4 py-4 outline-none 
    rounded-t-lg transition-all duration-300 
    placeholder:text-white/20 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]
    autofill:shadow-[0_0_0_1000px_#080808_inset]
    [-webkit-text-fill-color:white!important]
    ${error ? "border-red-500/50" : "border-white/10 focus:border-[#c8ff00] focus:bg-white/[0.07]"}
  `;

  return (
    <div className="min-h-screen flex bg-[#080808] font-sans selection:bg-[#c8ff00] selection:text-black">
      {/* LEFT - Editorial Panel */}
      <div className="hidden lg:block w-1/2 fixed inset-y-0 left-0">
        <img
          src="/sytlix2.jpg"
          alt=""
          className="w-full h-full object-center object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#080808] via-transparent to-transparent opacity-90" />
        <div className="absolute top-0 left-0 w-[2px] h-full bg-[#c8ff00]" />

        <div className="absolute inset-0 flex flex-col justify-between p-16">
          <h2 className="text-[#c8ff00] text-xl font-black tracking-[0.4em] uppercase">
            stylix.
          </h2>
          <div>
            <h1 className="text-white font-black leading-[0.85] text-[7rem] tracking-tighter mb-8">
              UNLEASH
              <br />
              <span className="text-[#c8ff00]">STYLE.</span>
            </h1>
            <p className="text-white/40 text-lg max-w-sm font-light leading-relaxed">
              Step into the vault. Exclusive drops and high-fidelity streetwear
              designed for the bold.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`h-[2px] transition-all duration-700 ${step === 1 ? "w-16 bg-[#c8ff00]" : "w-8 bg-white/20"}`}
            />
            <div
              className={`h-[2px] transition-all duration-700 ${step === 2 ? "w-16 bg-[#c8ff00]" : "w-8 bg-white/20"}`}
            />
            <span className="text-[10px] text-white/30 tracking-[0.2em] font-bold">
              PHASE 0{step}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-h-screen lg:w-1/2 lg:ml-[50%] flex items-center justify-center p-8 py-20">
        <div className="w-full max-w-[420px]">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[1px] w-8 bg-[#c8ff00]" />
              <span className="text-[10px] text-[#c8ff00] font-black tracking-widest uppercase">
                Start Journey
              </span>
            </div>
            <h2 className="text-white text-4xl font-black tracking-tight uppercase">
              {step === 1 ? "Personal Info" : "Access Credentials"}
            </h2>
          </div>

          <a
            href="/api/auth/google"
            className="w-full group flex items-center justify-center gap-3 bg-white border border-[#dadce0] hover:bg-[#f8f9fa] text-[#3c4043] py-3 rounded-lg transition-all duration-300 mb-8 shadow-sm"
          >
            {/* Official Google Multi-color Logo */}
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              viewBox="0 0 48 48"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>

            {/* Typography: Using "Sign in with Google" or "Continue" as per guidelines */}
            <span className="text-sm font-medium tracking-normal font-sans">
              Continue with Google
            </span>
          </a>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[10px] text-white/20 font-bold uppercase tracking-widest">
              Or via Email
            </span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] p-4 rounded-lg tracking-widest uppercase text-center mb-6">
              {errors.submit}
            </div>
          )}

          <form className="space-y-6" noValidate>
            {step === 1 ? (
              <>
                <div className="group">
                  <label className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-2 block transition-colors group-focus-within:text-[#c8ff00]">
                    Identity
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="FULL NAME"
                    autoComplete="name"
                    className={inputStyle(errors.fullName)}
                  />
                  {errors.fullName && (
                    <p className="text-red-400 text-[9px] mt-2 tracking-widest">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-2 block group-focus-within:text-[#c8ff00]">
                    Contact Number
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    type="tel"
                    placeholder="+91XXXXXXXXXX"
                    autoComplete="tel"
                    className={inputStyle(errors.phone)}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-[9px] mt-2 tracking-widest">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => set("isSeller", !form.isSeller)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-white tracking-wide">
                      Register as Seller
                    </p>
                    <p className="text-[10px] text-white/30 uppercase mt-1">
                      Join the vendor marketplace
                    </p>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${form.isSeller ? "bg-[#c8ff00]" : "bg-white/10"}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full transition-all ${form.isSeller ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"}`}
                    />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => step1Valid() && setStep(2)}
                  className="w-full bg-[#c8ff00] text-black font-black py-5 rounded-lg text-xs uppercase tracking-[0.3em] hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Next Phase <ArrowRight size={16} strokeWidth={3} />
                </button>
              </>
            ) : (
              <>
                <div className="group">
                  <label className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-2 block group-focus-within:text-[#c8ff00]">
                    Email Address
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    type="email"
                    placeholder="YOU@DOMAIN.COM"
                    autoComplete="email"
                    className={inputStyle(errors.email)}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-[9px] mt-2 tracking-widest">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-2 block group-focus-within:text-[#c8ff00]">
                    Secure Password
                  </label>
                  <div className="relative">
                    <input
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={inputStyle(errors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#c8ff00]"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-[9px] mt-2 tracking-widest">
                      {errors.password}
                    </p>
                  )}
                  {form.password.length > 0 && !errors.password && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-[2px] flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : "bg-white/5"}`}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-black tracking-widest text-[#c8ff00]">
                        {strengthLabels[strength]}
                      </span>
                    </div>
                  )}
                  {/* Password requirements hint */}
                  {form.password.length > 0 && form.password.length < 8 && (
                    <p className="text-white/20 text-[9px] mt-2 tracking-widest">
                      Min 8 chars • uppercase • lowercase • number • special
                      char
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="p-5 border border-white/10 text-white/40 rounded-lg hover:text-white hover:border-white/30 transition-all"
                  >
                    <ArrowLeft size={20} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={loading}
                    className="flex-1 bg-[#c8ff00] text-black font-black py-5 rounded-lg text-xs uppercase tracking-[0.3em] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      "PROCESSING..."
                    ) : (
                      <>
                        <Check size={18} strokeWidth={3} /> Finalize Account
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-10 text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
            Already a member?{" "}
            <a
              href="/login"
              className="text-white hover:text-[#c8ff00] border-b border-white/10 transition-colors"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
