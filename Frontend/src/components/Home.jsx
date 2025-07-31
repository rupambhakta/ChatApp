import React from "react";
import { Link } from "react-router-dom";
import AuthImagePattern from "./AuthImagePattern";

const Home = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left content */}
      <div className="w-1/2 flex flex-col justify-center items-center px-10">
        <h1 className="text-5xl font-extrabold mb-6 text-orange-500 select-none">
          Welcome to NexTalk
        </h1>
        <p className="text-gray-300 text-lg mb-10 text-center max-w-md">
          Connect, chat, and stay in touch with your friends instantly. Simple, fast, and secure.
        </p>

        <div className="flex gap-6">
          <Link
            to="/login"
            className="relative inline-flex items-center justify-center px-7 py-3 overflow-hidden font-semibold text-white transition-all duration-300 rounded-xl group bg-gradient-to-tr from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-48 group-hover:h-48 opacity-10"></span>
            <span className="relative z-10">Login</span>
          </Link>

          <Link
            to="/signup"
            className="relative inline-flex items-center justify-center px-7 py-3 overflow-hidden font-semibold text-white transition-all duration-300 rounded-xl group bg-gradient-to-tr from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
          >
            <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-48 group-hover:h-48 opacity-10"></span>
            <span className="relative z-10">Sign Up</span>
          </Link>
        </div>
      </div>

      {/* Right image */}
      <div className="w-1/2">
        <AuthImagePattern
          title="Welcome to the future of messaging"
          subtitle="Experience seamless communication with NexTalk. Fast, reliable, and beautifully designed."
        />
      </div>
    </div>
  );
};

export default Home;
