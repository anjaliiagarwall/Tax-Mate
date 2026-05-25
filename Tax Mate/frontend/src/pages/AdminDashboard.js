import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false); // State for hamburger menu
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const statsRes = await api.get("/admin/stats");
            const usersRes = await api.get("/admin/users");
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            if (error.response && error.response.status === 403) {
                alert("Unauthorized Access");
                navigate("/admin");
                return; // Stop execution if unauthorized
            }
            alert("Failed to load dashboard data. Please assume backend is down or routes missing.");
        } finally {
            setLoading(false); // Stop loading regardless of success or failure
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
        } catch (error) {
            alert("Failed to delete user");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    };

    if (loading) return <div className="admin-loading">Loading Admin Panel...</div>;

    return (
        <div className="admin-container">
            <nav className="admin-navbar">
                <h1 className="admin-logo">TaxGenie Admin</h1>

                {/* Hamburger Menu Container */}
                <div className="admin-menu-container">
                    <button
                        className="admin-hamburger"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                        <div className="admin-dropdown">
                            <button onClick={handleLogout} className="admin-dropdown-item">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <div className="admin-content">
                {/* Stats Cards */}
                <div className="admin-stats-grid">
                    <div className="admin-card">
                        <h3 className="admin-card-title">Total Users</h3>
                        <p className="admin-card-value">{stats.totalUsers}</p>
                    </div>
                    <div className="admin-card">
                        <h3 className="admin-card-title">System Status</h3>
                        <p className="admin-card-value admin-status-value">Operational</p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="admin-table-card">
                    <h2 className="admin-section-title">User Management</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`admin-badge ${user.role === 'admin' ? 'admin-badge-admin' : 'admin-badge-user'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="admin-delete-btn"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
