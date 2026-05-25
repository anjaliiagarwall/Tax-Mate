import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TaxGuide from "../components/TaxGuide";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import { TAX_DATA } from "../utils/taxSlabs";
import {
  calculateNewRegimeTax as computeNewTax,
  calculateOldRegimeTax as computeOldTax,
  compareRegimes,
} from "../utils/calculateTax";
import "../styles/Calculator.css";
import TaxBarChart from "../components/TaxBarChart";

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

export default function Calculator() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("basic");
  const [financialYear, setFinancialYear] = useState("2026-27");
  const [ageGroup, setAgeGroup] = useState("below60");
  const [isGuest, setIsGuest] = useState(false);

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

  // Detailed Income State
  const [incomeDetails, setIncomeDetails] = useState({
    salary: "",
    exemptAllowances: "",
    interestIncome: "",
    homeLoanSelf: "",
    rentalIncome: "",
    homeLoanLetOut: "",
    digitalAssets: "",
    otherIncome: ""
  });

  const [deductions, setDeductions] = useState({
    section80C: "",
    section80D: "",
    section80G: "",
    section80TTA: "",
    npsSelf: "",
    npsEmployer: "",
    homeLoanInterest: "",
    hra: ""
  });

  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);

  // Pre-fill from AI Assistant
  useEffect(() => {
    if (location.state && location.state.prefilledData) {
      const data = location.state.prefilledData;
      setIncomeDetails(prev => ({
        ...prev,
        salary: data.totalEarnings || "", // Mapping Total Earnings to Salary (simplification)
        // Ideally we'd map parts, but total is safer start
      }));
      setDeductions(prev => ({
        ...prev,
        section80C: data.pf || "",
      }));
      setActiveTab("income");
    }
  }, [location.state]);


  /* ---------------- LOGIC ---------------- */
  const calculateGrossIncome = () => {
    const salary = Number(incomeDetails.salary) || 0;
    const exempt = Number(incomeDetails.exemptAllowances) || 0;
    const netSalary = Math.max(0, salary - exempt);

    const interest = Number(incomeDetails.interestIncome) || 0;
    const rental = Number(incomeDetails.rentalIncome) || 0;
    const hlLetOut = Number(incomeDetails.homeLoanLetOut) || 0;
    // Self-occupied home loan interest loss — capped at ₹2L under old regime
    const hlSelf = Math.min(Number(incomeDetails.homeLoanSelf) || 0, 200000);
    const incomeHouseProperty = rental - hlLetOut - hlSelf;

    const crypto = Number(incomeDetails.digitalAssets) || 0;
    const other = Number(incomeDetails.otherIncome) || 0;

    return Math.max(0, netSalary + interest + incomeHouseProperty + crypto + other);
  };

  const getUserDeductions = () =>
    Number(deductions.section80C || 0) +
    Number(deductions.section80D || 0) +
    Number(deductions.section80G || 0) +
    Number(deductions.section80TTA || 0) +
    Number(deductions.npsSelf || 0) +
    Number(deductions.npsEmployer || 0) +
    Number(deductions.homeLoanInterest || 0) +
    Number(deductions.hra || 0);

  const calculateTax = () => {
    const grossIncome = calculateGrossIncome();
    const userDed = getUserDeductions();

    // Use the correct engine from calculateTax.js — handles 87A rebate cap,
    // marginal relief, senior/super-senior slabs, and 4% cess correctly.
    const newResult = computeNewTax(grossIncome, financialYear);
    const oldResult = computeOldTax(grossIncome, userDed, ageGroup, financialYear);

    const bestRegime = compareRegimes(oldResult.tax, newResult.tax);

    const suggestionsList = generateTaxSuggestions(oldResult.taxableIncome);

    setResult({
      tax: Math.min(oldResult.tax, newResult.tax), // best regime tax shown at top
      grossIncome,
      // New Regime details
      newTax: newResult.tax,
      newTaxable: newResult.taxableIncome,
      newStdDed: newResult.stdDeduction,
      newSlabTax: newResult.slabTax,
      newRebate: newResult.rebateApplied,
      newMarginalRelief: newResult.marginalReliefApplied,
      newCess: newResult.cessAmount,
      // Old Regime details
      oldTax: oldResult.tax,
      oldTaxable: oldResult.taxableIncome,
      oldTotalDed: oldResult.totalDeductions,
      oldSlabTax: oldResult.slabTax,
      oldRebate: oldResult.rebateApplied,
      oldCess: oldResult.cessAmount,
      // Meta
      suggestions: suggestionsList,
    });
    setComparison({ oldTax: oldResult.tax, newTax: newResult.tax, bestRegime });
  };

  const handleSaveRecord = async () => {
    if (isGuest) {
      alert("Guest accounts cannot save records. Please login or register first!");
      return;
    }

    if (!result) return;

    try {
      await api.post("/tax/save", {
        income: result.grossIncome,
        deductions: result.oldTotalDed,
        oldTax: result.oldTax,
        newTax: result.newTax
      });
      alert("Tax record saved successfully!");
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Failed to save tax record.");
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <>
      <Navbar />
      <div className="calculator-container">
        <h1>Income Tax Calculator</h1>

        {/* --- TABS HEADER --- */}
        <div className="calc-tabs">
          <button
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic details
          </button>
          <button
            className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
            onClick={() => setActiveTab('income')}
          >
            Income details
          </button>
          <button
            className={`tab-btn ${activeTab === 'deductions' ? 'active' : ''}`}
            onClick={() => setActiveTab('deductions')}
          >
            Deduction
          </button>
        </div>

        {/* --- TAB CONTENT --- */}

        {/* TAB 1: BASIC DETAILS */}
        {activeTab === 'basic' && (
          <div className="tab-content fade-in">
            <div className="input-row">
              <div className="input-group">
                <label>Financial Year</label>
                <select value={financialYear} onChange={(e) => setFinancialYear(e.target.value)}>
                  <option value="2026-27">FY 2026-27 (AY 2027-28)</option>
                  <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
                  <option value="2024-25">FY 2024-25 (AY 2025-26)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Age Group</label>
                <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
                  <option value="below60">Citizen (Below 60)</option>
                  <option value="senior">Senior Citizen (60–79)</option>
                  <option value="superSenior">Super Senior (80+)</option>
                </select>
              </div>
            </div>

            <div className="nav-buttons">
              <button className="nav-btn next" onClick={() => setActiveTab('income')}>Continue</button>
            </div>
          </div>
        )}

        {/* TAB 2: INCOME DETAILS */}
        {activeTab === 'income' && (
          <div className="tab-content fade-in">
            <div className="income-grid">

              {/* Left column */}
              <div className="income-col">
                {[
                  { key: "salary",        label: "Income from Salary",        desc: "Basic + HRA + Special Allowances etc." },
                  { key: "interestIncome",label: "Income from interest",       desc: "Savings Bank Interest, FD Interest" },
                  { key: "rentalIncome",  label: "Rental income received",     desc: "Gross rent received from let-out property" },
                  { key: "digitalAssets", label: "Income from digital assets",  desc: "Crypto, NFTs, online gaming winnings — flat 30%" },
                ].map((field) => (
                  <div key={field.key} className="inc-field">
                    <div className="inc-label-row">
                      <span className="inc-label">{field.label}</span>
                      <div className="tooltip">
                        <span className="info-icon">i</span>
                        <span className="tooltip-text">{field.desc}</span>
                      </div>
                    </div>
                    <div className="rupee-input-wrap">
                      <span className="rupee-prefix">₹</span>
                      <input
                        className="rupee-input"
                        type="number"
                        placeholder=""
                        value={incomeDetails[field.key]}
                        onChange={(e) => setIncomeDetails({ ...incomeDetails, [field.key]: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div className="income-col">
                {[
                  { key: "exemptAllowances", label: "Exempt allowances",              desc: "HRA Exemption, LTA etc. — subtracted from salary" },
                  { key: "homeLoanSelf",     label: "Interest on home loan – Self occupied", desc: "Max ₹2L deductible under Section 24(b) — Old Regime" },
                  { key: "homeLoanLetOut",   label: "Interest on Home Loan – Let Out", desc: "Interest paid on loan for rented-out property" },
                  { key: "otherIncome",      label: "Other income",                   desc: "Freelance, Commission, Gifts, Any other source" },
                ].map((field) => (
                  <div key={field.key} className="inc-field">
                    <div className="inc-label-row">
                      <span className="inc-label">{field.label}</span>
                      <div className="tooltip">
                        <span className="info-icon">i</span>
                        <span className="tooltip-text">{field.desc}</span>
                      </div>
                    </div>
                    <div className="rupee-input-wrap">
                      <span className="rupee-prefix">₹</span>
                      <input
                        className="rupee-input"
                        type="number"
                        placeholder=""
                        value={incomeDetails[field.key]}
                        onChange={(e) => setIncomeDetails({ ...incomeDetails, [field.key]: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>{/* /income-grid */}

            <div className="nav-buttons">
              <button className="nav-btn" onClick={() => setActiveTab('basic')}>Back</button>
              <button className="nav-btn next" onClick={() => setActiveTab('deductions')}>Continue</button>
            </div>
          </div>
        )}

        {/* TAB 3: DEDUCTIONS */}
        {activeTab === 'deductions' && (
          <div className="tab-content fade-in">
              <span style={{ color: 'var(--muted-foreground)' }}>
                ℹ️ Standard Deduction (₹75,000 New / ₹50,000 Old) is auto-applied. Deductions below are used for the <strong>Old Regime</strong> calculation.
              </span>

            <div className="income-grid" style={{ marginTop: '32px' }}>

                {/* Left column */}
                <div className="income-col">
                  {[
                    { key: "section80C",      label: "Section 80C",             desc: "LIC, PPF, EPF, ELSS, NSC — Max ₹1.5L" },
                    { key: "section80D",      label: "Section 80D (Health)",    desc: "Health insurance premium — Self: ₹25k, Senior parents: +₹50k" },
                    { key: "hra",             label: "HRA Exemption",           desc: "Actual HRA received vs rent paid vs 50%/40% of basic" },
                  ].map((field) => (
                    <div key={field.key} className="inc-field">
                      <div className="inc-label-row">
                        <span className="inc-label">{field.label}</span>
                        <div className="tooltip">
                          <span className="info-icon">i</span>
                          <span className="tooltip-text">{field.desc}</span>
                        </div>
                      </div>
                      <div className="rupee-input-wrap">
                        <span className="rupee-prefix">₹</span>
                        <input
                          className="rupee-input"
                          type="number"
                          placeholder=""
                          value={deductions[field.key]}
                          onChange={(e) => setDeductions({ ...deductions, [field.key]: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right column */}
                <div className="income-col">
                  {[
                    { key: "homeLoanInterest", label: "Home Loan Interest (24b)", desc: "Max ₹2L for self-occupied property under Section 24(b)" },
                    { key: "section80TTA",     label: "Savings Interest (80TTA)",  desc: "Interest on savings account — Max ₹10,000" },
                    { key: "npsSelf",          label: "NPS Contribution (80CCD)",  desc: "Additional ₹50k over 80C limit under 80CCD(1B)" },
                    { key: "npsEmployer",      label: "Employer NPS (80CCD2)",     desc: "Employer's NPS contribution — up to 10% of salary" },
                    { key: "section80G",       label: "Donations (80G)",           desc: "Donations to approved charitable institutions" },
                  ].map((field) => (
                    <div key={field.key} className="inc-field">
                      <div className="inc-label-row">
                        <span className="inc-label">{field.label}</span>
                        <div className="tooltip">
                          <span className="info-icon">i</span>
                          <span className="tooltip-text">{field.desc}</span>
                        </div>
                      </div>
                      <div className="rupee-input-wrap">
                        <span className="rupee-prefix">₹</span>
                        <input
                          className="rupee-input"
                          type="number"
                          placeholder=""
                          value={deductions[field.key]}
                          onChange={(e) => setDeductions({ ...deductions, [field.key]: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            <div className="nav-buttons">
              <button className="nav-btn" onClick={() => setActiveTab('income')}>Back</button>
              <button className="calculate-btn" onClick={calculateTax}>Calculate Tax</button>
            </div>
          </div>
        )}

        {/* RESULT SECTION */}
        {result && (
          <div id="result-section">

            {/* ── RECOMMENDED BANNER (shown first) ── */}
            {(() => {
              const isNewBetter = result.newTax <= result.oldTax;
              const bestTax  = isNewBetter ? result.newTax  : result.oldTax;
              const otherTax = isNewBetter ? result.oldTax  : result.newTax;
              const saving   = Math.max(0, otherTax - bestTax);
              return (
                <div className="rec-banner" style={{
                  background: isNewBetter
                    ? 'linear-gradient(135deg,#16a34a22,#15803d11)'
                    : 'linear-gradient(135deg,#ea580c22,#c2410c11)',
                  border: `1.5px solid ${isNewBetter ? '#22c55e55' : '#f9731655'}`,
                  borderRadius: 'var(--radius)',
                  padding: '28px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                  flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                      <span style={{
                        fontSize:'12px', fontWeight:'700', padding:'3px 10px',
                        borderRadius:'999px', letterSpacing:'.05em',
                        background: isNewBetter ? '#22c55e33' : '#f9731633',
                        color: isNewBetter ? '#22c55e' : '#f97316',
                        border: `1px solid ${isNewBetter ? '#22c55e66' : '#f9731666'}`,
                      }}>✓ RECOMMENDED</span>
                      <span style={{ fontSize:'22px', fontWeight:'800', color:'var(--foreground)' }}>
                        {isNewBetter ? 'New Regime' : 'Old Regime'}
                      </span>
                    </div>
                    <div style={{ fontSize:'38px', fontWeight:'800', color: isNewBetter ? '#22c55e' : '#f97316' }}>
                      ₹{bestTax.toLocaleString()}
                    </div>
                    <div style={{ color:'var(--muted-foreground)', fontSize:'14px', marginTop:'4px' }}>
                      FY {financialYear} &nbsp;·&nbsp; You save ₹{saving.toLocaleString()} vs the other regime
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:'var(--muted-foreground)', fontSize:'13px', marginBottom:'4px' }}>Other regime</div>
                    <div style={{ fontSize:'22px', fontWeight:'700', color:'var(--muted-foreground)', textDecoration:'line-through' }}>
                      ₹{otherTax.toLocaleString()}
                    </div>
                    <div style={{ fontSize:'13px', color:'var(--muted-foreground)', marginTop:'4px' }}>
                      {isNewBetter ? 'Old Regime' : 'New Regime'}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── BOTH REGIME BREAKDOWN SIDE BY SIDE ── */}
            <div className="result-box" style={{ marginTop: '20px', background: 'var(--card)', textAlign: 'left' }}>
              <h3 style={{ marginBottom: '16px' }}>Full Tax Breakdown — Both Regimes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

                {/* New Regime */}
                <div style={{
                  border: result.newTax <= result.oldTax ? '1.5px solid #22c55e55' : '1px solid var(--border)',
                  borderRadius:'12px', padding:'20px',
                  background: result.newTax <= result.oldTax ? '#22c55e08' : 'transparent',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                    <span style={{ fontWeight:'800', fontSize:'16px', color:'#22c55e' }}>New Regime</span>
                    {result.newTax <= result.oldTax && (
                      <span style={{ fontSize:'11px', background:'#22c55e22', color:'#22c55e', border:'1px solid #22c55e44', borderRadius:'999px', padding:'2px 8px', fontWeight:'700' }}>Best ✓</span>
                    )}
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
                    <tbody>
                      <tr><td style={{ padding:'5px 0', color:'#94a3b8' }}>Gross Income</td><td style={{ textAlign:'right' }}>₹{result.grossIncome.toLocaleString()}</td></tr>
                      <tr><td style={{ padding:'5px 0', color:'#94a3b8' }}>Std Deduction</td><td style={{ textAlign:'right' }}>− ₹{result.newStdDed.toLocaleString()}</td></tr>
                      <tr style={{ borderTop:'1px solid var(--border)' }}><td style={{ padding:'7px 0', fontWeight:'700' }}>Taxable Income</td><td style={{ textAlign:'right', fontWeight:'700' }}>₹{result.newTaxable.toLocaleString()}</td></tr>
                      <tr><td style={{ padding:'5px 0', color:'#94a3b8' }}>Slab Tax</td><td style={{ textAlign:'right' }}>₹{result.newSlabTax.toLocaleString()}</td></tr>
                      {result.newRebate > 0 && <tr><td style={{ padding:'5px 0', color:'#22c55e' }}>87A Rebate</td><td style={{ textAlign:'right', color:'#22c55e' }}>− ₹{result.newRebate.toLocaleString()}</td></tr>}
                      {result.newMarginalRelief > 0 && <tr><td style={{ padding:'5px 0', color:'#22c55e' }}>Marginal Relief</td><td style={{ textAlign:'right', color:'#22c55e' }}>− ₹{result.newMarginalRelief.toLocaleString()}</td></tr>}
                      <tr><td style={{ padding:'5px 0', color:'#94a3b8' }}>4% Cess</td><td style={{ textAlign:'right' }}>₹{result.newCess.toLocaleString()}</td></tr>
                      <tr style={{ borderTop:'2px solid #22c55e55' }}><td style={{ padding:'8px 0', fontWeight:'800', color:'#22c55e', fontSize:'16px' }}>Total Tax</td><td style={{ textAlign:'right', fontWeight:'800', color:'#22c55e', fontSize:'16px' }}>₹{result.newTax.toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* Old Regime */}
                <div style={{
                  border: result.oldTax < result.newTax ? '1.5px solid #f9731655' : '1px solid var(--border)',
                  borderRadius:'12px', padding:'20px',
                  background: result.oldTax < result.newTax ? '#f9731608' : 'transparent',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                    <span style={{ fontWeight:'800', fontSize:'16px', color:'#f97316' }}>Old Regime</span>
                    {result.oldTax < result.newTax && (
                      <span style={{ fontSize:'11px', background:'#f9731622', color:'#f97316', border:'1px solid #f9731644', borderRadius:'999px', padding:'2px 8px', fontWeight:'700' }}>Best ✓</span>
                    )}
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
                    <tbody>
                      <tr><td style={{ padding:'5px 0', color:'#94a3b8' }}>Gross Income</td><td style={{ textAlign:'right' }}>₹{result.grossIncome.toLocaleString()}</td></tr>
                      <tr><td style={{ padding:'5px 0', color:'#94a3b8' }}>Total Deductions</td><td style={{ textAlign:'right' }}>− ₹{result.oldTotalDed.toLocaleString()}</td></tr>
                      <tr style={{ borderTop:'1px solid var(--border)' }}><td style={{ padding:'7px 0', fontWeight:'700' }}>Taxable Income</td><td style={{ textAlign:'right', fontWeight:'700' }}>₹{result.oldTaxable.toLocaleString()}</td></tr>
                      <tr><td style={{ padding:'5px 0', color:'#94a3b8' }}>Slab Tax</td><td style={{ textAlign:'right' }}>₹{result.oldSlabTax.toLocaleString()}</td></tr>
                      {result.oldRebate > 0 && <tr><td style={{ padding:'5px 0', color:'#22c55e' }}>87A Rebate</td><td style={{ textAlign:'right', color:'#22c55e' }}>− ₹{result.oldRebate.toLocaleString()}</td></tr>}
                      <tr><td style={{ padding:'5px 0', color:'#94a3b8' }}>4% Cess</td><td style={{ textAlign:'right' }}>₹{result.oldCess.toLocaleString()}</td></tr>
                      <tr style={{ borderTop:`2px solid #f9731655` }}><td style={{ padding:'8px 0', fontWeight:'800', color:'#f97316', fontSize:'16px' }}>Total Tax</td><td style={{ textAlign:'right', fontWeight:'800', color:'#f97316', fontSize:'16px' }}>₹{result.oldTax.toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            {/* ── Bar Chart ── */}
            {result && comparison && (
              <TaxBarChart
                grossIncome={result.grossIncome}
                newTaxable={result.newTaxable}
                oldTaxable={result.oldTaxable}
                newDeductions={result.newStdDed}
                oldDeductions={result.oldTotalDed}
                newTax={result.newTax}
                oldTax={result.oldTax}
                recommended={result.newTax <= result.oldTax ? "New Regime" : "Old Regime"}
              />
            )}

            {/* Suggestions Box */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="result-box" style={{ marginTop: '20px', background: 'var(--card)' }}>
                <h3>Tax-Saving Suggestions</h3>
                <div style={{ textAlign: 'left', marginTop: '15px' }}>
                  <p><span style={{ color: 'var(--primary)', marginRight: '5px' }}>✓</span> Tax-saving tips for taxable income of ₹{result.oldTaxable.toLocaleString()} (Old Regime):</p>
                  <div style={{ marginTop: '15px' }}>
                    {result.suggestions.map((s, i) => (
                      <p key={i} style={{ marginBottom: '10px', lineHeight: '1.5' }}><span style={{ color: 'var(--primary)', marginRight: '5px' }}>•</span> {s}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
          </div>
        )}

        <TaxGuide />
      </div>
    </>
  );
}
