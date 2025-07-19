import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserInfo from "./UserInfo";

const Chat = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("NexTalktoken")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="bg-gray-900 h-screen text-white flex">
      {/* For User Information */}
      <div
        id="userInfo"
        className="bg-gray-850 w-1/3 border-r-2 border-black h-screen flex flex-col"
      >
        <nav className="flex justify-between items-center h-[64px] border-b-2 border-black sticky top-0 z-10 bg-gray-850">
          <h1 className="w-1/3 ml-2 font-extrabold text-2xl select-none text-gray-200">
            NexTalk
          </h1>
          <input
            type="search"
            placeholder=" Start a new chat"
            className="w-2/4 mr-2 p-1 rounded-lg border-2 border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors duration-200  shadow-sm "
          />
        </nav>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <UserInfo />
          <UserInfo />
          <UserInfo />
          <UserInfo />
          <UserInfo />
          <UserInfo />
          <UserInfo />
          <UserInfo />
        </div>
      </div>

      {/* for chat portion */}
      <div
        id="chatPortion"
        className="bg-gray-850 w-2/3 flex flex-col h-screen"
      >
        <nav className="flex items-center h-[64px] border-b-2 border-black">
          <div className="image p-2">
            <img
              className="border-2 border-gray-600 rounded-full aspect-square object-cover"
              src="/profile.jpg"
              width={50}
              alt="Profile pic"
            />
          </div>
          <div className="username text-2xl font-bold">Rupam Bhakta</div>
        </nav>
        {/* Make chat area grow and scrollable */}
        <div className="chat bg-gray-800 flex-1 overflow-y-auto">
          {/* chat messages */}
        </div>
        <div className="sendMessage sticky bottom-0 bg-gray-850 px-4 py-2 flex gap-2 border-t-2 border-black">
          <div className="flex justify-center items-center">
            <img src="/emoji.png" alt="emoji" />
          </div>
          <input
            className="flex-1 p-2 rounded-2xl border-2 border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors duration-200 shadow-sm"
            type="text"
            placeholder="Type your message"
          />
          <button className=" text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors">
            <img src="/send.png" alt="send" width={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
