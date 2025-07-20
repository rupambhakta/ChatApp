import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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

      // Get the token from localStorage
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
        setMessage("Profile image updated successfully!");
        navigate("/chat")
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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center gap-6">
        <label className="w-full">
          <span className="block text-sm font-medium text-gray-300 mb-2">
            Upload Profile Image
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-700 file:text-gray-100
            hover:file:bg-indigo-600
            transition-colors duration-200
            bg-gray-700 rounded-lg cursor-pointer"
          />
        </label>
        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-40 h-40 object-cover rounded-full border-2 border-indigo-600 shadow-md"
            />
          </div>
        )}
        
        {imageUrl && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 w-full bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        )}

        {message && (
          <div className={`mt-4 text-sm ${message.includes("success") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
