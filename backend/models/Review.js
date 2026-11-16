import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['attendee', 'organizer', 'exhibitor'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  roleTag: {
    type: String,
    default: 'Verified User'
  },
  expo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo'
  },
  expoTitle: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Review', reviewSchema);

