import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }]
});

export default mongoose.model('User', UserSchema);
