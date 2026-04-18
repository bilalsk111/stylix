import { RouterProvider } from "react-router-dom"
import {routes} from "./app.routes"
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading, setAuthChecked } from '../features/auth/state/auth.slice';
import { getMe } from '../features/auth/services/auth.api';
import Navbar from "../components/Navbar";

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
      dispatch(setAuthChecked(true)); // ✅ THIS IS CRITICAL
    }
  };

  initAuth();
}, []);
  return (
    <div className="w-full min-h-screen">
       <RouterProvider router={routes} />
    </div>
  )
}

export default App
