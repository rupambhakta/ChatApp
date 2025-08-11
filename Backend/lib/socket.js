const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const Message = require("../models/messageSchema");
const app = express();
const server = http.createServer(app);
const frontEndUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: [frontEndUrl],
  },
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setup", (userId) => {
    // Remove old socket ID for this user if exists (prevents duplicates)
    Object.keys(userSocketMap).forEach(key => {
      if (userSocketMap[key] === socket.id) {
        delete userSocketMap[key];
      }
    });
    
    // Set new socket ID for this user
    userSocketMap[userId] = socket.id;
    socket.userId = userId;
    
    console.log(`User ${userId} connected with socket ${socket.id}`);
    console.log("Current online users:", Object.keys(userSocketMap));
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on('chat message', async (msg) => {
    try {
      // Save message to DB (this always happens)
      const message = new Message(msg);
      const savedMessage = await message.save();
      
      // Get receiver's socket ID
      const receiverSocketId = getReceiverSocketId(msg.receiverId);
      
      console.log(`Message from ${msg.senderId} to ${msg.receiverId}`);
      console.log(`Receiver socket ID: ${receiverSocketId}`);
      
      // Send to receiver only if they're online and different from sender
      if (receiverSocketId && receiverSocketId !== socket.id) {
        io.to(receiverSocketId).emit('chat message', savedMessage);
        console.log(`✅ Real-time delivery to ${msg.receiverId}`);
      } else if (!receiverSocketId) {
        console.log(`📱 User ${msg.receiverId} is offline - message saved to DB`);
      }
      
      // Send confirmation back to sender
      socket.emit('chat message', savedMessage);
      
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit('message error', { error: 'Failed to send message' });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    
    // Remove disconnected user from online users
    if (socket.userId) {
      delete userSocketMap[socket.userId];
      console.log(`User ${socket.userId} removed from online users`);
    }
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { io, app, server, getReceiverSocketId };