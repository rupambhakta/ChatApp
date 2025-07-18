const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/SingUp");
const app = express();
const PORT = 5080;
const MONGO = "mongodb://localhost:27017/contactdb";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

app.use(express.json());
app.use(cors());

mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Simple route to check server
app.get("/", (req, res) => {
  res.send("Contact Search API is running");
});

app.post("/signup", async (req, res) => {
  try {
    const { userName, emailId, mobileNumber, password } = req.body;
    if (!userName || !emailId || !mobileNumber || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    // Check if either email or mobile number already exists
    const user = await User.findOne({ $or: [{ emailId }, { mobileNumber }] });
    if (user) {
      return res.status(409).json({
        exists: true,
        message: "User already exists with this email or mobile number",
      });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      emailId,
      mobileNumber,
      password: hashed,
      date: Date.now(),
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  const user = await User.findOne({ userName });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ userId: user._id }, "secret", {
    expiresIn: "1h",
  });
  res.json({ token });
});

app.post("/admin/login", async (req, res) => {
  const { userName, password } = req.body;
  const adminUserName = "rupamBhakta";
  const adminPassword = "rupamBhakta009@"
  if (userName!=adminUserName || password!=adminPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const tokenForAdmin = jwt.sign({ userId: adminUserName }, "secret", {
    expiresIn: "1h",
  });
  res.json({ tokenForAdmin });
});

app.post("/admin/dashboard", async (req, res) => {
  const { startDate, endDate } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Create start and end of that day
  const startOfDay = new Date(start);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(end);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const users = await User.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    res.json(users);
    console.log("Hitting dashboard");
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
