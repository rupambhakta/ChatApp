import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserInfo from "./UserInfo";
import axios from "axios";

const Chat = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const fetchData = async () => {
    try {
      const responce = await axios.get("http://localhost:5080/users");
      setUsers(responce.data);
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  };

  const fetchSearchResults = async (term) => {
  try {
    const response = await axios.get(`http://localhost:5080/users?search=${term}`);
    setFilteredUsers(response.data);
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
};

  // Filter users based on search term
  // const filteredUsers = users.filter((user) =>
  //   user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("NexTalktoken");
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("NexTalktoken")) {
      navigate("/login");
      // } else if (searchTerm) {
      //   setUsers(filteredUsers);
    } else {
      fetchData();
    }
  }, [navigate]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setFilteredUsers(users);
      } else {
        const filtered = users.filter((user) =>
          user.userName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce); // cleanup
  }, [searchTerm, users]);

  useEffect(() => {
  if (searchTerm.trim() === "") {
    setFilteredUsers(users);
  } else {
    fetchSearchResults(searchTerm);
  }
}, [searchTerm]);

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="search"
            placeholder=" Start a new chat"
            className="w-2/4 mr-2 p-1 rounded-lg border-2 border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors duration-200  shadow-sm "
          />
        </nav>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredUsers.map((user) => (
            <UserInfo
              onSelect={() => setSelectedUser(user)}
              key={user._id}
              user={user}
              selected={selectedUser?.userName === user.userName}
            />
          ))}
        </div>
      </div>
      {/* for chat portion */}
      <div
        id="chatPortion"
        className="bg-gray-850 w-2/3 flex flex-col h-screen"
      >
        <nav className="flex items-center justify-between h-[64px] border-b-2 border-black">
          {selectedUser ? (
            <div className="image flex justify-center items-center gap-3 p-2">
              <img
                className="border-2 border-gray-600 rounded-full aspect-square object-cover"
                src={
                  selectedUser.image
                    ? `${import.meta.env.VITE_API_URL + selectedUser.image}`
                    : "/user.png"
                }
                width={50}
                alt="Profile pic"
              />
              <div className="username text-2xl font-bold">
                {selectedUser.userName}
              </div>
            </div>
          ) : (
            <p className="text-2xl font-bold ml-2 text-gray-200">
              No User Selected
            </p>
          )}
          <div className="flex justify-center items-center gap-4">
            <img
              onClick={() => navigate("/chat/dashboard")}
              className="cursor-pointer"
              src="/account.png"
              alt="account"
            />
            <img
              onClick={handleLogout}
              className="cursor-pointer"
              src="/logout.png"
              alt="logout"
            />
          </div>
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
