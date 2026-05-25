import React, { useState, useEffect } from "react";
import Navbar, { getLocalizedTaxMate } from "../components/Navbar";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [lang, setLang] = useState(localStorage.getItem('taxmate_lang') || 'en');

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('taxmate_lang') || 'en');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const BrandName = () => (
    <span className="notranslate">{getLocalizedTaxMate(lang)}</span>
  );

  return (
    <>
      <Navbar />

      <div className="dashboard-bg">
        <div className="dashboard-container">

          <h1>Welcome to <BrandName /></h1>
          <p className="subtitle">
            A smart, AI-assisted income tax calculation and management system
            designed to simplify tax planning for individuals across India.
          </p>

          {/* ── What is it ──────────────────────────────────────────── */}
          <section className="card">
            <h2>What is <BrandName />?</h2>
            <p>
              <BrandName /> is a digital tax companion that helps users calculate income
              tax under both Old and New tax regimes as per Indian Income Tax rules for
              FY 2024-25, FY 2025-26, and FY 2026-27. It automatically compares both regimes,
              recommends the better option, tracks your tax history, and lets you extract
              income data directly from salary slips via the AI Document Processor.
            </p>
          </section>

          {/* ── Core Features ────────────────────────────────────────── */}
          <section className="card">
            <h2>Core Features</h2>
            <ul>
              <li>Instant tax calculation using official slab rates for FY 2024-25, 2025-26 &amp; 2026-27</li>
              <li>Automatic Old vs New regime comparison — best option highlighted instantly</li>
              <li>Section 87A rebate &amp; marginal relief applied automatically</li>
              <li>Senior Citizen &amp; Super Senior Citizen slab support (Old Regime)</li>
              <li>AI Document Processor — upload salary slip PDF to auto-extract income data</li>
              <li>Visual bar chart comparing Total Income, Taxable Income, Deductions &amp; Tax</li>
              <li>Tax history storage &amp; record management</li>
              <li>Secure JWT-based authentication</li>
            </ul>
          </section>

          {/* ── How to Use ───────────────────────────────────────────── */}
          <section className="card">
            <h2>How to Use <BrandName /></h2>
            <ol>
              <li>Login or register securely</li>
              <li>Go to Tax Calculator → select Financial Year &amp; Age Group</li>
              <li>Enter your income details (salary, interest, rental, etc.)</li>
              <li>Add Old Regime deductions (80C, 80D, HRA, etc.) if applicable</li>
              <li>Click <strong>Calculate Tax</strong> — both regimes are calculated automatically</li>
              <li>View the recommended regime with exact savings amount</li>
              <li>Save your record and access previous calculations anytime</li>
            </ol>
          </section>

          {/* ── New Regime Slabs ─────────────────────────────────────── */}
          <section className="card">
            <h2>New Regime Slabs — FY 2025-26 &amp; 2026-27</h2>
            <p style={{ marginBottom: '8px', color: 'var(--muted-foreground)', fontSize: '16px' }}>
              Standard Deduction: <strong>₹75,000</strong> &nbsp;·&nbsp; Section 87A Rebate: up to <strong>₹60,000</strong> (income ≤ ₹12L) &nbsp;·&nbsp; Effective tax-free limit for salaried: <strong>₹12.75L</strong>
            </p>
            <table>
              <thead>
                <tr>
                  <th>Income Slab</th>
                  <th>Tax Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>₹0 – ₹4,00,000</td><td>0%</td></tr>
                <tr><td>₹4,00,001 – ₹8,00,000</td><td>5%</td></tr>
                <tr><td>₹8,00,001 – ₹12,00,000</td><td>10%</td></tr>
                <tr><td>₹12,00,001 – ₹16,00,000</td><td>15%</td></tr>
                <tr><td>₹16,00,001 – ₹20,00,000</td><td>20%</td></tr>
                <tr><td>₹20,00,001 – ₹24,00,000</td><td>25%</td></tr>
                <tr><td>Above ₹24,00,000</td><td>30%</td></tr>
              </tbody>
            </table>
            <p style={{ marginTop: '16px', color: 'var(--muted-foreground)', fontSize: '15px' }}>
              + 4% Health &amp; Education Cess on final tax. Marginal relief applies for income between ₹12L–₹12.75L.
            </p>
          </section>

          {/* ── New Regime 2024-25 ───────────────────────────────────── */}
          <section className="card">
            <h2>New Regime Slabs — FY 2024-25</h2>
            <p style={{ marginBottom: '8px', color: 'var(--muted-foreground)', fontSize: '16px' }}>
              Standard Deduction: <strong>₹75,000</strong> &nbsp;·&nbsp; Section 87A Rebate: up to <strong>₹25,000</strong> (income ≤ ₹7L) &nbsp;·&nbsp; Effective tax-free limit for salaried: <strong>₹7.75L</strong>
            </p>
            <table>
              <thead>
                <tr>
                  <th>Income Slab</th>
                  <th>Tax Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>₹0 – ₹3,00,000</td><td>0%</td></tr>
                <tr><td>₹3,00,001 – ₹7,00,000</td><td>5%</td></tr>
                <tr><td>₹7,00,001 – ₹10,00,000</td><td>10%</td></tr>
                <tr><td>₹10,00,001 – ₹12,00,000</td><td>15%</td></tr>
                <tr><td>₹12,00,001 – ₹15,00,000</td><td>20%</td></tr>
                <tr><td>Above ₹15,00,000</td><td>30%</td></tr>
              </tbody>
            </table>
          </section>

          {/* ── Old Regime Slabs ─────────────────────────────────────── */}
          <section className="card">
            <h2>Old Regime Slabs — All Years</h2>
            <p style={{ marginBottom: '8px', color: 'var(--muted-foreground)', fontSize: '16px' }}>
              Standard Deduction: <strong>₹50,000</strong> &nbsp;·&nbsp; Section 87A Rebate: up to <strong>₹12,500</strong> (income ≤ ₹5L)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '24px' }}>

              <div>
                <p style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--foreground)', fontSize: '18px' }}>Below 60 Years</p>
                <table>
                  <thead><tr><th>Slab</th><th>Rate</th></tr></thead>
                  <tbody>
                    <tr><td>₹0 – ₹2,50,000</td><td>0%</td></tr>
                    <tr><td>₹2,50,001 – ₹5,00,000</td><td>5%</td></tr>
                    <tr><td>₹5,00,001 – ₹10,00,000</td><td>20%</td></tr>
                    <tr><td>Above ₹10,00,000</td><td>30%</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <p style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--foreground)', fontSize: '18px' }}>Senior Citizen (60–79 yrs)</p>
                <table>
                  <thead><tr><th>Slab</th><th>Rate</th></tr></thead>
                  <tbody>
                    <tr><td>₹0 – ₹3,00,000</td><td>0%</td></tr>
                    <tr><td>₹3,00,001 – ₹5,00,000</td><td>5%</td></tr>
                    <tr><td>₹5,00,001 – ₹10,00,000</td><td>20%</td></tr>
                    <tr><td>Above ₹10,00,000</td><td>30%</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <p style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--foreground)', fontSize: '18px' }}>Super Senior (80+ yrs)</p>
                <table>
                  <thead><tr><th>Slab</th><th>Rate</th></tr></thead>
                  <tbody>
                    <tr><td>₹0 – ₹5,00,000</td><td>0%</td></tr>
                    <tr><td>₹5,00,001 – ₹10,00,000</td><td>20%</td></tr>
                    <tr><td>Above ₹10,00,000</td><td>30%</td></tr>
                  </tbody>
                </table>
              </div>

            </div>
            <p style={{ marginTop: '16px', color: 'var(--muted-foreground)', fontSize: '15px' }}>
              + 4% Health &amp; Education Cess on final tax.
            </p>
          </section>

          {/* ── Key Deductions (Old Regime) ─────────────────────────── */}
          <section className="card">
            <h2>Key Deductions — Old Regime</h2>
            <table>
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Description</th>
                  <th>Limit</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Standard Deduction</td><td>Auto-applied for salaried individuals</td><td>₹50,000</td></tr>
                <tr><td>Section 80C</td><td>PPF, LIC, EPF, ELSS, NSC, Tuition fees</td><td>₹1,50,000</td></tr>
                <tr><td>Section 80D</td><td>Health insurance premium (self + family)</td><td>₹25,000 – ₹75,000</td></tr>
                <tr><td>Section 80CCD(1B)</td><td>NPS self-contribution (over 80C limit)</td><td>₹50,000</td></tr>
                <tr><td>Section 80TTA</td><td>Savings bank interest</td><td>₹10,000</td></tr>
                <tr><td>HRA</td><td>House Rent Allowance exemption</td><td>Actual / computed</td></tr>
                <tr><td>Section 24(b)</td><td>Home loan interest — self-occupied</td><td>₹2,00,000</td></tr>
                <tr><td>Section 87A Rebate</td><td>Full tax rebate if income ≤ ₹5L (all FYs)</td><td>Max ₹12,500</td></tr>
              </tbody>
            </table>
          </section>

          {/* ── Section 87A Rebate ───────────────────────────────────── */}
          <section className="card">
            <h2>Section 87A Rebate — At a Glance</h2>
            <table>
              <thead>
                <tr>
                  <th>Financial Year</th>
                  <th>Regime</th>
                  <th>Income Threshold</th>
                  <th>Max Rebate</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>FY 2024-25</td><td>New Regime</td><td>≤ ₹7,00,000</td><td>₹25,000</td></tr>
                <tr><td>FY 2024-25</td><td>Old Regime</td><td>≤ ₹5,00,000</td><td>₹12,500</td></tr>
                <tr><td>FY 2025-26</td><td>New Regime</td><td>≤ ₹12,00,000</td><td>₹60,000</td></tr>
                <tr><td>FY 2025-26</td><td>Old Regime</td><td>≤ ₹5,00,000</td><td>₹12,500</td></tr>
                <tr><td>FY 2026-27</td><td>New Regime</td><td>≤ ₹12,00,000</td><td>₹60,000</td></tr>
                <tr><td>FY 2026-27</td><td>Old Regime</td><td>≤ ₹5,00,000</td><td>₹12,500</td></tr>
              </tbody>
            </table>
            <p style={{ marginTop: '16px', color: 'var(--muted-foreground)', fontSize: '15px' }}>
              Rebate = min(slab tax, max rebate). Tax is zero if the full rebate covers it. Marginal relief prevents cliff-effect for incomes slightly above the threshold.
            </p>
          </section>

          {/* ── FAQ ─────────────────────────────────────────────────── */}
          <section className="card">
            <h2>Frequently Asked Questions</h2>
            <p><strong>Is <BrandName /> free?</strong><br />Yes, completely free to use.</p>
            <p><strong>Does it file my ITR?</strong><br />No — it calculates your tax liability only. Use the Income Tax e-Filing portal (incometax.gov.in) to actually file.</p>
            <p><strong>Which regime should I choose?</strong><br />The calculator automatically computes both and tells you which saves more money for your specific income and deductions.</p>
            <p><strong>Is my data secure?</strong><br />Yes. All data is secured with JWT authentication and passwords are hashed.</p>
            <p><strong>Can I use it for my salary slip?</strong><br />Yes! The AI Document Processor can read your salary slip PDF and auto-fill income fields in the calculator.</p>
          </section>

        </div>
      </div>
    </>
  );
}
