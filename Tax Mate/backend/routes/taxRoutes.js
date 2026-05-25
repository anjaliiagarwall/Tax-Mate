const express = require("express");
const TaxRecord = require("../models/TaxRecord");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/tax/calculate
 * @desc    Calculate tax under Old & New Regime
 * @access  Private
 */
router.post("/calculate", auth, async (req, res) => {
  console.log("USER FROM TOKEN:", req.user);

  try {
    const { income, deductions, financialYear = "2026-27", ageGroup = "below60" } = req.body;

    if (income === undefined || deductions === undefined) {
      return res.status(400).json({ message: "Income and deductions are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const fy = ["2024-25", "2025-26", "2026-27"].includes(financialYear) ? financialYear : "2026-27";

    // ─────────────────────────────────────────────────────────────────────
    // TAX DATA (fully accurate as per Income Tax Act 1961 & budgets)
    // ─────────────────────────────────────────────────────────────────────
    const TAX_DATA = {
      "2024-25": {
        newSlabs: [
          { limit: 300000,  rate: 0  }, { limit: 700000,  rate: 5  },
          { limit: 1000000, rate: 10 }, { limit: 1200000, rate: 15 },
          { limit: 1500000, rate: 20 }, { limit: Infinity, rate: 30 },
        ],
        newStdDed: 75000, newRebateLimit: 700000, newMaxRebate: 25000,
        oldSlabs: {
          below60:    [{ limit: 250000, rate: 0 }, { limit: 500000, rate: 5 }, { limit: 1000000, rate: 20 }, { limit: Infinity, rate: 30 }],
          senior:     [{ limit: 300000, rate: 0 }, { limit: 500000, rate: 5 }, { limit: 1000000, rate: 20 }, { limit: Infinity, rate: 30 }],
          superSenior:[{ limit: 500000, rate: 0 }, { limit: 1000000, rate: 20 }, { limit: Infinity, rate: 30 }],
        },
        oldStdDed: 50000, oldRebateLimit: 500000, oldMaxRebate: 12500,
      },
      "2025-26": {
        newSlabs: [
          { limit: 400000,  rate: 0  }, { limit: 800000,  rate: 5  },
          { limit: 1200000, rate: 10 }, { limit: 1600000, rate: 15 },
          { limit: 2000000, rate: 20 }, { limit: 2400000, rate: 25 }, { limit: Infinity, rate: 30 },
        ],
        newStdDed: 75000, newRebateLimit: 1200000, newMaxRebate: 60000,
        oldSlabs: {
          below60:    [{ limit: 250000, rate: 0 }, { limit: 500000, rate: 5 }, { limit: 1000000, rate: 20 }, { limit: Infinity, rate: 30 }],
          senior:     [{ limit: 300000, rate: 0 }, { limit: 500000, rate: 5 }, { limit: 1000000, rate: 20 }, { limit: Infinity, rate: 30 }],
          superSenior:[{ limit: 500000, rate: 0 }, { limit: 1000000, rate: 20 }, { limit: Infinity, rate: 30 }],
        },
        oldStdDed: 50000, oldRebateLimit: 500000, oldMaxRebate: 12500,
      },
      "2026-27": {  // Budget 2026 — no change from 2025-26
        newSlabs: [
          { limit: 400000,  rate: 0  }, { limit: 800000,  rate: 5  },
          { limit: 1200000, rate: 10 }, { limit: 1600000, rate: 15 },
          { limit: 2000000, rate: 20 }, { limit: 2400000, rate: 25 }, { limit: Infinity, rate: 30 },
        ],
        newStdDed: 75000, newRebateLimit: 1200000, newMaxRebate: 60000,
        oldSlabs: {
          below60:    [{ limit: 250000, rate: 0 }, { limit: 500000, rate: 5 }, { limit: 1000000, rate: 20 }, { limit: Infinity, rate: 30 }],
          senior:     [{ limit: 300000, rate: 0 }, { limit: 500000, rate: 5 }, { limit: 1000000, rate: 20 }, { limit: Infinity, rate: 30 }],
          superSenior:[{ limit: 500000, rate: 0 }, { limit: 1000000, rate: 20 }, { limit: Infinity, rate: 30 }],
        },
        oldStdDed: 50000, oldRebateLimit: 500000, oldMaxRebate: 12500,
      },
    };

    const fyData = TAX_DATA[fy];

    // Slab tax helper
    const slabTax = (amount, slabs) => {
      let tax = 0, prev = 0;
      for (const slab of slabs) {
        if (amount > prev) {
          tax += (Math.min(amount, slab.limit) - prev) * (slab.rate / 100);
          prev = slab.limit;
        }
      }
      return tax;
    };

    // Rebate helper — u/s 87A: rebate = min(tax, maxRebate) if income ≤ limit
    const applyRebate = (tax, taxableIncome, rebateLimit, maxRebate) => {
      if (taxableIncome <= rebateLimit) return Math.max(0, tax - Math.min(tax, maxRebate));
      return tax;
    };

    // Marginal relief: tax should not exceed (income - rebateLimit)
    const applyMarginalRelief = (tax, taxableIncome, rebateLimit) => {
      if (taxableIncome > rebateLimit) {
        return Math.min(tax, taxableIncome - rebateLimit);
      }
      return tax;
    };

    // ── NEW REGIME ────────────────────────────────────────────────────────────
    const newTaxable = Math.max(0, income - fyData.newStdDed);
    let newSlab = slabTax(newTaxable, fyData.newSlabs);
    newSlab = applyRebate(newSlab, newTaxable, fyData.newRebateLimit, fyData.newMaxRebate);
    newSlab = applyMarginalRelief(newSlab, newTaxable, fyData.newRebateLimit);
    const newTax = Math.round(newSlab * 1.04);

    // ── OLD REGIME ────────────────────────────────────────────────────────────
    const oldTaxable = Math.max(0, income - deductions - fyData.oldStdDed);
    const ageKey = fyData.oldSlabs[ageGroup] ? ageGroup : "below60";
    let oldSlab = slabTax(oldTaxable, fyData.oldSlabs[ageKey]);
    oldSlab = applyRebate(oldSlab, oldTaxable, fyData.oldRebateLimit, fyData.oldMaxRebate);
    const oldTax = Math.round(oldSlab * 1.04);

    await TaxRecord.create({
      userEmail: user.email,
      income,
      deductions,
      oldTax,
      newTax,
      financialYear: fy,
    });


    res.json({
      income,
      deductions: deductions + fyData.oldStdDed,
      financialYear: fy,
      newTaxableIncome: newTaxable,
      oldTaxableIncome: oldTaxable,
      newTax: newTax,
      oldTax: oldTax,
      betterOption: newTax < oldTax ? "New Regime" : "Old Regime",

    });

  } catch (error) {
    console.error("Tax calculation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/tax/save
 * @desc    Manually save a tax calculation record (e.g., from frontend calculators or AI Extractors)
 * @access  Private
 */
router.post("/save", auth, async (req, res) => {
  try {
    const { income, deductions, oldTax, newTax } = req.body;

    if (income === undefined || deductions === undefined || oldTax === undefined || newTax === undefined) {
      return res.status(400).json({ message: "Income, deductions, oldTax, and newTax are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newRecord = await TaxRecord.create({
      userEmail: user.email,
      income,
      deductions,
      oldTax,
      newTax
    });

    res.status(201).json({ message: "Tax record saved successfully", record: newRecord });

  } catch (error) {
    console.error("Error saving tax record:", error);
    res.status(500).json({ message: "Server error while saving tax record" });
  }
});

/**
 * @route   GET /api/tax/history
 * @desc    Get tax calculation history of logged-in user
 * @access  Private
 */
router.get("/history", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const records = await TaxRecord.find({
      userEmail: user.email
    }).sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   DELETE /api/tax/history/:id
 * @desc    Delete a tax calculation record
 * @access  Private
 */
router.delete("/history/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const record = await TaxRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Ensure the record belongs to the user
    if (record.userEmail !== user.email) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await record.deleteOne();
    res.json({ message: "Record removed" });

  } catch (error) {
    console.error("Error deleting tax record:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
