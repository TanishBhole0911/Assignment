const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  date: { type: Date, required: true },
  verified: { type: Boolean, required: true }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
