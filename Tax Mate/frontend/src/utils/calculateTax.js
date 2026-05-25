/**
 * Indian Income Tax Calculation Engine
 *
 * Key rules implemented:
 *  1. Slab-based tax calculation (progressive)
 *  2. Section 87A rebate = min(slabTax, maxRebate) — applied BEFORE cess
 *  3. Marginal Relief — ensures extra tax ≤ extra income over rebate limit
 *  4. 4% Health & Education Cess — applied on (slabTax - rebate)
 *  5. Senior/Super-Senior citizen different slabs under Old Regime
 */

import { TAX_DATA } from "./taxSlabs";

/**
 * Applies progressive slab tax on a given income.
 * @param {number} income   - Taxable income after all deductions
 * @param {Array}  slabs    - Array of { upto, rate } objects (ascending order)
 * @returns {number} Raw slab tax (before rebate & cess)
 */
function applySlabs(income, slabs) {
  let tax = 0;
  let prev = 0;
  for (const slab of slabs) {
    if (income > prev) {
      const chunk = Math.min(income, slab.upto) - prev;
      tax += chunk * slab.rate;
      prev = slab.upto;
    } else {
      break;
    }
  }
  return tax;
}

/**
 * Applies Section 87A rebate.
 * Rebate = min(slabTax, maxRebate), but ONLY if income <= incomeLimit.
 * This is a cap — not a blanket zero.
 *
 * @param {number} slabTax    - Raw tax from slabs
 * @param {number} income     - Taxable income
 * @param {object} rebateRule - { incomeLimit, maxRebate }
 * @returns {number} Tax after rebate
 */
function applyRebate(slabTax, income, rebateRule) {
  if (income <= rebateRule.incomeLimit) {
    const rebate = Math.min(slabTax, rebateRule.maxRebate);
    return Math.max(0, slabTax - rebate);
  }
  return slabTax;
}

/**
 * Applies Marginal Relief.
 * Ensures that the tax payable (before cess) does not exceed
 * (income - rebateIncomeLimit). This prevents the "cliff effect"
 * where earning ₹1 more causes disproportionately high tax.
 *
 * @param {number} taxAfterRebate   - Tax after 87A rebate
 * @param {number} taxableIncome    - Taxable income
 * @param {number} rebateIncomeLimit - 87A income threshold
 * @returns {number} Tax after marginal relief
 */
function applyMarginalRelief(taxAfterRebate, taxableIncome, rebateIncomeLimit) {
  if (taxableIncome > rebateIncomeLimit) {
    const incomeExcess = taxableIncome - rebateIncomeLimit;
    // Tax should not exceed the income excess over rebate limit
    return Math.min(taxAfterRebate, incomeExcess);
  }
  return taxAfterRebate;
}

/**
 * Adds 4% Health & Education Cess.
 * Cess is applied on final tax (after rebate & marginal relief).
 *
 * @param {number} tax - Tax before cess
 * @returns {number} Tax with cess, rounded to nearest rupee
 */
