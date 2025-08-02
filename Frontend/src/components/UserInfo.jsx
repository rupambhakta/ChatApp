import React from "react";

const formatDateOrTime = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // ⬅️ Handle invalid date

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

const UserInfo = ({ user, onSelect, selected, lastMessage, isActiveChat }) => {
  const formattedDate = formatDateOrTime(
    lastMessage?.createdAt ?? user.createdAt
  );
  const profileImage = user.image
    ?  user.image
    : undefined;

  return (
    <div
      className={`flex justify-between p-3 hover:bg-gray-800 transition-colors duration-100 ease-in-out m-2 rounded-2xl ${
        selected ? "bg-gray-800" : "hover:bg-gray-800"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-center items-center gap-2">
        <div className="">
          <img
            className="border-2 border-gray-600 rounded-full aspect-square object-cover"
            src={profileImage ?? "/user.png"}
            alt="profile photo"
            width={55}
          />
        </div>
        <div className="select-none">
          <div>{user.userName}</div>
          <div>{lastMessage?.text || "No message"}</div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div>{formattedDate && <div>{formattedDate}</div>}</div>
        {lastMessage?.visited === false && !isActiveChat && (
          <div className="border-2 p-1 border-gray-600 rounded-full aspect-square object-cover bg-green-600 text-center text-[12px]"></div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
