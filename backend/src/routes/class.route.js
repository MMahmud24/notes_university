import express from "express";
import Class from "../models/class.model.js";

const router = express.Router();

// Add a class
router.post("/", async (req, res) => {
  try {
    const { university, name, courseCode, professor } = req.body;
    const newClass = new Class({ university, name, courseCode, professor });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all classes for a university
router.get("/:universityId", async (req, res) => {
  try {
    const classes = await Class.find({ university: req.params.universityId });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
