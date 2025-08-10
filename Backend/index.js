const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const User = require("./models/SingUp");
const Message = require("./models/messageSchema");
const { io, getReceiverSocketId, server, app } = require("./lib/socket");
const PORT = process.env.PORT;
const frontEndUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const cloudinary = require("./lib/cloudinary");

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});
const MONGO = process.env.MONGO_URI;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

app.use(express.json({ limit: '7mb' }));
app.use(express.urlencoded({ extended: true, limit: '7mb' }));
app.use(
  cors({
    origin: [frontEndUrl],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
    credentials: true,
  })
);

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

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
    expiresIn: "7d",
  });

  // Convert to plain object and remove password
  const userInfo = user.toObject();
  delete userInfo.password;

  res.json({ NexTalktoken, user: userInfo });
});

app.post("/admin/login", async (req, res) => {
  const { userName, password } = req.body;
  const adminUserName = "rupamBhakta";
  const adminPassword = "rupamBhakta009@";
  if (userName != adminUserName || password != adminPassword) {
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
app.get("/users", verifyToken, async (req, res) => {
  try {
    const searchTerm = req.query.search;
    const myId = req.user.userId;

    let query = {};
    if (searchTerm) {
      query = {
        userName: { $regex: searchTerm, $options: "i" }, // Case-insensitive match
        _id: { $ne: myId }, // Exclude current user
      };
    } else {
      query = { _id: { $ne: myId } }; // Exclude current user
    }

    const users = await User.find(query, "userName createdAt profileImage");

    const result = users.map((user) => ({
      userId: user._id,
      userName: user.userName,
      date: user.createdAt,
      image: user.profileImage,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.put("/user", verifyToken, async (req, res) => {
  try {
    const { image } = req.body;
    const userId = req.user.userId;

    if (!image) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    // Validate base64 image size (5MB)
    const base64Size = Buffer.from(image.split(',')[1], 'base64').length;
    if (base64Size > 5 * 1024 * 1024) { // 5MB limit
      return res.status(413).json({ message: "Image size must be less than 5MB" });
    }

    // Upload to Cloudinary with optimization
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'profile_images',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    // Update user with the image URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: uploadResponse.secure_url },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error in update profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error uploading image",
      error: error.message 
    });
  }
});

// Serve images statically
app.use("/images", express.static("images"));

// Protected route example that uses token verification
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
  });
});

app.get("/api/messages/:id", verifyToken, async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user.userId;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/last-messages", verifyToken, async (req, res) => {
  try {
    const myId = req.user.userId;
    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(myId) },
            { receiverId: new mongoose.Types.ObjectId(myId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(myId)] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" },
      },
    ]);

    res.status(200).json(lastMessages);
  } catch (error) {
    console.error("Error in getLastMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/mark-visited/:userId", verifyToken, async (req, res) => {
  try {
    const myId = req.user.userId;
    const selectedUserId = req.params.userId;

    // Update ALL unvisited messages from the selected user to the current user
    const result = await Message.updateMany(
      { 
        senderId: selectedUserId, 
        receiverId: myId, 
        visited: false 
      },
      { 
        $set: { visited: true } 
      }
    );

    res.status(200).json({ 
      message: "Messages marked as visited",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking messages as visited:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
