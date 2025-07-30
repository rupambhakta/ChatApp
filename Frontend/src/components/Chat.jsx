import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserInfo from "./UserInfo";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { jwtDecode } from "jwt-decode";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import SidebarSkleton from "./skeletons/SidebarSkeleton";
import NoChatSelected from "./NoChatSelected";
import { io } from 'socket.io-client';

const token = localStorage.getItem("NexTalktoken");
const apiUrl = import.meta.env.VITE_API_URL;
const user = JSON.parse(localStorage.getItem("user"));
const socket = io(apiUrl);

const Chat = () => {
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [lastMessages, setLastMessages] = useState([]);

  const getMessages = async (userId) => {
    setMessageLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // set({ messages: res.data });
      setMessages(res.data);
      setMessageLoading(false);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      // set({ isMessagesLoading: false });
      console.log("GetMessage Called");
    }
  };

  const sendMessage = async (messageData) => {
    // const { selectedUser, messages } = get();
    try {
      socket.emit('chat message', messageData);
      socket.emit('getLastMessages', user._id);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages(prev => [...prev, msg]);
      fetchLastMessages();
    });
    return () => socket.off('chat message');
  }, []);

  const subscribeToMessages = () => {
    // const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  };

  const getTokenExpiryStatus = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // in seconds
      const timeLeft = decoded.exp - currentTime;

      if (timeLeft <= 0) {
        return { expired: true, secondsLeft: 0 };
      }

      return { expired: false, secondsLeft: timeLeft };
    } catch (error) {
      return { expired: true, secondsLeft: 0 };
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    // setShowEmojiPicker(false);
  };

  const fetchData = async () => {
    setUserLoading(true);
    try {
      const responce = await axios.get(`${apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(responce.data);
      setUserLoading(false);
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  };

  const fetchSearchResults = async (term) => {
    try {
      const response = await axios.get(
        `http://localhost:5080/users?search=${term}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("NexTalktoken");
      navigate("/login");
    }
  };

  const fetchLastMessages = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/last-messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLastMessages(response.data);
    } catch (error) {
      console.error("Error fetching last messages:", error);
    }
  };


  useEffect(() => {
    if (token) {
      const { expired, secondsLeft } = getTokenExpiryStatus(token);

      if (expired) {
        localStorage.removeItem("NexTalktoken");
      } else {
        console.log("Token is valid. Time left:", secondsLeft, "seconds");
        navigate("/chat");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem("NexTalktoken")) {
      navigate("/login");
      // } else if (searchTerm) {
      //   setUsers(filteredUsers);
    } else {
      fetchData();
      fetchLastMessages();
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

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    getMessages(user.userId);
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Add this at the top with other state declarations
  const messagesEndRef = useRef(null);

  // Add this function after other functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Add this useEffect to trigger scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set initial textarea height
  useEffect(() => {
    resetTextareaHeight();
  }, []);

  const formatImageUrl = (imageUrl) => {
    if (imageUrl) {
      return apiUrl + imageUrl;
    } else {
      return "/user.png";
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  const handleSendMessage = () => {
    if (text.length === 0) return;
    sendMessage({
      text: text,
      senderId: user._id,
      receiverId: selectedUser.userId,
    });
    setText("");
    resetTextareaHeight();
  };

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
        {userLoading ? (
          <SidebarSkleton />
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredUsers.map((user) => (
              <UserInfo
                lastMessage={lastMessages.find((msg) => msg.receiverId === user.userId || msg.senderId === user.userId)}
                onSelect={() => handleSelectUser(user)}
                key={user.userName + user.date}
                user={user}
                selected={selectedUser?.userName === user.userName}
              />
            ))}
          </div>
        )}
      </div>

      {/* for chat portion */}
      {selectedUser ? (
        <div
          id="chatPortion"
          className="bg-gray-900 w-2/3 flex flex-col h-screen"
        >
          <nav className="flex items-center justify-between h-[64px] border-b-2 border-black">
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

          <div
            onClick={() => setShowEmojiPicker(false)}
            className="chat bg-gray-900 flex-1 overflow-y-auto"
          >
            {/* chat messages */}
            {messageLoading ? (
              <MessageSkeleton />
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.senderId === user._id
                        ? "justify-end"
                        : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`flex ${
                        message.senderId === user._id
                          ? "flex-row-reverse"
                          : "flex-row"
                      } items-end gap-2 max-w-[80%]`}
                    >
                      <div className="flex-shrink-0">
                        <img
                          className="w-8 h-8 rounded-full border-2 border-gray-600"
                          src={
                            message.senderId === user._id
                              ? formatImageUrl(user.profileImage)
                              : formatImageUrl(selectedUser.image)
                          }
                          alt="profile pic"
                        />
                      </div>
                      <div
                        className={`flex flex-col ${
                          message.senderId === user._id
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            message.senderId === user._id
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-700 text-white rounded-bl-none"
                          }`}
                        >
                          {message.image && (
                            <img
                              src={message.image}
                              alt="Attachment"
                              className="max-w-[200px] rounded-md mb-2"
                            />
                          )}
                          {message.text && (
                            <p className="break-words">{message.text}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 mt-1">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="sendMessage sticky bottom-0 bg-gray-850 px-4 py-2 flex gap-2 border-t-2 border-black">
            <div className="flex justify-center items-center hover:bg-gray-800 p-2 rounded-lg transition-colors relative">
              <img
                src="/emoji.png"
                alt="emoji"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              />
              {showEmojiPicker && (
                <div className="absolute bottom-12 z-50">
                  <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                </div>
              )}
            </div>

            <textarea
              ref={textareaRef}
              className="flex-1 p-2 rounded-2xl border-2 border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-all duration-200 shadow-sm resize-none overflow-hidden min-h-[40px] max-h-[40px]"
              placeholder="Type your message"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                // e.target.style.height = "40px";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  80
                )}px`;
                e.target.style.maxHeight = `${Math.min(
                  e.target.scrollHeight,
                  80
                )}px`;
              }}
              onClick={() => setShowEmojiPicker(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (text.trim().length > 0) {
                    handleSendMessage();
                  }
                }
              }}
            />

            <button
              className=" text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors"
              onClick={handleSendMessage}
            >
              <img src="/send.png" alt="send" width={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-850 w-2/3 flex flex-col h-screen">
          <div className="flex-1 bg-gray-800 overflow-hidden">
            <NoChatSelected />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
