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

  socket.on("setup", (userId) => {
    userSocketMap[userId] = socket.id;
    socket.userId = userId;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on('chat message', async (msg) => {
    try {
      // Save message to DB
      const message = new Message(msg);
      const savedMessage = await message.save();
      
      // Emit to both sender and receiver
      io.to(getReceiverSocketId(msg.receiverId)).emit('chat message', savedMessage);
      socket.emit('chat message', savedMessage);
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[socket.userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { io, app, server, getReceiverSocketId };
