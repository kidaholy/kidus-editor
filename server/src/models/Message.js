import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: 'New project enquiry', trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    budget: { type: String, default: '', maxlength: 60 },
    read: { type: Boolean, default: false },
    emailed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
