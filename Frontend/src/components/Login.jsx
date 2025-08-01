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
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-900">
      {/* Left: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-20 py-10">
        <div className="w-full max-w-md text-white">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-gray-100">
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
            className="space-y-4"
          >
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded w-full focus:outline-focus focus:ring-2 focus:ring-gray-400"
              placeholder="User Name"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded w-full focus:outline-focus focus:ring-2 focus:ring-gray-400"
              placeholder="Password"
            />

            <button
              type="submit"
              className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-black rounded w-full transition-colors duration-200"
            >
              {authLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm sm:text-base text-gray-100">
            Don't have an account?{" "}
            <Link to="/signup">
              <span className="text-orange-500 hover:underline font-semibold cursor-pointer">
                Signup
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right: Auth Image Section */}
      <div className="w-full lg:w-1/2 hidden lg:block">
        <AuthImagePattern
          title="Welcome back!"
          subtitle="Sign in to continue your conversations and catch up with your messages."
        />
      </div>
    </div>
  );
};

export default Login;
