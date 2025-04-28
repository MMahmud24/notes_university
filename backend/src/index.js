import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";

import AuthRoutes from "./routes/auth.route.js";
import UniversityRoutes from "./routes/university.route.js";
import ClassRoutes from "./routes/class.route.js";
import NotesRoutes from "./routes/notes.route.js";
import commentRoutes from "./routes/comment.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


app.use("/api/auth", AuthRoutes);
app.use("/api/universities", UniversityRoutes);
app.use("/api/classes", ClassRoutes);
app.use("/api/notes", NotesRoutes);
app.use("/api/comments", commentRoutes);

app.listen(port, () => {
    console.log("Server is running on port 5001");
    connectDB();
});