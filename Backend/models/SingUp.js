const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    emailId: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String },

    emailVerified: { type: Boolean, default: false },
    otpHash: { type: String },
    otpExpires: { type: Date },
    lastOtpSentAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("NexTalk", userSchema);
