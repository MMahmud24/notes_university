import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  name: { type: String, required: true },
  courseCode: { type: String, required: false },
  professor: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Class', ClassSchema);
