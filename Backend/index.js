const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
require("dotenv").config();
const User = require("./models/SingUp")
const app = express();
const PORT =  5080;
const MONGO = "mongodb://localhost:27017/contactdb";

app.use(express.json());
app.use(cors());

mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Simple route to check server
app.get('/', (req, res) => {
  res.send('Contact Search API is running');
});

app.post('/signup', async (req, res) => {
  try {
    const { userName, emailId, mobileNumber,password } = req.body;
    if (!userName || !emailId || !mobileNumber ||!password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newUser = new User({ userName, emailId, mobileNumber,password });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});




app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});