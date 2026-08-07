// Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; //  Footer import kiya

const Layout = () => {
  return (
    //  flex aur flex-col lagaya taaki footer hamesha bottom par push ho jaye
    <div className="min-h-screen flex flex-col bg-[#f7f6f4] font-sans text-stone-900">
      <Navbar /> 
      
      {/* flex-grow ensure karta hai ki main content saari bachi hui jagah le le, aur footer neeche rahe */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      
      <Footer /> 
    </div>
  );
};

export default Layout;