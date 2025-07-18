import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Chat from "./components/Chat";
import Dashboard from "./components/Dashboard";
import AdminLogin from "./components/AdminLogin";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path:"/signup",
      element:<Signup/>
    },
    {
      path:"/login",
      element:<Login/>
    },
    {
      path: "/chat",
      element: <Chat />
    },
    {
      path:"/admin/dashboard",
      element:<Dashboard/>
    },
    {
      path:"/admin/login",
      element:<AdminLogin/>
    }
  ]);

  return <>
  <RouterProvider router={router}/>
  </>;
}

export default App;
