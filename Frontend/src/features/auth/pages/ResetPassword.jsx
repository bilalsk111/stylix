import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { resetPasswordAPI } from "../services/auth.api";

const ResetPassword = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (token.length !== 6) return toast.error("Invalid token format");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      const res = await resetPasswordAPI(token.toUpperCase(), newPassword);
      toast.success(res.message, {
        style: { background: '#1c1917', color: '#ccff00', fontSize: '12px' },
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired token", {
        style: { background: '#1c1917', color: '#ef4444', fontSize: '12px' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f4] flex flex-col items-center justify-center p-6 text-stone-900 selection:bg-stone-900 selection:text-white">
      <Toaster position="top-right" />
      
      <div className="bg-white p-10 md:p-12 rounded-3xl border border-stone-200 shadow-sm w-full max-w-md">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Stylix.</h2>
            <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Protocol: Set New Credentials</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-stone-500">6-Digit Verification Code</label>
              <input 
                type="text" 
                maxLength={6}
                placeholder="XXXXXX" 
                className="w-full p-4 bg-[#fbfaf9] border border-stone-200 focus:border-stone-900 rounded-xl text-lg font-mono font-black text-center outline-none transition-all placeholder:text-stone-300 uppercase tracking-[0.3em]"
                onChange={(e) => setToken(e.target.value)}
                required
              />
          </div>

          <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-stone-500">New Vault Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 bg-[#fbfaf9] border border-stone-200 focus:border-stone-900 rounded-xl text-[12px] font-bold outline-none transition-all placeholder:text-stone-300"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
          </div>

          <button 
            disabled={loading}
            className={`w-full bg-stone-900 text-white py-4 mt-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-md transition-all ${loading ? "opacity-50 cursor-wait" : "hover:bg-[#ccff00] hover:text-stone-900"}`}
          >
            {loading ? "Processing..." : "Confirm New Credentials"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;