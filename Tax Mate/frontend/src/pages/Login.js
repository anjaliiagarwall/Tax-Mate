import React, { useState } from "react";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role || "user");
      window.location.href = "/dashboard";
    } catch (err) {
      if (err.response) {
        // Server responded with an error (e.g. 400 Invalid credentials)
        setError(err.response.data?.message || "Invalid email or password.");
      } else if (err.request) {
        // Request was made but no response (backend not running)
        setError("Cannot connect to server. Please make sure the backend is running on port 5000.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/guest-login");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "guest");
      window.location.href = "/dashboard";
    } catch (err) {
      if (err.request && !err.response) {
        setError("Cannot connect to server. Please make sure the backend is running on port 5000.");
      } else {
        setError("Guest login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Tax Mate</h2>
        <p>Secure login to your tax dashboard</p>

        {error && (
          <div style={{
            background: "rgba(255,107,107,0.15)",
            border: "1px solid #ff6b6b",
            borderRadius: "8px",
            color: "#ff6b6b",
            padding: "12px 16px",
            marginBottom: "16px",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            {error}
          </div>
        )}

        <input
          className="auth-input"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="email"
        />

        <div className="password-wrapper">
          <input
            className="auth-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>

        <button className="auth-button" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          className="auth-button guest-btn"
          onClick={handleGuestLogin}
          disabled={loading}
        >
          Continue as Guest
        </button>

        <div className="auth-link">
          <a href="/register">Create new account</a>
        </div>
        <div style={{ marginTop: "30px", fontSize: "18px", textAlign: "center" }}>
          <a href="/admin" style={{ color: "#6c757d", textDecoration: "none" }}>Admin Access</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
