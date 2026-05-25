const mongoose = require("mongoose");

const TaxRecordSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      index: true
    },

    income: {
      type: Number,
      required: true
    },

    deductions: {
      type: Number,
      default: 0
    },

    oldTax: {
      type: Number,
      required: true
    },

    newTax: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true // creates createdAt & updatedAt automatically
  }
);

const { createFallbackProxy, FallbackTaxRecord } = require("./fallbackDb");
const RealTaxRecordModel = mongoose.model("TaxRecord", TaxRecordSchema);
module.exports = createFallbackProxy(RealTaxRecordModel, FallbackTaxRecord);
