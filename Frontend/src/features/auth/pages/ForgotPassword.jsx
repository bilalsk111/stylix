import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { forgotPasswordAPI } from "../services/auth.api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    setLoading(true);
    try {
      const res = await forgotPasswordAPI(email);
      toast.success(res.message, {
        style: { background: '#1c1917', color: '#fff', fontSize: '12px' },
      });

      setTimeout(() => navigate("/reset-password"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate recovery", {
        style: { background: '#1c1917', color: '#ef4444', fontSize: '12px' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f4] flex flex-col items-center justify-center p-6 text-stone-900 selection:bg-stone-900 selection:text-white">
      <Toaster position="top-right" />
      
      <div className="bg-white p-10 md:p-12 rounded-none border border-stone-200 shadow-sm w-full max-w-md relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-stone-400 hover:text-stone-900 transition-colors">
            <ArrowLeft size={18} />
        </button>

        <div className="text-center mt-6 mb-10">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Stylix.</h2>
            <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Protocol: Asset Recovery</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-stone-500">Registered Email</label>
              <input 
                type="email" 
                placeholder="merchant@stylix.com" 
                className="w-full p-4 bg-[#fbfaf9] border border-stone-200 focus:border-stone-900 rounded-none text-[12px] font-bold outline-none transition-all placeholder:text-stone-300"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
          </div>

          <button 
            disabled={loading}
            className={`w-full bg-stone-900 text-white py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-md transition-all ${loading ? "opacity-50 cursor-wait" : "hover:bg-[#ccff00] hover:text-stone-900"}`}
          >
            {loading ? "Transmitting..." : "Dispatch Security Code"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;