function addCess(tax) {
  return Math.round(tax * 1.04);
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW REGIME TAX CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates tax under the New Tax Regime.
 *
 * Steps:
 *  1. Apply standard deduction (₹75,000 for FY 2024-25 onwards)
 *  2. Apply slab tax
 *  3. Apply 87A rebate (if taxable income ≤ limit)
 *  4. Apply marginal relief (if income just above rebate limit)
 *  5. Add 4% cess
 *
 * @param {number} grossIncome   - Total income before std deduction
 * @param {string} financialYear - e.g. "2026-27"
 * @returns {object} { tax, taxableIncome, stdDeduction, slabTax, rebate, marginalRelief, cessAmount }
 */
export function calculateNewRegimeTax(grossIncome, financialYear = "2026-27") {
  const fyData = TAX_DATA[financialYear] || TAX_DATA["2026-27"];

  const stdDed = fyData.stdDeduction.new;
  const taxableIncome = Math.max(0, grossIncome - stdDed);

  // Step 1: Slab tax
  const slabTax = applySlabs(taxableIncome, fyData.new.slabs);

  // Step 2: Section 87A rebate
  const rebateRule = fyData.rebate.new;
  let taxAfterRebate = applyRebate(slabTax, taxableIncome, rebateRule);
  const rebateApplied = slabTax - taxAfterRebate;

  // Step 3: Marginal relief (only when income slightly exceeds rebate limit)
  let marginalReliefApplied = 0;
  const mrConfig = fyData.marginalRelief?.new;
  if (mrConfig && taxableIncome > rebateRule.incomeLimit) {
    const taxBeforeMR = taxAfterRebate;
    taxAfterRebate = applyMarginalRelief(taxAfterRebate, taxableIncome, rebateRule.incomeLimit);
    marginalReliefApplied = taxBeforeMR - taxAfterRebate;
  }

  // Step 4: Cess
  const cessAmount = Math.round(taxAfterRebate * 0.04);
  const totalTax = Math.round(taxAfterRebate + cessAmount);

  return {
    tax: totalTax,
    taxableIncome,
    stdDeduction: stdDed,
    slabTax: Math.round(slabTax),
    rebateApplied: Math.round(rebateApplied),
    marginalReliefApplied: Math.round(marginalReliefApplied),
    cessAmount,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OLD REGIME TAX CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates tax under the Old Tax Regime.
 *
 * Steps:
 *  1. Apply standard deduction (₹50,000) + user-provided deductions
 *  2. Apply age-appropriate slab tax
 *  3. Apply 87A rebate (max ₹12,500, if income ≤ ₹5L)
 *  4. Add 4% cess
 *
 * Note: Super Senior Citizens (80+) get a basic exemption of ₹5L through
 *       the slab itself, so 87A rebate is irrelevant for them.
 *
 * @param {number} grossIncome    - Total income before deductions
 * @param {number} userDeductions - Deductions under 80C, 80D, HRA, etc.
 * @param {string} ageGroup       - "below60" | "senior" | "superSenior"
 * @param {string} financialYear  - e.g. "2026-27"
 * @returns {object} { tax, taxableIncome, totalDeductions, slabTax, rebate, cessAmount }
 */
export function calculateOldRegimeTax(grossIncome, userDeductions = 0, ageGroup = "below60", financialYear = "2026-27") {
  const fyData = TAX_DATA[financialYear] || TAX_DATA["2026-27"];

  const stdDed = fyData.stdDeduction.old; // ₹50,000
  const totalDeductions = stdDed + userDeductions;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // Select correct slab based on age group
  const slabs = fyData.old[ageGroup] || fyData.old.below60;

  // Step 1: Slab tax
  const slabTax = applySlabs(taxableIncome, slabs);

  // Step 2: Section 87A rebate
  const rebateRule = fyData.rebate.old;
  const taxAfterRebate = applyRebate(slabTax, taxableIncome, rebateRule);
  const rebateApplied = slabTax - taxAfterRebate;

  // Step 3: Cess
  const cessAmount = Math.round(taxAfterRebate * 0.04);
  const totalTax = Math.round(taxAfterRebate + cessAmount);

  return {
    tax: totalTax,
    taxableIncome,
    totalDeductions,
    stdDeduction: stdDed,
    slabTax: Math.round(slabTax),
    rebateApplied: Math.round(rebateApplied),
    cessAmount,
  };
}

/**
 * Compares both regimes and returns a verdict.
 *
 * @param {number} oldTax
 * @param {number} newTax
 * @returns {string} Recommendation
 */
export function compareRegimes(oldTax, newTax) {
  if (newTax < oldTax) return "New Regime is Better";
  if (oldTax < newTax) return "Old Regime is Better";
  return "Both Regimes are Equal";
}
