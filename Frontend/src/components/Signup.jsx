import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import AuthImagePattern from "./AuthImagePattern";
const apiUrl = import.meta.env.VITE_API_URL;

const Signup = () => {
  const [userName, setUserName] = useState();
  const [emailId, setEmailId] = useState();
  const [mobileNumber, setMobileNumber] = useState();
  const [password, setPassword] = useState("");
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [addError, setAddError] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const notify = () => toast("You are successfully registered!");
  const notifyUserExist = () => toast(addError);

  // validating email
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmailId(email);

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,63}$/i;

    // Disallow consecutive dots
    const hasConsecutiveDots = email.includes("..");

    // Allowed email services
    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "aol.com",
      "hotmail.com",
      "outlook.com",
    ];

    // Extract domain from email
    const domain = email.split("@")[1]?.toLowerCase() || "";

    // Final validation
    const isValid =
      emailRegex.test(email) &&
      !hasConsecutiveDots &&
      allowedDomains.includes(domain);

    setIsValidEmail(isValid);
  };

  // Enhanced Indian mobile validation: 10 digits, starts with 6-9, no sequence
  const isValidIndianMobile = (number) => {
    if (!/^[6-9]\d{9}$/.test(number)) return false;
    // Check for sequential numbers (e.g., 1234567890, 9876543210, etc.)
    const isSequential = (num) => {
      let asc = true,
        desc = true;
      for (let i = 1; i < num.length; i++) {
        if (parseInt(num[i]) !== parseInt(num[i - 1]) + 1) asc = false;
        if (parseInt(num[i]) !== parseInt(num[i - 1]) - 1) desc = false;
      }
      return asc || desc;
    };
    if (isSequential(number)) return false;
    return true;
  };

  // Password validation checks (no spaces allowed)
  const passwordChecks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    noSpace: !/\s/.test(password),
  };

  // Password validation function (no spaces allowed)
  const validatePassword = (pwd) => {
    const lengthCheck = pwd.length >= 8;
    const lowerCheck = /[a-z]/.test(pwd);
    const upperCheck = /[A-Z]/.test(pwd);
    const numberCheck = /[0-9]/.test(pwd);
    const specialCheck = /[^A-Za-z0-9]/.test(pwd);
    const noSpaceCheck = !/\s/.test(pwd);
    return (
      lengthCheck &&
      lowerCheck &&
      upperCheck &&
      numberCheck &&
      specialCheck &&
      noSpaceCheck
    );
  };

  // Checking mobile number valid or not
  const handleAddNewUser = async (e) => {
    e.preventDefault();
    setAddError("");

    if (!userName || !emailId || !mobileNumber || !password) {
      setAddError("All fields are required");
      return;
    }
    if (!isValidIndianMobile(mobileNumber)) {
      setAddError("Please enter a valid Indian mobile number.");
      return;
    }

    setLoading(true); // ⬅️ start loading here

    try {
      const res = await fetch(`${apiUrl}/signup`, {
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
        if (res.status === 409 && err.exists) {
          setAddError("User already present with this email or mobile number");
          notifyUserExist();
        } else {
          setAddError(err.error || "Failed to add contact");
        }
        setLoading(false); // ⬅️ stop loading on error
        return;
      }

      setEmailId("");
      setPassword("");
      setMobileNumber("");
      setUserName("");
      notify();

      setLoading(false); // ⬅️ stop loading before navigation

      navigate("/verify-otp", {
        state: { emailId: emailId, userName, password },
      });
    } catch (err) {
      setAddError("Failed to add contact");
      setLoading(false); // ⬅️ stop loading on network error
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row bg-gray-900 min-h-screen">
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-32 text-white">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-gray-100 ">
            Sign up
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!userName || !emailId || !mobileNumber || !password) {
                setAddError("All fields are required");
                setPasswordError("");
                return;
              }
              if (!isValidEmail) {
                setAddError("Please enter a valid email address.");
                setPasswordError("");
                return;
              }
              if (!validatePassword(password || "")) {
                setPasswordError(
                  "Password must be at least 8 characters, include a lowercase letter, an uppercase letter, a number, a special character, and must not contain spaces."
                );
                setAddError("");
                return;
              }
              setPasswordError("");
              if (!isValidIndianMobile(mobileNumber)) {
                setAddError("Please enter a valid Indian mobile number.");
                return;
              }
              handleAddNewUser(e);
            }}
          >
            {/* Input for userName */}
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded w-full mb-4 focus:outline-focus focus:ring-2 focus:ring-gray-400"
              placeholder="User Name"
            />

            {/* Input for email */}
            <input
              type="email"
              value={emailId}
              onChange={handleEmailChange}
              className={`p-3 border-2 border-gray-300 rounded w-full mb-4 focus:outline-focus focus:ring-2 focus:ring-gray-400 ${
                isValidEmail ? "border-gray-500" : "border-red-500"
              }`}
              placeholder="Email id"
            />
            {!isValidEmail && emailId.length > 0 && (
              <p className="text-red-600 text-sm">
                Please enter a valid email address
              </p>
            )}

            {/* Input for mobile number */}
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => {
                let value = e.target.value.replace(/[^0-9]/g, "");
                if (value.length > 10) value = value.slice(0, 10);
                if (value && !/^[6-9]/.test(value)) return;
                setMobileNumber(value);
              }}
              className="p-3 border-2 border-gray-300 rounded w-full mb-4 focus:outline-focus focus:ring-2 focus:ring-gray-400"
              placeholder="Mobile number"
            />

            {/* input for password */}
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                // Prevent spaces in password
                if (/\s/.test(e.target.value)) return;
                setPassword(e.target.value);
              }}
              onFocus={() => setShowPasswordHint(true)}
              onBlur={() => setShowPasswordHint(false)}
              className="p-3 border-2 border-gray-300 rounded w-full mb-1 focus:outline-focus focus:ring-2 focus:ring-gray-400"
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
                      passwordChecks.special
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                  >
                    {passwordChecks.special ? "✓" : "•"} At least one special
                    character
                  </li>
                  <li
                    className={
                      passwordChecks.noSpace
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                  >
                    {passwordChecks.noSpace ? "✓" : "•"} No spaces allowed
                  </li>
                </ul>
              </div>
            )}
            {passwordError && (
              <div className="text-xs text-red-600 mb-2">{passwordError}</div>
            )}

            {/* Show Password portion */}
            <div
              className={`flex items-center ${
                password ? "visible  my-1" : "invisible"
              }`}
            >
              <input
                id="link-checkbox"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                for="link-checkbox"
                className="ms-2 text-sm font-medium text-gray-600"
              >
                Show password
              </label>
            </div>

            {/* Button for sumbut the form*/}
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-4 rounded w-full transition-colors duration-200 cursor-pointer ${
                loading
                  ? "bg-gray-500 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-black"
              }`}
            >
              {loading ? "Signing up..." : "Submit"}
            </button>
          </form>
          <div className="mt-4 text-center text-gray-100 text-sm sm:text-base">
            Already have an account?
            <Link to="/login">
              <span className="text-orange-500 hover:underline font-semibold cursor-pointer ml-1">
                Login
              </span>
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-1/2 hidden lg:block">
          <AuthImagePattern
            title="Join our community"
            subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;
