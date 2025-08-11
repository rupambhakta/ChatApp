import React from "react";

const formatDateOrTime = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // Handle invalid date

  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    : `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
};

// Utility function to truncate long messages
const truncateMessage = (text, maxLength = 35) => {
  if (!text) return "No message";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const UserInfo = ({ user, onSelect, selected, lastMessage, isActiveChat }) => {
  const formattedDate = formatDateOrTime(
    lastMessage?.createdAt ?? user.createdAt
  );
  const profileImage = user.image ? user.image : undefined;

  // Get unread count - only show if there are unread messages and it's not the active chat
  const unreadCount = lastMessage?.unreadCount || 0;
  const shouldShowUnreadCount = unreadCount > 0 && !isActiveChat;

  return (
    <div
      className={`flex justify-between items-center p-3 hover:bg-gray-800 transition-colors duration-100 ease-in-out m-2 rounded-2xl cursor-pointer ${
        selected ? "bg-gray-800" : "hover:bg-gray-800"
      }`}
      onClick={onSelect}
    >
      {/* Left side - Profile and Message Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex-shrink-0">
          <img
            className="border-2 border-gray-600 rounded-full aspect-square object-cover w-12 h-12 md:w-14 md:h-14"
            src={profileImage ?? "/user.png"}
            alt="profile photo"
          />
        </div>
        <div className="min-w-0 flex-1 select-none">
          {/* Username */}
          <div className="font-medium text-white text-sm md:text-base truncate">
            {user.userName}
          </div>
          {/* Last message with proper truncation */}
          <div 
            className="text-gray-400 text-xs md:text-sm truncate max-w-full"
            title={lastMessage?.text || "No message"} // Show full text on hover
          >
            {lastMessage?.image && !lastMessage?.text && (
              <span className="flex items-center gap-1">
                <img src="/image-icon.png" alt="📷" className="w-3 h-3 inline" />
                Photo
              </span>
            )}
            {lastMessage?.image && lastMessage?.text && (
              <span className="flex items-center gap-1">
                <img src="/image-icon.png" alt="📷" className="w-3 h-3 inline" />
                {truncateMessage(lastMessage.text, 25)}
              </span>
            )}
            {!lastMessage?.image && truncateMessage(lastMessage?.text)}
          </div>
        </div>
      </div>

      {/* Right side - Time and Unread Count */}
      <div className="flex flex-col items-end justify-center flex-shrink-0 ml-2">
        {/* Time */}
        {formattedDate && (
          <div className="text-xs text-gray-400 mb-1">
            {formattedDate}
          </div>
        )}
        {/* Unread count badge */}
        {shouldShowUnreadCount && (
          <div className="bg-green-600 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs font-medium px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;