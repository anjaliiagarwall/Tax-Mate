import React, { useState } from "react";
import api from "../services/api";

export const UserProfileModal = ({ user, onClose, onLogout }) => {
    const [activeTab, setActiveTab] = useState("details"); // details, password
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    if (!user) return null;

    const handleChangePassword = async () => {
        try {
            const res = await api.post("/auth/change-password", { oldPassword, newPassword });
            setMessage(res.data.message);
            setOldPassword("");
            setNewPassword("");
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to update password");
        }
    };

    const handleDeleteAccount = async () => {
        const password = prompt("Please enter your password to confirm account deletion:");
        if (!password) return;

        if (!window.confirm("Are you SURE? This action cannot be undone.")) return;

        try {
            await api.delete("/auth/delete-account", { data: { password } });
            onLogout();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete account");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content profile-modal">
                <div className="modal-header">
                    <h3>My Profile</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="profile-tabs">
                    <button
                        className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
                        onClick={() => setActiveTab("details")}
                    >
                        Details
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
                        onClick={() => setActiveTab("password")}
                    >
                        Security
                    </button>
                </div>

                <div className="modal-body">
                    {activeTab === "details" && (
                        <div className="details-section">
                            <div className="info-group">
                                <label>Name</label>
                                <div className="info-value">{user.name}</div>
                            </div>
                            <div className="info-group">
                                <label>Email</label>
                                <div className="info-value">{user.email}</div>
                            </div>

                            <div className="danger-zone">
                                <button onClick={handleDeleteAccount} className="btn-text-danger">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "password" && (
                        <div className="password-section">
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            {message && <p className="message">{message}</p>}
                            <button onClick={handleChangePassword} className="btn-primary full-width">
                                Update Password
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
