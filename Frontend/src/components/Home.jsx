import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <div>
        <h1 className="text-3xl text-center font-bold m-5 text-green-600 underline">
          NexTalk
        </h1>
      </div>

      <div className="flex gap-5 text-2xl font-bold justify-center items-center text-blue-700 underline">
        <Link to={"/signup"}> GOTO Signup</Link>
        <Link to={"/login"}>Login</Link>
      </div>
    </div>
  );
};

export default Home;
