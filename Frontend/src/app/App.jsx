import { RouterProvider } from "react-router-dom"
import {routes} from "./app.routes"
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading, setAuthChecked } from '../features/auth/state/auth.slice';
import { getMe } from '../features/auth/services/auth.api';
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

const App = () => {
  const dispatch = useDispatch();

useEffect(() => {
  const initAuth = async () => {
    try {
      dispatch(setLoading(true));
      const data = await getMe();
      dispatch(setUser(data.user));
    } catch {
      dispatch(setUser(null));
    } finally {
      dispatch(setLoading(false));
      dispatch(setAuthChecked(true)); 
    }
  };

  initAuth();
}, []);
  return (
    <div className="w-full min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
       <RouterProvider router={routes} />
    </div>
  )
}

export default App
