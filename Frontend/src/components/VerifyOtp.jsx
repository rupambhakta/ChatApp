// components/VerifyOtp.jsx
import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { emailId, userName, password } = location.state || {};
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  if (!emailId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Missing email. Go back to <Link to="/signup">Signup</Link>.
      </div>
    );
  }

  const verifyOtp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId, otp }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.message || "Failed to verify OTP");
      // verified → redirect to login with credentials prefilled
      navigate("/login", { state: { userName, password } });
    } catch (err) {
      setLoading(false);
      setError("Network error");
    }
  };

  const resendOtp = async () => {
    setResendLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId }),
      });
      const data = await res.json();
      setResendLoading(false);
      if (!res.ok) return setError(data.message || "Failed to resend OTP");
      alert("OTP resent to your email");
    } catch (err) {
      setResendLoading(false);
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Verify your email</h2>
        <p className="mb-4 text-sm text-gray-300">Enter the 6-digit code sent to <strong>{emailId}</strong></p>

        {error && <div className="mb-2 text-sm text-red-500">{error}</div>}

        <form onSubmit={verifyOtp} className="space-y-3">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter OTP"
            className="w-full p-3 rounded border-2 bg-gray-800"
          />
          <button type="submit" disabled={loading} className="w-full p-3 bg-orange-500 rounded">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-3 text-sm flex justify-between">
          <button onClick={resendOtp} disabled={resendLoading} className="text-sm underline">
            {resendLoading ? "Resending..." : "Resend code"}
          </button>
          <Link to="/signup" className="text-sm underline">Edit details</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
