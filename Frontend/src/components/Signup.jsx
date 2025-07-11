import React, { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  const [userName, setUserName] = useState();
  const [emailId, setEmailId] = useState();
  const [mobileNumber, setMobileNumber] = useState();
  const [password, setPassword] = useState("");
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [addError, setAddError] = useState("");

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  // Password validation function
  const validatePassword = (pwd) => {
    const lengthCheck = pwd.length >= 8;
    const lowerCheck = /[a-z]/.test(pwd);
    const upperCheck = /[A-Z]/.test(pwd);
    const numberCheck = /[0-9]/.test(pwd);
    const specialCheck = /[^A-Za-z0-9]/.test(pwd);
    return (
      lengthCheck && lowerCheck && upperCheck && numberCheck && specialCheck
    );
  };

  const handleAddNewUser = async (e) => {
    e.preventDefault();
    setAddError("");
    if (!userName || !emailId || !mobileNumber || !password) {
      setAddError("All fields are required");
      return;
    }
    try {
      const res = await fetch("http://localhost:5080/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName || "",
          emailId: emailId || "",
          mobileNumber: mobileNumber || "",
          password: password || "",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setAddError(err.error || "Failed to add contact");
        return;
      }
      setEmailId("");
      setPassword("");
      setMobileNumber("");
      setUserName("");

    } catch (err) {
      setAddError("Failed to add contact");
    }
  };

  return (
    <div>
      <div className="max-w-md mx-auto mt-16 p-8 bg-orange-50 rounded-lg border-oragne-200 ">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-orange-600 ">
          Sign up
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!validatePassword(password || "")) {
              setPasswordError(
                "Password must be at least 8 characters and include a lowercase letter, an uppercase letter, a number, and a special character."
              );
              return;
            }
            setPasswordError("");
            handleAddNewUser(e);
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
            type="email"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            className="p-3 border-2 border-orange-300 rounded w-full mb-4 focus:outline-focus focus:ring-2 focus:ring-oragne-400"
            placeholder="Email id"
          />
          <input
            type="number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="p-3 border-2 border-orange-300 rounded w-full mb-4 focus:outline-focus focus:ring-2 focus:ring-oragne-400"
            placeholder="Mobile number"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setShowPasswordHint(true)}
            onBlur={() => setShowPasswordHint(false)}
            className="p-3 border-2 border-orange-300 rounded w-full mb-1 focus:outline-focus focus:ring-2 focus:ring-oragne-400"
            placeholder="Password"
          />
          {showPasswordHint && !validatePassword(password) && (
            <div className="text-xs mb-2">
              <ul className="list-none p-0">
                <li
                  className={
                    passwordChecks.length ? "text-green-600" : "text-gray-600"
                  }
                >
                  {passwordChecks.length ? "✓" : "•"} At least 8 characters
                </li>
                <li
                  className={
                    passwordChecks.lower ? "text-green-600" : "text-gray-600"
                  }
                >
                  {passwordChecks.lower ? "✓" : "•"} At least one lowercase
                  letter
                </li>
                <li
                  className={
                    passwordChecks.upper ? "text-green-600" : "text-gray-600"
                  }
                >
                  {passwordChecks.upper ? "✓" : "•"} At least one uppercase
                  letter
                </li>
                <li
                  className={
                    passwordChecks.number ? "text-green-600" : "text-gray-600"
                  }
                >
                  {passwordChecks.number ? "✓" : "•"} At least one number
                </li>
                <li
                  className={
                    passwordChecks.special ? "text-green-600" : "text-gray-600"
                  }
                >
                  {passwordChecks.special ? "✓" : "•"} At least one special
                  character
                </li>
              </ul>
            </div>
          )}
          {passwordError && (
            <div className="text-xs text-red-600 mb-2">{passwordError}</div>
          )}

          <button
            type="submit"
            className="px-4 py-4 bg-orange-500 hover:bg-oragne-600 text-black rounded w-full transition-colors duration-200"
          >
            Submit
          </button>
        </form>
        <div className="mt-5 text-center text-gray-700">
          Already have an account?
          <Link to="/login">
            <span className="text-orange-500 hover:underline font-semibold cursor-pointer">
              Login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
