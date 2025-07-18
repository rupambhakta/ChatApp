const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    emailId: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    password: { type: String, required: true },
    // date: { type: Date, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
