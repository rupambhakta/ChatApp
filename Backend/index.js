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
const nodemailer = require("nodemailer");

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

//For Email verification
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit string
}
async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: `"NexTalk" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your NexTalk verification code",
    text: `Your verification code is ${otp}. It will expire in 5 minutes.`,
  });
}


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
    const existing = await User.findOne({ $or: [{ emailId }, { mobileNumber }] });
    if (existing) {
      return res.status(409).json({
        exists: true,
        message: "User already exists with this email or mobile number",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // create OTP and hash it
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    const newUser = new User({
      userName,
      emailId,
      mobileNumber,
      password: hashedPassword,
      emailVerified: false,
      otpHash,
      otpExpires,
      lastOtpSentAt: Date.now(),
      date: Date.now(),
    });

    await newUser.save();

    // send OTP email (do not include OTP in response)
    await sendOtpEmail(emailId, otp);

    res.status(201).json({ message: "OTP sent to email", emailId: newUser.emailId });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { emailId, otp } = req.body;
    if (!emailId || !otp) return res.status(400).json({ message: "emailId and otp required" });

    const user = await User.findOne({ emailId });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.emailVerified) return res.status(400).json({ message: "Email already verified" });

    if (!user.otpHash || !user.otpExpires || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    const match = await bcrypt.compare(otp, user.otpHash);
    if (!match) return res.status(400).json({ message: "Invalid OTP" });

    user.emailVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.lastOtpSentAt = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/resend-otp", async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!emailId) return res.status(400).json({ message: "emailId required" });

    const user = await User.findOne({ emailId });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.emailVerified) return res.status(400).json({ message: "Email already verified" });

    // cooldown (e.g., 60 seconds)
    const now = Date.now();
    if (user.lastOtpSentAt && now - new Date(user.lastOtpSentAt).getTime() < 60 * 1000) {
      return res.status(429).json({ message: "Please wait before requesting a new OTP" });
    }

    const otp = generateOTP();
    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.lastOtpSentAt = Date.now();
    await user.save();

    await sendOtpEmail(emailId, otp);
    res.json({ message: "OTP resent" });
  } catch (err) {
    console.error("resend-otp error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



app.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  const user = await User.findOne({ userName });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (!user.emailVerified) {
    return res.status(403).json({ message: "Please verify your email before logging in" });
  }

  const NexTalktoken = jwt.sign({ userId: user._id }, "secret", { expiresIn: "7d" });
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
          // Count unread messages where I'm the receiver and message is unvisited
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", new mongoose.Types.ObjectId(myId)] },
                    { $eq: ["$visited", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        },
      },
      {
        $replaceRoot: { 
          newRoot: { 
            $mergeObjects: ["$lastMessage", { unreadCount: "$unreadCount" }] 
          } 
        },
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
