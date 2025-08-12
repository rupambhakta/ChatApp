import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Chat from "./components/Chat";
import Dashboard from "./components/Dashboard";
import AdminLogin from "./components/AdminLogin";
import UserDashboard from "./components/UserDashboard";
import VerifyOtp from "./components/VerifyOtp";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/verify-otp",
      element: <VerifyOtp />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/chat",
      element: <Chat />,
    },
    {
      path: "/chat/dashboard",
      element: <UserDashboard />,
    },
    {
      path: "/admin/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/admin/login",
      element: <AdminLogin />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
