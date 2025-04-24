import express from "express";
import University from "../models/university.model.js";

const router = express.Router();

// Add a university
router.post("/", async (req, res) => {
  try {
    const { name, location, website } = req.body;
    const newUniversity = new University({ name, location, website });
    await newUniversity.save();
    res.status(201).json(newUniversity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all universities
router.get("/", async (req, res) => {
  try {
    const universities = await University.find();
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
