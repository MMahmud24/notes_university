import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};


// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify token and return user
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Missing token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

//change password
router.post("/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId); 
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update password" });
  }
});

  //change name and email
router.put("/update-profile", authenticateToken, async (req, res) => {
    const { name, email } = req.body;
    try {
      const user = await User.findById(req.userId);
      if (name) user.name = name;
      if (email) user.email = email;
      await user.save();
      res.json({ message: "Profile updated", user });
    } catch (err) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  //save note
  router.post("/save-note", authenticateToken, async (req, res) => {
    const { noteId } = req.body;
    try {
      const user = await User.findById(req.userId);
      const index = user.savedNotes.indexOf(noteId);
  
      if (index === -1) {
        user.savedNotes.push(noteId);
        await user.save();
        return res.json({ message: "Note saved." });
      } else {
        user.savedNotes.splice(index, 1);
        await user.save();
        return res.json({ message: "Note unsaved." });
      }
    } catch (err) {
      res.status(500).json({ message: "Failed to save/unsave note" });
    }
  });

  //get saved notes
  router.get("/saved-notes", authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.userId).populate("savedNotes");
      res.json(user.savedNotes);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch saved notes" });
    }
  });

export default router;
