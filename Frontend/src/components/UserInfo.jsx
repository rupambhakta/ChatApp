import React from "react";

const UserInfo = () => {
  return (
    <div className="flex justify-between p-3 hover:bg-gray-800 m-2 rounded-2xl">
      <div className="flex justify-center items-center gap-2">
        <div className="">
          <img
            className="border-2 border-gray-600 rounded-full aspect-square object-cover"
            src="/profile.jpg"
            alt="profile photo"
            width={55}
          />
        </div>
        <div>
            <div>Rupam Bhakta</div>
            <div>Message...</div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div>10/10/25</div>
        <div className="border-2 border-gray-600 rounded-full aspect-square object-cover bg-green-600 text-center text-[12px]">5</div>
      </div>
    </div>
  );
};

export default UserInfo;
