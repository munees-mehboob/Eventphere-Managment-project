import mongoose from 'mongoose';
const expoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  theme: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  boothCount: { type: Number, default: 30 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
export default mongoose.model('Expo', expoSchema);
