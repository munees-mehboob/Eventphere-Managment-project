import { Router } from 'express';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Expo from '../models/Expo.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET all genuine reviews (Public)
router.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (e) {
    next(e);
  }
});

// Check if current user is eligible to write a review & return their confirmed expos (Protected)
router.get('/can-review', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'attendee') {
      return res.json({ success: true, canReview: false, confirmedExpos: [] });
    }
    const confirmedBookings = await Booking.find({ user: req.user._id, status: 'confirmed' }).populate('expo', 'title');
    const confirmedExpos = [];
    const seen = new Set();
    for (const b of confirmedBookings) {
      if (b.expo && !seen.has(b.expo._id.toString())) {
        seen.add(b.expo._id.toString());
        confirmedExpos.push({ id: b.expo._id, title: b.expo.title });
      }
    }
    res.json({ success: true, canReview: confirmedExpos.length > 0, confirmedExpos });
  } catch (e) {
    next(e);
  }
});

// POST new review (Protected - Attendees with confirmed bookings ONLY)
router.post('/', protect, async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== 'attendee') {
      return res.status(403).json({
        success: false,
        message: 'Reviews are reserved strictly for attendees with confirmed bookings.'
      });
    }

    const { rating, comment, expoId } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Review comment is required' });
    }

    let targetExpo = null;
    if (expoId) {
      const hasBooking = await Booking.exists({ user: req.user._id, expo: expoId, status: 'confirmed' });
      if (!hasBooking) {
        return res.status(403).json({
          success: false,
          message: 'You can only review an event for which you hold an active confirmed reservation. Cancelled events cannot be reviewed.'
        });
      }
      targetExpo = await Expo.findById(expoId);
    } else {
      const anyConfirmed = await Booking.findOne({ user: req.user._id, status: 'confirmed' }).populate('expo');
      if (!anyConfirmed || !anyConfirmed.expo) {
        return res.status(403).json({
          success: false,
          message: 'You must have at least one confirmed event booking to submit a review.'
        });
      }
      targetExpo = anyConfirmed.expo;
    }

    const numRating = Number(rating) || 5;
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: 'attendee',
      roleTag: 'Verified Attendee',
      expo: targetExpo?._id,
      expoTitle: targetExpo?.title || 'Confirmed Expo',
      rating: numRating,
      comment: comment.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your attendee review has been published.',
      data: review
    });
  } catch (e) {
    next(e);
  }
});

export default router;
