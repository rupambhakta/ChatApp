import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserInfo from "./UserInfo";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { jwtDecode } from "jwt-decode";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import SidebarSkleton from "./skeletons/SidebarSkeleton";
import NoChatSelected from "./NoChatSelected";
import { io } from "socket.io-client";

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
  const [onlineUsers, setOnlineUsers] = useState([]);

  // For responsice view
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  // useEffect to handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    // Set initial value
    handleResize();
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // function to go back to user list in mobile view
  const handleBackToUsers = () => {
    setShowSidebar(true);
  };

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
    try {
      socket.emit("chat message", messageData);
      // No need to emit getLastMessages here as we'll update the messages
      // when we receive the confirmatiFon via socket
      setText(""); // Clear the input after sending
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    }
  };

  useEffect(() => {
    // Setup socket connection with user ID
    if (user?._id) {
      socket.emit("setup", user._id);
    }

    // Subscribe to messages
    socket.on("chat message", (msg) => {
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        if (!prev.some((m) => m._id === msg._id)) {
          return [...prev, msg];
        }
        return prev;
      });
      fetchLastMessages();
    });

    // Cleanup function to remove event listeners
    return () => {
      socket.off("chat message");
    };
  }, [user?._id]); // Only re-run when user ID changes

  useEffect(() => {
    socket.on("getOnlineUsers", (onlineUsers) => {
      // Update state with list of online users
      setOnlineUsers(onlineUsers);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, []);

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
        `${apiUrl}/users?search=${term}`,
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
        navigate("/chat");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem("NexTalktoken")) {
      navigate("/login");
    } else {
      fetchData();
      fetchLastMessages();
    }
  }, []);

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

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      await axios.put(`${apiUrl}/api/mark-visited/${user.userId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Then fetch messages and refresh last messages
      getMessages(user.userId);
      fetchLastMessages(); // To update green dot logic
    } catch (error) {
      console.error("Error marking messages as visited:", error);
    }
    if (isMobileView) {
      setShowSidebar(false);
    }
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
      {/* User Information Section */}
      <div
        id="userInfo"
        className={`bg-gray-850 ${
          isMobileView ? "w-full absolute z-20" : "w-1/3"
        } border-r-2 border-black h-screen flex flex-col ${
          isMobileView && !showSidebar ? "hidden" : "block"
        }`}
      >
        <nav className="flex justify-between items-center h-[64px] border-b-2 border-black sticky top-0 z-10 bg-gray-850 px-4">
          <h1 className="w-1/3 font-extrabold text-xl md:text-3xl select-none text-orange-500">
            NexTalk
          </h1>
          <div className="relative w-2/4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <img
                src="/search.png"
                alt="Search"
                className="w-5 h-5 opacity-100 object-contain"
              />
            </div>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="search"
              placeholder="Search for conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 
        focus:outline-none focus:border-gray-500/50 focus:ring-2 focus:ring-orange-500/20
        transition-all duration-300 ease-in-out
        text-sm md:text-base
        shadow-lg"
            />
          </div>
        </nav>
        {userLoading ? (
          <SidebarSkleton />
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredUsers.map((user) => (
              <UserInfo
                lastMessage={lastMessages.find(
                  (msg) =>
                    msg.receiverId === user.userId ||
                    msg.senderId === user.userId
                )}
                onSelect={() => handleSelectUser(user)}
                key={user.userName + user.date}
                user={user}
                selected={selectedUser?.userName === user.userName}
                isActiveChat={selectedUser?.userName === user.userName}
              />
            ))}
          </div>
        )}
      </div>

      {/* Chat Section */}
      {selectedUser ? (
        <div
          id="chatPortion"
          className={`bg-gray-900 ${
            isMobileView ? "w-full absolute z-10" : "w-2/3"
          } flex flex-col h-screen ${
            isMobileView && showSidebar ? "hidden" : "block"
          }`}
        >
          <nav className="flex items-center justify-between h-[64px] border-b-2 border-black bg-gray-850">
            <div className="image flex justify-center items-center gap-3 p-2">
              {isMobileView && (
                <button
                  onClick={handleBackToUsers}
                  className="p-2 rounded-full hover:bg-gray-700"
                >
                  <img src="/back.png" alt="Back" className="w-6 h-6" />
                </button>
              )}
              <img
                className="border-2 border-gray-600 rounded-full aspect-square object-cover w-10 h-10 md:w-12 md:h-12"
                src={
                  selectedUser.image
                    ? `${import.meta.env.VITE_API_URL + selectedUser.image}`
                    : "/user.png"
                }
                alt="Profile pic"
              />
              <div>
                <div className="username text-lg md:text-2xl font-bold">
                  {selectedUser.userName}
                </div>
                <div className="onlineStatus text-sm">
                  {onlineUsers.includes(selectedUser.userId)
                    ? "Online"
                    : "Offline"}
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-5 pr-5">
              <img
                onClick={() => navigate("/chat/dashboard")}
                className="cursor-pointer w-6 h-6 md:w-8 md:h-8"
                src="/account2.png"
                alt="account"
              />
              <img
                onClick={handleLogout}
                className="cursor-pointer w-6 h-6 md:w-8 md:h-8"
                src="/logout2.png"
                alt="logout"
              />
            </div>
          </nav>

          <div
            onClick={() => setShowEmojiPicker(false)}
            className="chat bg-gray-900 flex-1 overflow-y-auto custom-scrollbar"
          >
            {messageLoading ? (
              <MessageSkeleton />
            ) : (
              <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 custom-scrollbar">
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
                      } items-end gap-2 max-w-[90%] md:max-w-[80%]`}
                    >
                      <div className="flex-shrink-0">
                        <img
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-gray-600 overflow-hidden object-cover"
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
                          className={`p-2 md:p-3 rounded-lg text-sm md:text-base ${
                            message.senderId === user._id
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-700 text-white rounded-bl-none"
                          }`}
                        >
                          {message.image && (
                            <img
                              src={message.image}
                              alt="Attachment"
                              className="max-w-[150px] md:max-w-[200px] rounded-md mb-2"
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

          <div className="sendMessage sticky bottom-0 bg-gray-850 px-2 md:px-4 py-2 flex justify-center items-center gap-2 border-t-2 border-black">
            <div className="flex justify-center items-center hover:bg-gray-800 p-2 rounded-lg transition-colors relative">
              <img
                src="/emoji2.png"
                alt="emoji"
                className="w-6 h-6 md:w-8 md:h-8"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              />
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-50 transform scale-75 md:scale-100 origin-bottom-left">
                  <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                </div>
              )}
            </div>

            <textarea
              ref={textareaRef}
              className="flex-1 p-2 rounded-2xl border-2 border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-all duration-200 shadow-sm resize-none overflow-hidden min-h-[40px] max-h-[40px] text-sm md:text-base"
              placeholder="Type your message"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
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
              className="text-white px-3 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors"
              onClick={handleSendMessage}
            >
              <img
                src="/send.png"
                alt="send"
                className="w-6 h-6 md:w-8 md:h-8"
              />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`bg-gray-850 ${
            isMobileView ? "w-full absolute z-10" : "w-2/3"
          } flex flex-col h-screen ${
            isMobileView && showSidebar ? "hidden" : "block"
          }`}
        >
          <div className="flex-1 bg-gray-800 overflow-hidden">
            <NoChatSelected />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
