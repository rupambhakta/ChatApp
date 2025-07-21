const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const User = require("./models/SingUp");
const app = express();
const PORT = 5080;

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});
const MONGO = "mongodb://localhost:27017/contactdb";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

app.use(express.json());
app.use(cors());

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

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
  const NexTalktoken = jwt.sign({ userId: user._id }, "secret", {
    expiresIn: "1h",
  });
  res.json({ NexTalktoken });
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

// Get all users
app.get("/users", async (req, res) => {
   try {
    const users = await User.find({}, 'userName createdAt profileImage');
    const result = users.map(user => ({
      userName: user.userName,
      date: user.createdAt,
      image: user.profileImage
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.put("/user", verifyToken, upload.single('profileImage'), async(req, res) => {
  const fs = require('fs');
  try {
    const userId = req.user.userId;
    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create update object
    const updateData = {};

    // If there's a file, delete the old image if it exists
    if (req.file) {
      if (user.profileImage) {
        const oldImagePath = user.profileImage.startsWith('/') ? user.profileImage.slice(1) : user.profileImage;
        const fullPath = require('path').join(__dirname, oldImagePath);
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error('Error deleting old image:', err.message);
          }
        });
      }
      updateData.profileImage = `/images/${req.file.filename}`;
    }

    // Add any other fields from req.body to updateData
    if (req.body.userName) updateData.userName = req.body.userName;
    if (req.body.emailId) updateData.emailId = req.body.emailId;
    if (req.body.mobileNumber) updateData.mobileNumber = req.body.mobileNumber;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// Serve images statically
app.use('/images', express.static('images'));

// Protected route example that uses token verification
app.get("/protected", verifyToken, (req, res) => {
  res.json({ 
    message: "This is a protected route",
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
