import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Activity from "./models/Activity.js";
import { authenticateToken } from './middleware/authMiddleware.js'; 

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

console.log("MONGODB_URI:", process.env.MONGODB_URI);

// mongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.error("MongoDB connection error:", error.message));

// middlewares
app.set("view engine", "ejs");
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.json());

// Serve HTML for login and registration
app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html")); // Ensure you serve the correct file
});

// Registration Route
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "An error occurred during registration." });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred during login." });
  }
});

//logout Route with Activity Logging
app.post("/logout", authenticateToken, async (req, res) => {
  try {
    const activity = new Activity({ userId: req.user.id, action: "logout", timestamp: new Date() });
    await activity.save();
    res.json({ message: "Logged out and activity recorded." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Error logging out." });
  }
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("send-location", (data) => {
    const { latitude, longitude, token } = data;

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        io.emit("receive-location", { id: socket.id, latitude, longitude });
      }
    });
  });

  socket.on("disconnect", () => {
    io.emit("user-disconnected", socket.id);
    console.log("A user disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 1111;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
