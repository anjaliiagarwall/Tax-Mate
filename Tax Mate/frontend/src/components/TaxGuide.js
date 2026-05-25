import React from 'react';
import '../styles/TaxGuide.css';

const TaxGuide = () => {
    return (
        <div className="tax-guide-container">
            <section className="guide-section">
                <h2>What is the Magical Tax Genie Calculator?</h2>
                <p>
                    The <strong>Magical Tax Genie Income Tax Calculator</strong> is a comprehensive tool designed to calculate your tax liability with precision, adhering to the Income Tax Act, 1961. It simplifies complex tax laws into an easy-to-understand interface, allowing you to compare the <strong>Old vs. New Tax Regimes</strong> instantly.
                </p>
                <p>
                    Whether you are a salaried employee, a freelancer, or a business owner, this tool helps you optimize your tax planning for <strong>FY 2026-27</strong> (AY 2027-28) and prior years. It accounts for the latest budget updates, surcharge rates, and rebates.
                </p>
            </section>

            <section className="guide-section">
                <h2>Step-by-Step Usage Guide</h2>
                <ol className="guide-steps">
                    <li><strong>Step 1: Financial Year</strong> - Select the year you are filing for (e.g., FY 2025-26).</li>
                    <li><strong>Step 2: Age Category</strong> - Tax slabs under the Old Regime differ for Seniors (60-80) and Super Seniors (80+).</li>
                    <li><strong>Step 3: Income Details</strong> - Enter your Gross Salary, Income from other sources (Interest, Rent, Capital Gains).</li>
                    <li><strong>Step 4: Deductions (Old Regime)</strong> - Enter amounts for:
                        <ul>
                            <li><strong>80C:</strong> PPF, EPF, LIC, ELSS, Tuition Fees (Max ₹1.5L).</li>
                            <li><strong>80D:</strong> Health Insurance (Self: ₹25k, Seniors: ₹50k).</li>
                            <li><strong>80G:</strong> Donations to charitable trusts.</li>
                        </ul>
                    </li>
                    <li><strong>Step 5: Calculate</strong> - Click the button to see a side-by-side comparison and find out which regime saves you more money.</li>
                </ol>
            </section>

            <section className="guide-section">
                <h2>Income Tax Slab Rates</h2>

                <div className="slab-container">
                    <h3>🆕 FY 2026-27 (AY 2027-28) — New Tax Regime (Default)</h3>
                    <p>Budget 2026 made <strong>no changes</strong> to tax slabs or rates — the FY 2026-27 structure is identical to FY 2025-26 introduced in Budget 2025.</p>
                    <table className="guide-table">
                        <thead>
                            <tr>
                                <th>Income Slabs</th>
                                <th>Tax Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Up to ₹ 4,00,000</td><td>NIL</td></tr>
                            <tr><td>₹ 4,00,001 – ₹ 8,00,000</td><td>5%</td></tr>
                            <tr><td>₹ 8,00,001 – ₹ 12,00,000</td><td>10%</td></tr>
                            <tr><td>₹ 12,00,001 – ₹ 16,00,000</td><td>15%</td></tr>
                            <tr><td>₹ 16,00,001 – ₹ 20,00,000</td><td>20%</td></tr>
                            <tr><td>₹ 20,00,001 – ₹ 24,00,000</td><td>25%</td></tr>
                            <tr><td>Above ₹ 24,00,000</td><td>30%</td></tr>
                        </tbody>
                    </table>
                    <p className="note">✅ Standard Deduction of <strong>₹75,000</strong> for salaried &amp; pensioners. Rebate u/s 87A: <strong>Zero tax if taxable income ≤ ₹12,00,000</strong> (₹12.75L for salaried after std. deduction).</p>
                </div>

                <div className="slab-container">
                    <h3>FY 2026-27 / FY 2025-26 — Old Tax Regime (Below 60 Years)</h3>
                    <p>The Old Regime allows you to claim exemptions like HRA, LTA, and Section 80 deductions.</p>
                    <table className="guide-table">
                        <thead>
                            <tr>
                                <th>Income Slabs</th>
                                <th>Tax Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Up to ₹ 2,50,000</td><td>NIL</td></tr>
                            <tr><td>₹ 2,50,001 – ₹ 5,00,000</td><td>5% (Rebate u/s 87A ≤ ₹5L)</td></tr>
                            <tr><td>₹ 5,00,001 – ₹ 10,00,000</td><td>20%</td></tr>
                            <tr><td>Above ₹ 10,00,000</td><td>30%</td></tr>
                        </tbody>
                    </table>
                    <p className="note">Standard Deduction of ₹50,000 applies. + 4% Health &amp; Education Cess on total tax.</p>
                </div>

                <div className="slab-container">
                    <h3>FY 2024-25 — New Tax Regime (for reference)</h3>
                    <table className="guide-table">
                        <thead>
                            <tr>
                                <th>Income Slabs</th>
                                <th>Tax Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Up to ₹ 3,00,000</td><td>NIL</td></tr>
                            <tr><td>₹ 3,00,001 – ₹ 7,00,000</td><td>5% (Rebate u/s 87A ≤ ₹7L)</td></tr>
                            <tr><td>₹ 7,00,001 – ₹ 10,00,000</td><td>10%</td></tr>
                            <tr><td>₹ 10,00,001 – ₹ 12,00,000</td><td>15%</td></tr>
                            <tr><td>₹ 12,00,001 – ₹ 15,00,000</td><td>20%</td></tr>
                            <tr><td>Above ₹ 15,00,000</td><td>30%</td></tr>
                        </tbody>
                    </table>
                    <p className="note">Standard Deduction ₹50,000 for salaried. Rebate u/s 87A: tax-free up to ₹7L.</p>
                </div>
            </section>

            <section className="guide-section">
                <h2>Important Tax Concepts</h2>

                <div className="concept-box">
                    <h3>1. Rebate u/s 87A</h3>
                    <p>Tax relief provided by the government for lower income groups.</p>
                    <table className="guide-table">
                        <thead>
                            <tr><th>FY</th><th>New Regime (Rebate Limit)</th><th>Old Regime (Rebate Limit)</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>FY 2024-25</td><td>≤ ₹7,00,000 → Tax = 0</td><td>≤ ₹5,00,000 → Tax = 0</td></tr>
                            <tr><td>FY 2025-26</td><td>≤ ₹12,00,000 → Tax = 0</td><td>≤ ₹5,00,000 → Tax = 0</td></tr>
                            <tr><td>FY 2026-27</td><td>≤ ₹12,00,000 → Tax = 0</td><td>≤ ₹5,00,000 → Tax = 0</td></tr>
                        </tbody>
                    </table>
                    <p className="note">For salaried individuals: after ₹75,000 Standard Deduction, the effective zero-tax income under New Regime is <strong>₹12,75,000</strong> (FY 2025-26 &amp; 2026-27).</p>
                </div>

                <div className="concept-box">
                    <h3>2. Surcharge Rates</h3>
                    <p>Additional tax levied on high-income earners (calculated on the tax amount).</p>
                    <table className="guide-table">
                        <thead>
                            <tr><th>Total Income</th><th>Surcharge Rate</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>₹50 Lakh - ₹1 Crore</td><td>10%</td></tr>
                            <tr><td>₹1 Crore - ₹2 Crore</td><td>15%</td></tr>
                            <tr><td>Above ₹2 Crore (Old Regime)</td><td>25% / 37%</td></tr>
                            <tr><td>Above ₹2 Crore (New Regime)</td><td>Max 25%</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="concept-box">
                    <h3>3. HRA Calculation Logic</h3>
                    <p>If you live in a rented house, the lowest of the following is exempt from tax:</p>
                    <ol>
                        <li>Actual HRA received.</li>
                        <li>50% of Basic Salary (Metros) or 40% (Non-Metros).</li>
                        <li>Rent Paid minus 10% of Basic Salary.</li>
                    </ol>
                </div>
            </section>

            <section className="guide-section faqs">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-item">
                    <h4>Which regime is better for me?</h4>
                    <p>Generally, if your total deductions (80C, 80D, HRA, etc.) exceed <strong>₹3.75 Lakhs</strong>, the Old Regime might be more beneficial. Otherwise, the New Regime usually saves more tax due to lower slab rates.</p>
                </div>
                <div className="faq-item">
                    <h4>Can I switch regimes every year?</h4>
                    <p>Salaried individuals can switch between Old and New regimes every year based on what is beneficial. However, those with business income can only switch once.</p>
                </div>
                <div className="faq-item">
                    <h4>Is interest on Home Loan deductible?</h4>
                    <p>Yes, under Section 24(b), interest up to <strong>₹2 Lakhs</strong> on a self-occupied property is deductible under the <strong>Old Regime</strong>. The New Regime does not offer this deduction for self-occupied properties.</p>
                </div>
            </section>
        </div>
    );
};

export default TaxGuide;
