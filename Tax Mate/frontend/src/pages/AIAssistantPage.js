import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import TaxBarChart from '../components/TaxBarChart';
import '../styles/AIAssistantPage.css';

const generateTaxSuggestions = (taxableIncome) => {
    let suggestions = [];
    if (taxableIncome > 500000) {
        suggestions.push("1. **Section 80C**: Investments in traditional instruments like Public Provident Fund (PPF), National Savings Certificate (NSC), Equity Linked Saving Schemes (ELSS), Life Insurance premiums, and Tax Saving Fixed Deposits up to ₹1.5 lakhs can be claimed as deductions.");
        suggestions.push("2. **Section 80D**: Premium paid for health insurance for self, spouse, dependent children, and parents can be deducted up to ₹25,000 for self, spouse, and children, and an additional ₹25,000 for senior citizens' health insurance.");
    }
    if (taxableIncome > 700000) {
        suggestions.push("3. **Section 80CCD(1B)**: Consider investing ₹50,000 in NPS for an additional deduction over the 80C limit.");
    }
    if (taxableIncome > 1000000) {
        suggestions.push("4. Check if you can structure your salary to claim HRA (House Rent Allowance) or LTA (Leave Travel Allowance) if provided by your employer.");
    }
    if (suggestions.length === 0) {
        suggestions.push("Your income is largely tax-free under current regimes, but starting systematic investments (SIP) is always good practice.");
    }
    return suggestions;
};

