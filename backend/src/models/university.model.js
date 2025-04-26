import mongoose from 'mongoose';

const UniversitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: false },
  website: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('University', UniversitySchema);
