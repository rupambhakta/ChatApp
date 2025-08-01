import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthImagePattern from "./AuthImagePattern";
const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [userName, setUserName] = useState(useLocation().state?.userName);
  const [password, setPassword] = useState(useLocation().state?.password);
  const navigate = useNavigate();

  const login = async (userName, password) => {
    setAuthLoading(true);
    setAuthError("");

    const responce = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: userName, password: password }),
    });

    const data = await responce.json();

    setAuthLoading(false);
    if (data.NexTalktoken) {
      localStorage.setItem("NexTalktoken", data.NexTalktoken);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/chat");
    } else {
      setAuthError(data.message || "Login Failed");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("NexTalktoken")) {
      navigate("/chat");
    }
  }, [navigate]);

  return (
    <div>
      <div className="flex h-screen justify-center items-center bg-gray-900">
        <div className="w-1/2 mx-auto p-32 bg-gray-900 rounded-lg border-oragne-200 text-white">
          <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-100 ">
            Login
          </h2>
          {authError && (
            <div className="mb-3 text-center text-red-600 font-semibold">
              {authError}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login(userName, password);
            }}
          >
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded w-full mb-4 focus:outline-focus focus:ring-2 focus:ring-gray-400"
              placeholder="User Name"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded w-full mb-4 focus:outline-focus focus:ring-2 focus:ring-gray-400"
              placeholder="Password"
            />

            <button
              type="submit"
              className="px-4 py-4 bg-orange-500 hover:bg-oragne-600 text-black rounded w-full transition-color-gray"
            >
              {authLoading ? "Loggin in...." : "Login"}
            </button>
          </form>
          <div className="mt-5 text-center text-gray-100">
            Don't have an account?
            <Link to="/signup">
              <span className="text-orange-500 hover:underline font-semibold cursor-pointer">
                Signup
              </span>
            </Link>
          </div>
        </div>
        <div className="w-1/2">
          <AuthImagePattern
            title={"Welcome back!"}
            subtitle={
              "Sign in to continue your conversations and catch up with your messages."
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
