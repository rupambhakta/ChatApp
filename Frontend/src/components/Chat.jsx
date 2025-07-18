import React, { useEffect } from 'react'
import { useNavigate, Link } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('NexTalktoken')) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className='bg-gray-900 h-screen text-white'>
      After Login
    </div>
  )
}

export default Chat
