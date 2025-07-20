import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Login = () => {
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [userName, setUserName] = useState(useLocation().state?.userName);
  const [password, setPassword] = useState(useLocation().state?.password);
  const navigate = useNavigate();

  const login = async (userName, password) => {
    setAuthLoading(true);
    setAuthError("");

    const responce = await fetch("http://localhost:5080/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: userName, password: password }),
    });

    const data = await responce.json();
    console.log(data);
    
    setAuthLoading(false);
    if (data.NexTalktoken ) {
      localStorage.setItem("NexTalktoken", data.NexTalktoken);
      navigate("/Chat");
    } else {
      setAuthError(data.message || "Login Failed");
    }
  };

  useEffect(() => {
      if (localStorage.getItem('NexTalktoken')) {
        navigate("/chat");
      }
    }, [navigate]);

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-orange-50 rounded-lg border-oragne-200 ">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-orange-600 ">
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
          className="p-3 border-2 border-orange-300 rounded w-full mb-4 focus:outline-focus focus:ring-2 focus:ring-oragne-400"
          placeholder="User Name"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 border-2 border-orange-300 rounded w-full mb-4 focus:outline-focus focus:ring-2 focus:ring-oragne-400"
          placeholder="Password"
        />

        <button
          type="submit"
          className="px-4 py-4 bg-orange-500 hover:bg-oragne-600 text-black rounded w-full transition-color-gray"
        >
          {authLoading ? "Loggin in...." : "Login"}
        </button>
      </form>
      <div className="mt-5 text-center text-gray-700">
        Don't have an account?
        <Link to="/signup">
          <span className="text-orange-500 hover:underline font-semibold cursor-pointer">
            Signup
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Login;
