import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const TaxHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get("/tax/history");
                setRecords(res.data);
            } catch (err) {
                console.error("Error fetching tax history:", err);
                setError("Failed to load tax records.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tax record?")) return;

        try {
            await api.delete(`/tax/history/${id}`);
            setRecords(records.filter(record => record._id !== id));
        } catch (err) {
            console.error("Error deleting record:", err);
            alert("Failed to delete record.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="admin-container fade-in">
                <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <div>
                            <h2 style={{ fontSize: '28px', color: 'var(--foreground)' }}>My Tax Records</h2>
                            <p style={{ color: '#94a3b8', marginTop: '10px' }}>Review your previously saved tax calculations.</p>
                        </div>
                        <button className="back-btn" onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: 'var(--radius)', background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                            &larr; Go Back
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>Loading records...</div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>{error}</div>
                    ) : records.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <p style={{ color: '#94a3b8', fontSize: '18px' }}>No tax records found.</p>
                            <p style={{ color: '#64748b', marginTop: '10px' }}>Save a record from the Calculator or Document Processor to see it here.</p>
                            <button
                                onClick={() => navigate('/calculator')}
                                style={{ marginTop: '20px', padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Go to Calculator
                            </button>
                        </div>
                    ) : (
                        <div className="users-table-container" style={{ overflowX: 'auto', background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                                        <th style={{ padding: '16px', color: 'var(--foreground)', fontWeight: 'bold' }}>Date saved</th>
                                        <th style={{ padding: '16px', color: 'var(--foreground)', fontWeight: 'bold' }}>Gross Income</th>
                                        <th style={{ padding: '16px', color: 'var(--foreground)', fontWeight: 'bold' }}>Total Deductions</th>
                                        <th style={{ padding: '16px', color: '#ef4444', fontWeight: 'bold' }}>Old Tax Regime</th>
                                        <th style={{ padding: '16px', color: '#22c55e', fontWeight: 'bold' }}>New Tax Regime</th>
                                        <th style={{ padding: '16px', color: 'var(--foreground)', fontWeight: 'bold' }}>Recommended</th>
                                        <th style={{ padding: '16px', color: 'var(--foreground)', fontWeight: 'bold' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(record => (
                                        <tr key={record._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '16px', color: '#94a3b8' }}>{formatDate(record.createdAt)}</td>
                                            <td style={{ padding: '16px', color: 'var(--foreground)', fontWeight: '500' }}>₹{record.income.toLocaleString()}</td>
                                            <td style={{ padding: '16px', color: 'var(--foreground)', fontWeight: '500' }}>₹{record.deductions.toLocaleString()}</td>
                                            <td style={{ padding: '16px', color: '#ef4444', fontWeight: 'bold' }}>₹{record.oldTax.toLocaleString()}</td>
                                            <td style={{ padding: '16px', color: '#22c55e', fontWeight: 'bold' }}>₹{record.newTax.toLocaleString()}</td>
                                            <td style={{ padding: '16px', fontWeight: 'bold', color: record.newTax < record.oldTax ? '#22c55e' : '#ef4444' }}>
                                                {record.newTax < record.oldTax ? 'New Regime' : 'Old Regime'}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <button
                                                    onClick={() => handleDelete(record._id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: 'transparent',
                                                        color: '#ef4444',
                                                        border: '1px solid #ef4444',
                                                        borderRadius: 'var(--radius)',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        transition: 'background 0.2s',
                                                    }}
                                                    onMouseOver={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.1)' }}
                                                    onMouseOut={(e) => { e.target.style.background = 'transparent' }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TaxHistory;
