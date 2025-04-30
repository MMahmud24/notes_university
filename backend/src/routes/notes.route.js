import express from "express";
import multer from "multer";
import Note from "../models/notes.model.js";
import jwt from "jsonwebtoken";

//middleware
const verifyToken = (req, res, next) => {
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

const router = express.Router();

// Set up file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Upload a note
router.post("/", verifyToken, upload.single("note"), async (req, res) => {
  const { university, classId } = req.body;
  const noteURL = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

  const newNote = new Note({
    university,
    class: classId,
    uploadedBy: req.userId,
    noteURL,
    fileName: req.file.originalname
  });

  await newNote.save();
  res.status(201).json(newNote);
});

// Get all notes for a class
router.get("/:classId", async (req, res) => {
  try {
    const notes = await Note.find({ class: req.params.classId }).populate("uploadedBy", "name");
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

router.delete("/:noteId", verifyToken, async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this note" });
    }

    await note.deleteOne();
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete note" });
  }
});

// Vote on a note
router.patch("/:noteId/vote", verifyToken, async (req, res) => {
  const { voteType } = req.body; // "up" or "down"
  const userId = req.userId;

  if (!["up", "down"].includes(voteType)) {
    return res.status(400).json({ message: "Invalid vote type" });
  }

  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Remove user from both vote arrays to reset
    note.upvotes = note.upvotes.filter((id) => id.toString() !== userId);
    note.downvotes = note.downvotes.filter((id) => id.toString() !== userId);

    // Apply vote
    if (voteType === "up") {
      note.upvotes.push(userId);
    } else {
      note.downvotes.push(userId);
    }

    await note.save();
    await note.populate("uploadedBy", "name");

    res.json({
      message: "Vote recorded",
      upvotes: note.upvotes.length,
      downvotes: note.downvotes.length,
      note,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to register vote" });
  }
});

export default router;
