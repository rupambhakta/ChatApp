import React from "react";

const UserDashboard = () => {
  const handleChange = () => {};
  return (
    <div>
      <input
        name="image"
        type="file"
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
};

export default UserDashboard;
