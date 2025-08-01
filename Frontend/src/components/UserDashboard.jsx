import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const apiUrl = "http://localhost:5080";

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl(URL.createObjectURL(file));
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select an image first");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const token = localStorage.getItem("NexTalktoken");
      if (!token) {
        setMessage("Please login first");
        setUploading(false);
        return;
      }

      const response = await fetch("http://localhost:5080/user", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const user = JSON.parse(localStorage.getItem("user"));
        user.profileImage = data.user.profileImage;
        localStorage.setItem("user", JSON.stringify(user));
        setMessage("Profile image updated successfully!");
        window.location.href = "/chat";
      } else {
        setMessage(data.message || "Error uploading image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto p-2">
        <div className="bg-gray-800 rounded-xl p-4 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-white">Profile</h1>
            <p className="mt-2 text-gray-300">Your profile information</p>
          </div>

          {/* Profile Image Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={user.profileImage ? `${apiUrl}${user.profileImage}` : "/user.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-indigo-700 hover:bg-indigo-600
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${uploading ? "opacity-50 pointer-events-none" : ""}
                `}
              >
                <span className="text-white text-xl">📷</span>
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-sm text-gray-400">
              {uploading ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>

            {imageUrl && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            )}

            {message && (
              <div className={`text-sm ${message.includes("success") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <span>👤</span>
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-gray-700 text-gray-100 rounded-lg border border-gray-600">
                {user.userName}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <span>📧</span>
                Email Address
              </div>
              <p className="px-4 py-2.5 text-gray-100 bg-gray-700 rounded-lg border border-gray-600">
                {user.emailId}
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-6 bg-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-600">
                <span className="text-gray-300">Member Since</span>
                <span className="text-gray-300">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300">Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;