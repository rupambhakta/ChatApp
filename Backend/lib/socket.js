const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const Message = require("../models/messageSchema");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on('chat message', async (msg) => {

    // Save message to DB
    const message = new Message(msg);
    const res = await message.save();
    
    // Emit to all clients
    io.emit('chat message', res);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[socket.id];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { io, app, server, getReceiverSocketId };
