import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

const AdminLogin = () => {
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [userName, setUserName] = useState(useLocation().state?.userName);
  const [password, setPassword] = useState(useLocation().state?.password);
  const navigate = useNavigate();

  const login = async (userName, password) => {
    setAuthLoading(true);
    setAuthError("");

    const responce = await fetch("http://localhost:5080/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: userName, password: password }),
    });

    const data = await responce.json();
    setAuthLoading(false);
    if (data.tokenForAdmin) {
      localStorage.setItem("tokenForAdmin", data.tokenForAdmin);
      navigate("/admin/dashboard");
    } else {
      setAuthError(data.message || "Login Failed");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("tokenForAdmin")) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-100 to-blue-300">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-blue-200">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-800 ">
          Admin Login
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
            className="p-3 border-2 border-blue-300 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black bg-white"
            placeholder="User Name"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border-2 border-blue-300 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black bg-white"
            placeholder="Password"
          />

          <button
            type="submit"
            className="px-4 py-4 bg-blue-700 hover:bg-black text-white rounded w-full font-semibold transition-colors duration-200 shadow-md"
          >
            {authLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
