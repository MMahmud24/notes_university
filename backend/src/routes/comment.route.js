import express from "express";
import Comment from "../models/comment.model.js";
import jwt from "jsonwebtoken";


const router = express.Router();

const verifyToken2 = (req, res, next) => {
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

// 🔹 Create a comment or reply
router.post("/", verifyToken2, async (req, res) => {
  const { noteId, text, parentComment, repliedToUser } = req.body;

  try {
    const comment = new Comment({
      note: noteId,
      author: req.userId,
      text,
      parentComment: parentComment || null,
      repliedToUser: repliedToUser || null,
    });

    await comment.save();
    await comment.populate("author", "name");
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Failed to post comment" });
  }
});

// 🔹 Get all comments for a note (flat list)
router.get("/:noteId", async (req, res) => {
  try {
    const comments = await Comment.find({ note: req.params.noteId })
      .populate("author", "name")
      .populate("repliedToUser", "name")
      .sort({ createdAt: 1 }); // oldest to newest

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

//delete comment
router.delete("/:commentId", verifyToken2, async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

export default router;
