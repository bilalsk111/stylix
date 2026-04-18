// Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Layout = () => {
  return (
    // Yahan bg-[#050505] add kiya hai taaki white space na dikhe
    <div className="min-h-screen bg-[#050505]">
      <Navbar /> 
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;