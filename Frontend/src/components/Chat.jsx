import React, { useEffect } from 'react'
import { useNavigate, Link } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      After Login
    </div>
  )
}

export default Chat
