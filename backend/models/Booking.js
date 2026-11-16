import mongoose from 'mongoose';
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expo: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  ticketType: { type: String, enum: ['General', 'VIP', 'Student'], default: 'General' },
  quantity: { type: Number, default: 1, min: 1, max: 10 },
  total: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['online', 'venue'], default: 'venue' },
  paymentProvider: { type: String, enum: ['card', 'easypaisa', 'jazzcash', 'venue', 'none'], default: 'venue' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'refund_pending', 'refunded', 'cancelled'], default: 'pending' },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  cancellationMessage: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Booking', bookingSchema);
