import React from "react";

const UserInfo = ({ user, onSelect, selected }) => {
  console.log(user);
  const date = new Date(user.date);
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`;
  const profileImage = user.image
    ? import.meta.env.VITE_API_URL + user.image
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
        <div>
          <div>{user.userName}</div>
          <div>Message...</div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div>{formattedDate}</div>
        <div className="border-2 border-gray-600 rounded-full aspect-square object-cover bg-green-600 text-center text-[12px]">
          5
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
