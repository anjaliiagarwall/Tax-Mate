import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await api.post("/auth/login", { email, password });

            // Strict role check
            if (res.data.role !== "admin") {
                setError("Access Denied: You are not an administrator.");
                return;
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role); // Store role for client-side checks
            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Admin Portal</h2>
                {error && <div style={{ color: "#ff6b6b", marginBottom: "20px", fontSize: "18px", fontWeight: "bold" }}>{error}</div>}

                <input
                    className="auth-input"
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                />

                <div className="password-wrapper">
                    <input
                        className="auth-input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
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

                <button className="auth-button" onClick={handleLogin}>Authenticate</button>
            </div>
        </div>
    );
};

export default AdminLogin;