const AIAssistantPage = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [extraInfo, setExtraInfo] = useState("");
    const [extractedData, setExtractedData] = useState(null);
    const [taxResults, setTaxResults] = useState(null);
    const [error, setError] = useState("");
    const [isGuest, setIsGuest] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.isGuest) {
                    setIsGuest(true);
                }
            } catch (e) {
                console.error("Invalid token format");
            }
        }
    }, []);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === "application/pdf") {
            setFile(selected);
            setError("");
            setExtractedData(null);
            setTaxResults(null);
        } else {
            setError("Please upload a valid PDF file.");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);
        if (extraInfo.trim() !== "") {
            formData.append("extraInfo", extraInfo.trim());
        }

        try {
            // Reusing the existing endpoint
            const res = await api.post("/tax-chat/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                setExtractedData(res.data.data);
            } else {
                setError("Could not extract data from this file.");
            }
        } catch (err) {
            console.error(err);
            setError("Server error during extraction.");
        } finally {
            setLoading(false);
        }
    };

    const calculateTax = () => {
        if (!extractedData) return;

        const gross = Number(extractedData.totalEarnings) || 0;
        const pf = Number(extractedData.pf) || 0;
        const hra = Number(extractedData.hra) || 0;

        // Old Regime Calculation
        const oldDeductions = pf + hra + 50000;
        const oldTaxable = Math.max(0, gross - oldDeductions);
        let oldTax = 0;
        if (oldTaxable <= 250000) oldTax = 0;
        else if (oldTaxable <= 500000) oldTax = (oldTaxable - 250000) * 0.05;
        else if (oldTaxable <= 1000000) oldTax = 12500 + (oldTaxable - 500000) * 0.2;
        else oldTax = 112500 + (oldTaxable - 1000000) * 0.3;

        // New Regime Calculation (FY 25-26 logic)
        const newTaxable = Math.max(0, gross - 75000);
        let newTax = 0;
        if (newTaxable <= 400000) newTax = 0;
        else if (newTaxable <= 800000) newTax = (newTaxable - 400000) * 0.05;
        else if (newTaxable <= 1200000) newTax = 20000 + (newTaxable - 800000) * 0.1;
        else if (newTaxable <= 1600000) newTax = 60000 + (newTaxable - 1200000) * 0.15;
        else if (newTaxable <= 2000000) newTax = 120000 + (newTaxable - 1600000) * 0.2;
        else if (newTaxable <= 2400000) newTax = 200000 + (newTaxable - 2000000) * 0.25;
        else newTax = 300000 + (newTaxable - 2400000) * 0.3;

        const suggestionsList = generateTaxSuggestions(oldTaxable);

        setTaxResults({
            gross,
            oldDeductions,
            newDeductions: 75000,
            oldTaxable,
            newTaxable,
            oldTax: Math.round(oldTax),
            newTax: Math.round(newTax),
            recommended: oldTax < newTax ? "Old Regime" : "New Regime",
            suggestions: suggestionsList
        });
    };

    const handleSaveRecord = async () => {
        if (isGuest) {
            alert("Guest accounts cannot save records. Please login or register first!");
            return;
        }

        if (!taxResults) return;

        try {
            await api.post("/tax/save", {
                income: taxResults.gross,
                deductions: taxResults.oldDeductions,
                oldTax: taxResults.oldTax,
                newTax: taxResults.newTax
            });
            alert("Tax record saved successfully!");
        } catch (error) {
            console.error("Error saving record:", error);
            alert("Failed to save tax record.");
        }
    };

    const handleProceed = () => {
        if (extractedData) {
            navigate("/calculator", { state: { prefilledData: extractedData } });
        }
    };

    return (
        <>
            <Navbar />
            <div className="ai-page-wrapper">
                <div className="ai-main-container">
                    <div className="ai-header">
                        <h1>Tax Document Processor</h1>
                        <p className="ai-header-desc">
                            Instantly analyze your salary slip and receive precise AI-driven income tax calculations.
                            Upload a PDF file below to begin processing your data.
                        </p>
                    </div>

                    <div className="ai-body">
                        {!extractedData ? (
                            <div className="upload-section">
                                <div
                                    className="ai-upload-box"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <svg className="svg-icon calc-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" /></svg>
                                    <div>
                                        <span className="ai-file-btn">Choose Salary PDF</span>
                                        <p className="ai-file-name" style={{ marginTop: '10px' }}>{file ? file.name : "No file chosen"}</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                <div className="ai-extra-info-container" style={{ marginBottom: '30px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'var(--foreground)' }}>
                                        Additional Tax Information (Optional)
                                    </label>
                                    <textarea
                                        className="ai-extra-info-input"
                                        placeholder="Any extra deductions or income not in the slip? (e.g. 'I invested 1.5L in PPF' or 'I have 50k freelancing income')"
                                        value={extraInfo}
                                        onChange={(e) => setExtraInfo(e.target.value)}
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '20px',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border)',
                                            background: 'var(--card)',
                                            color: 'var(--foreground)',
                                            fontSize: '18px',
                                            lineHeight: '1.6',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                {error && <p className="ai-error-text">{error}</p>}

                                <button
                                    className="ai-action-btn"
                                    disabled={!file || loading}
                                    onClick={handleUpload}
                                >
                                    <svg className="svg-icon sugg-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
                                    {loading ? "Processing Document..." : "Upload & Analyze"}
                                </button>
                            </div>
                        ) : (
                            <div className="doc-results-wrapper">

                                {/* Summary Section */}
                                <div className="ai-card">
                                    <h2>
                                        Summary Analysis
                                    </h2>
                                    <div style={{ marginTop: '20px' }}>
                                        {Object.entries(extractedData).map(([key, value]) => {
                                            const label = key
                                                .replace(/([A-Z])/g, ' $1')
                                                .replace(/^./, str => str.toUpperCase());

                                            const knownLabels = {
                                                basic: "Basic Salary",
                                                hra: "House Rent Allowance (HRA)",
                                                pf: "Provident Fund (PF)",
                                                totalEarnings: "Total Earnings",
                                                name: "Employee Name",
                                                pan: "PAN Number",
                                                employer: "Employer Name"
                                            };
                                            const finalLabel = knownLabels[key] || label;

                                            return (
                                                <div key={key} className="ai-calc-item">
                                                    <span className="text-primary">•</span>
                                                    <span>{finalLabel}:</span>
                                                    <span style={{ fontWeight: 'normal', marginLeft: '5px' }}>
                                                        {typeof value === 'number' ? `₹${value.toLocaleString()}` : value}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Tax Calculation Section */}
                                <div className="ai-card">
                                    <h2>
                                        Tax Calculation
                                    </h2>
                                    {taxResults ? (
                                        <>
                                            <div className="ai-calc-item"><span className="text-primary">•</span> <span>Annual Salary:</span> ₹{taxResults.gross.toLocaleString()}</div>
                                            <div className="ai-calc-item"><span className="text-primary">•</span> <span>Annual Deductions:</span> ₹{taxResults.oldDeductions.toLocaleString()}</div>
                                            <div className="ai-calc-item"><span className="text-primary">•</span> <span>Taxable Income:</span> ₹{taxResults.oldTaxable.toLocaleString()}</div>
                                            <br />
                                            <div className="ai-calc-res"><span className="text-primary">✓</span> <span>New Regime Tax:</span> ₹{(taxResults.newTax || 0).toLocaleString()}</div>
                                            <div className="ai-calc-res"><span className="text-destructive">✓</span> <span>Old Regime Tax:</span> ₹{(taxResults.oldTax || 0).toLocaleString()}</div>

                                            <div className="calculation-results fade-in" style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                                                <div className="recommendation-box" style={{ marginBottom: '0', background: 'var(--secondary)' }}>
                                                    <p>Recommended: <strong>{taxResults.recommended}</strong></p>
                                                </div>
                                            </div>

                                            {/* ── Bar Chart ── */}
                                            <TaxBarChart
                                                grossIncome={taxResults.gross}
                                                newTaxable={taxResults.newTaxable}
                                                oldTaxable={taxResults.oldTaxable}
                                                newDeductions={taxResults.newDeductions}
                                                oldDeductions={taxResults.oldDeductions}
                                                newTax={taxResults.newTax}
                                                oldTax={taxResults.oldTax}
                                                recommended={taxResults.recommended}
                                            />

                                            {/* ACTION BUTTONS (SAVE / VIEW HISTORY) */}
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                <button
                                                    onClick={handleSaveRecord}
                                                    style={{
                                                        padding: '12px 24px',
                                                        borderRadius: 'var(--radius)',
                                                        border: '1px solid var(--border)',
                                                        background: 'var(--secondary)',
                                                        color: 'var(--foreground)',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                >
                                                    Save Tax Record
                                                </button>

                                                <button
                                                    onClick={() => navigate('/tax-history')}
                                                    style={{
                                                        padding: '12px 24px',
                                                        borderRadius: 'var(--radius)',
                                                        border: '1px solid var(--border)',
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                >
                                                    View Tax Records
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button className="ai-action-btn" onClick={calculateTax}>
                                            Calculate Tax Payable
                                        </button>
                                    )}
                                </div>

                                {/* Suggestions Section */}
                                {taxResults && (
                                    <div className="ai-card">
                                        <h2>
                                            Tax-Saving Suggestions
                                        </h2>
                                        <div className="ai-suggestions-list">
                                            <p><span className="text-primary">✓</span> Tax-saving suggestions for an income of ₹{taxResults.oldTaxable.toLocaleString()} (assuming no other deductions or exemptions):</p>
                                            <div style={{ marginTop: '20px' }}>
                                                {taxResults.suggestions.map((s, i) => (
                                                    <p key={i}><span className="text-primary">•</span> {s}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="action-buttons secondary" style={{ marginTop: '30px' }}>
                                    {taxResults && (
                                        <button className="proceed-btn-small" onClick={handleProceed} style={{ padding: '12px 20px' }}>
                                            Open Full Calculator
                                        </button>
                                    )}
                                    <button className="ai-action-btn ai-secondary-btn" onClick={() => { setExtractedData(null); setFile(null); setTaxResults(null); }}>
                                        Reset Document Processor
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIAssistantPage;
