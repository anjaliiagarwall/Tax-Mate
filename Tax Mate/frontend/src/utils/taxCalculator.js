import React, { useState } from "react";
import "./calculator.css";

const TaxCalculator = () => {
  const [regime, setRegime] = useState("old");
  const [income, setIncome] = useState("");
  const [deductions, setDeductions] = useState("");
  const [result, setResult] = useState(null);

  const calculateTax = () => {
    if (!income) {
      alert("Please enter your annual income");
      return;
    }

    let taxableIncome =
      regime === "old"
        ? Math.max(income - (deductions || 0), 0)
        : income;

    setResult(`Taxable Income: ₹${taxableIncome.toLocaleString()}`);
  };

  return (
    <div className="calculator-card">
      <h2>Income Tax Calculator</h2>
      <p className="subtitle">
        Calculate income tax under Old & New Regime as per Indian tax rules
      </p>

      {/* Regime Toggle */}
      <div className="regime-toggle">
        <button
          className={regime === "new" ? "active" : ""}
          onClick={() => setRegime("new")}
        >
          New Regime
        </button>
        <button
          className={regime === "old" ? "active" : ""}
          onClick={() => setRegime("old")}
        >
          Old Regime
        </button>
      </div>

      {/* Annual Income */}
      <div className="form-group">
        <label>Annual Gross Income (₹)</label>
        <input
          type="number"
          placeholder="Enter your total yearly income"
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
        />
      </div>

      {/* Deductions – ONLY for Old Regime */}
      {regime === "old" && (
        <div className="form-group">
          <label>Total Deductions (₹)</label>
          <small>80C, 80D, HRA, Standard Deduction etc.</small>
          <input
            type="number"
            placeholder="Enter total deductions applicable"
            value={deductions}
            onChange={(e) => setDeductions(Number(e.target.value))}
          />
        </div>
      )}

      <button className="calculate-btn" onClick={calculateTax}>
        Calculate Tax
      </button>

      {result && <div className="result-box">{result}</div>}
    </div>
  );
};

export default TaxCalculator;
