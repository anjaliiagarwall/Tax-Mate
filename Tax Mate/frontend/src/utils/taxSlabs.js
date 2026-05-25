/**
 * Indian Income Tax Slabs & Rules
 * Sources: Income Tax Act 1961, Union Budgets 2024 (July), 2025 (Feb), 2026 (Feb)
 *
 * Structure per Financial Year:
 *  - new.slabs       : Tax slabs for New Regime (applied AFTER standard deduction)
 *  - old.below60     : Old Regime slabs for individuals below 60 years
 *  - old.senior      : Old Regime slabs for Senior Citizens (age 60 – 79)
 *  - old.superSenior : Old Regime slabs for Super Senior Citizens (age 80+)
 *  - stdDeduction    : Standard deductions available in each regime
 *  - rebate          : Section 87A rebate details { limit (taxable income threshold), maxRebate (₹ cap) }
 *  - marginalRelief  : Applicable when taxable income > rebate limit but within this range
 */

export const TAX_DATA = {

  // ─────────────────────────────────────────────────────────────────────────────
  // FY 2024-25 (AY 2025-26)  |  Budget presented July 2024
  //   Key changes: Std deduction (New Regime) raised 50k→75k;
  //                New Regime slabs revised; 87A limit raised 25k (New).
  // ─────────────────────────────────────────────────────────────────────────────
  "2024-25": {
    new: {
      slabs: [
        { upto: 300000,  rate: 0    },
        { upto: 700000,  rate: 0.05 },
        { upto: 1000000, rate: 0.10 },
        { upto: 1200000, rate: 0.15 },
        { upto: 1500000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 },
      ],
    },
    old: {
      // Below 60 years
      below60: [
        { upto: 250000,  rate: 0    },
        { upto: 500000,  rate: 0.05 },
        { upto: 1000000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 },
      ],
      // Senior Citizens (60 to 79 years)
      senior: [
        { upto: 300000,  rate: 0    },
        { upto: 500000,  rate: 0.05 },
        { upto: 1000000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 },
      ],
      // Super Senior Citizens (80 years and above)
      superSenior: [
        { upto: 500000,  rate: 0    },
        { upto: 1000000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 },
      ],
    },
    stdDeduction: {
      new: 75000,   // Increased from ₹50k in Budget July 2024
      old: 50000,
    },
    rebate: {
      // Section 87A rebate — applied BEFORE cess, AFTER slab tax
      new: {
        incomeLimit: 700000,   // taxable income after std deduction ≤ ₹7L
        maxRebate:   25000,    // max rebate = min(tax, ₹25,000)
      },
      old: {
        incomeLimit: 500000,   // taxable income after deductions ≤ ₹5L
        maxRebate:   12500,    // max rebate = min(tax, ₹12,500)
      },
    },
    // Marginal Relief: prevents tax > income excess over rebate limit
    marginalRelief: {
      new: {
        rebateIncomeSlab: 700000,   // 87A limit
        stdDedAdded:      75000,    // std deduction for salaried (so effective threshold = 7,75,000)
      },
      old: null,  // No marginal relief under old regime
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FY 2025-26 (AY 2026-27)  |  Budget Feb 2025
  //   Key changes: New Regime slabs further revised (4L base);
  //                87A limit raised to ₹12L (max ₹60k) under New Regime.
  // ─────────────────────────────────────────────────────────────────────────────
  "2025-26": {
    new: {
      slabs: [
        { upto: 400000,  rate: 0    },
        { upto: 800000,  rate: 0.05 },
        { upto: 1200000, rate: 0.10 },
        { upto: 1600000, rate: 0.15 },
        { upto: 2000000, rate: 0.20 },
        { upto: 2400000, rate: 0.25 },
        { upto: Infinity, rate: 0.30 },
      ],
    },
    old: {
      below60: [
        { upto: 250000,  rate: 0    },
        { upto: 500000,  rate: 0.05 },
        { upto: 1000000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 },
      ],
      senior: [
        { upto: 300000,  rate: 0    },
        { upto: 500000,  rate: 0.05 },
        { upto: 1000000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 },
      ],
      superSenior: [
        { upto: 500000,  rate: 0    },
        { upto: 1000000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 },
      ],
    },
    stdDeduction: {
      new: 75000,
      old: 50000,
    },
    rebate: {
      new: {
        incomeLimit: 1200000,  // taxable income after std deduction ≤ ₹12L
        maxRebate:   60000,    // max rebate = min(tax, ₹60,000)
      },
      old: {
        incomeLimit: 500000,
        maxRebate:   12500,
      },
    },
    marginalRelief: {
      new: {
        rebateIncomeSlab: 1200000,
        stdDedAdded:      75000, // effective salaried threshold ₹12.75L
      },
      old: null,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FY 2026-27 (AY 2027-28)  |  Budget Feb 2026
  //   Key changes: NONE — all slabs, rebates, and deductions identical to FY 2025-26.
  // ─────────────────────────────────────────────────────────────────────────────
  "2026-27": {
    new: {
      slabs: [
        { upto: 400000,  rate: 0    },
        { upto: 800000,  rate: 0.05 },
        { upto: 1200000, rate: 0.10 },
        { upto: 1600000, rate: 0.15 },
        { upto: 2000000, rate: 0.20 },
        { upto: 2400000, rate: 0.25 },
        { upto: Infinity, rate: 0.30 },
      ],
    },
    old: {
      below60: [
        { upto: 250000,  rate: 0    },
        { upto: 500000,  rate: 0.05 },
        { upto: 1000000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 },
      ],
      senior: [
        { upto: 300000,  rate: 0    },
        { upto: 500000,  rate: 0.05 },
        { upto: 1000000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 },
      ],
      superSenior: [
        { upto: 500000,  rate: 0    },
        { upto: 1000000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 },
      ],
    },
    stdDeduction: {
      new: 75000,
      old: 50000,
    },
    rebate: {
      new: {
        incomeLimit: 1200000,
        maxRebate:   60000,
      },
      old: {
        incomeLimit: 500000,
        maxRebate:   12500,
      },
    },
    marginalRelief: {
      new: {
        rebateIncomeSlab: 1200000,
        stdDedAdded:      75000,
      },
      old: null,
    },
  },
};

// ── Legacy alias for backward compatibility ─────────────────────────────────
// Some older code imports TAX_SLABS — provide a minimal compatible shape.
export const TAX_SLABS = {
  "2024-25": {
    new: TAX_DATA["2024-25"].new.slabs,
    old: TAX_DATA["2024-25"].old.below60,
    rebate: { new: 700000, old: 500000 },
    standardDeduction: TAX_DATA["2024-25"].stdDeduction,
  },
  "2025-26": {
    new: TAX_DATA["2025-26"].new.slabs,
    old: TAX_DATA["2025-26"].old.below60,
    rebate: { new: 1200000, old: 500000 },
    standardDeduction: TAX_DATA["2025-26"].stdDeduction,
  },
  "2026-27": {
    new: TAX_DATA["2026-27"].new.slabs,
    old: TAX_DATA["2026-27"].old.below60,
    rebate: { new: 1200000, old: 500000 },
    standardDeduction: TAX_DATA["2026-27"].stdDeduction,
  },
};
