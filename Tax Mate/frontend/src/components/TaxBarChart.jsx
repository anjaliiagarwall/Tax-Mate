import React, { useState, useEffect, useRef } from "react";
import "./TaxBarChart.css";

/**
 * TaxBarChart
 * Props:
 *   grossIncome     {number}
 *   newTaxable      {number}
 *   oldTaxable      {number}
 *   newDeductions   {number}
 *   oldDeductions   {number}
 *   newTax          {number}
 *   oldTax          {number}
 *   recommended     {"New Regime" | "Old Regime"}
 */
const fmt = (n) => {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_00_000)  return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1000)      return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

const AnimatedBar = ({ value, maxValue, color, label, delay = 0 }) => {
  const [height, setHeight] = useState(0);
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;

  useEffect(() => {
    const t = setTimeout(() => setHeight(pct), 80 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="tbc-bar-col">
      <div className="tbc-bar-track">
        <div
          className="tbc-bar-fill"
          style={{ height: `${height}%`, background: color }}
          title={`${label}: ${fmt(value)}`}
        />
      </div>
      <span className="tbc-bar-val">{fmt(value)}</span>
    </div>
  );
};

const TaxBarChart = ({
  grossIncome = 0,
  newTaxable = 0,
  oldTaxable = 0,
  newDeductions = 0,
  oldDeductions = 0,
  newTax = 0,
  oldTax = 0,
  recommended = "New Regime",
}) => {
  const [activeTab, setActiveTab] = useState("new");

  const isNew = activeTab === "new";

  const taxable    = isNew ? newTaxable    : oldTaxable;
  const deductions = isNew ? newDeductions : oldDeductions;
  const tax        = isNew ? newTax        : oldTax;

  const maxVal = Math.max(grossIncome, taxable, deductions, tax, 1);

  // Y-axis labels — 5 evenly spaced steps
  const steps = 5;
  const yLabels = Array.from({ length: steps + 1 }, (_, i) =>
    Math.round((maxVal / steps) * (steps - i))
  );

  const bars = [
    { key: "income",    label: "Total Income",    value: grossIncome, color: "rgba(99,179,237,0.6)", delay: 0   },
    { key: "taxable",   label: "Taxable Income",  value: taxable,     color: "rgba(66,153,225,0.85)", delay: 80  },
    { key: "deduction", label: "Deduction",       value: deductions,  color: "#2d3748",              delay: 160 },
    { key: "tax",       label: "Tax Payable",     value: tax,         color: "#38a169",              delay: 240 },
  ];

  const legend = [
    { label: "Total income",   color: "rgba(99,179,237,0.6)"  },
    { label: "Taxable income", color: "rgba(66,153,225,0.85)" },
    { label: "Deduction",      color: "#2d3748"               },
    { label: "Tax payable",    color: "#38a169"               },
  ];

  return (
    <div className="tbc-root">
      {/* Tab switcher */}
      <div className="tbc-tabs">
        <button
          className={`tbc-tab ${activeTab === "new" ? "tbc-tab--active" : ""}`}
          onClick={() => setActiveTab("new")}
        >
          New regime
        </button>
        {recommended && (
          <span className={`tbc-badge ${
            recommended === "New Regime" && activeTab !== "old" ? "tbc-badge--new" :
            recommended === "Old Regime" && activeTab !== "new" ? "tbc-badge--old" :
            "tbc-badge--muted"
          }`}>
            {recommended === (isNew ? "New Regime" : "Old Regime") ? "Recommended ✓" : "Compare"}
          </span>
        )}
        <button
          className={`tbc-tab ${activeTab === "old" ? "tbc-tab--active" : ""}`}
          onClick={() => setActiveTab("old")}
        >
          Old regime
        </button>
      </div>

      {/* Chart area */}
      <div className="tbc-chart">
        {/* Y-axis */}
        <div className="tbc-y-axis">
          {yLabels.map((val, i) => (
            <span key={i} className="tbc-y-label">{fmt(val)}</span>
          ))}
        </div>

        {/* Grid + bars */}
        <div className="tbc-grid-area">
          {/* Horizontal grid lines */}
          {yLabels.map((_, i) => (
            <div key={i} className="tbc-grid-line" style={{ top: `${(i / steps) * 100}%` }} />
          ))}

          {/* Bars */}
          <div className="tbc-bars-row">
            {bars.map((b) => (
              <AnimatedBar
                key={b.key}
                value={b.value}
                maxValue={maxVal}
                color={b.color}
                label={b.label}
                delay={b.delay}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="tbc-legend">
        {legend.map((l) => (
          <div key={l.label} className="tbc-legend-item">
            <span className="tbc-legend-dot" style={{ background: l.color }} />
            <span className="tbc-legend-label">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxBarChart;
