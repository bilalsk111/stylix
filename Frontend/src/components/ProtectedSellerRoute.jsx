import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hook/useAuth';
import { ShieldCheck, Terminal, Server } from 'lucide-react';

const ProtectedSellerRoute = () => {
  const { currentUser, isAuthChecked } = useAuth();

  // FIX: Make the loading state match your Stylix branding, not basic black/white
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f6f4] text-stone-900 font-black uppercase tracking-widest text-[10px] animate-pulse">
        Authenticating System...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'seller') {
    return <Navigate to="/" replace />;
  }

  return (
    // 🛠️ FLEX WRAPPER: Ensures footer is always pushed to the bottom of the screen
    <div className="min-h-screen flex flex-col bg-[#f7f6f4]">
      
      {/* 🚀 MAIN CONTENT AREA (Your seller pages go here) */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 🛑 DETAILED SELLER SYSTEM FOOTER */}
      <footer className="w-full bg-white border-t border-stone-200 mt-auto z-50">
        <div className="px-6 lg:px-10 py-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Column 1: System Identity */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-stone-900">
                <Terminal size={14} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Stylix Merchant Ops</span>
              </div>
              <p className="text-[10px] font-medium text-stone-400 max-w-[250px] leading-relaxed">
                Internal administration and fulfillment terminal. Authorized personnel only. All actions are logged and audited.
              </p>
            </div>

            {/* Column 2: Quick Docs */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300">Resources</span>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-[10px] font-bold text-stone-500 hover:text-stone-900 uppercase tracking-widest transition-colors w-fit">API Documentation</a>
                <a href="#" className="text-[10px] font-bold text-stone-500 hover:text-stone-900 uppercase tracking-widest transition-colors w-fit">Fulfillment Guidelines</a>
                <a href="#" className="text-[10px] font-bold text-stone-500 hover:text-stone-900 uppercase tracking-widest transition-colors w-fit">Merchant Support</a>
              </div>
            </div>

            {/* Column 3: System Status */}
            <div className="flex flex-col gap-3 md:items-end">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300">System Status</span>
              <div className="flex flex-col gap-2 md:items-end">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a3cc00]"></span>
                  </span>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Database Linked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Server size={12} className="text-stone-400" />
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Latency: 24ms</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Border & Copyright */}
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-stone-400">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encrypted Session</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">
              © 2026 Stylix Core Engine v2.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProtectedSellerRoute;