import {Router} from 'express';
import Booking from '../models/Booking.js';
import Expo from '../models/Expo.js';
import {protect, allowRoles} from '../middleware/auth.js';
const router=Router();

// GET all bookings (Admin & Organizer)
router.get('/', protect, allowRoles('admin', 'organizer'), async (req, res, next) => {
  try {
    const data = await Booking.find().populate('user', 'name email').populate('expo', 'title location date').sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// Admin & Organizer: Process & mark refund as completed
router.patch('/:id/refund', protect, allowRoles('admin', 'organizer'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'cancelled' || booking.paymentMethod !== 'online') {
      return res.status(400).json({ success: false, message: 'Only cancelled online bookings can be refunded.' });
    }
    booking.paymentStatus = 'refunded';
    booking.cancellationMessage = `Your refund of Rs. ${(booking.total || 0).toLocaleString()} has been processed and successfully returned to your original payment method (${(booking.paymentProvider || 'card').toUpperCase()}).`;
    await booking.save();
    res.json({ success: true, message: 'Refund marked as processed successfully', data: booking });
  } catch (e) {
    next(e);
  }
});
router.post('/', protect, async (req, res, next) => {
  try {
    if (req.user?.role !== 'attendee') {
      return res.status(403).json({
        success: false,
        message: 'Ticket reservation is restricted to Attendees only. Exhibitors can explore events and apply for booths in the Exhibitor Portal.'
      });
    }

    const { expo, ticketType = 'General', quantity = 1, paymentMethod = 'venue', paymentProvider = 'venue' } = req.body;
    if (!expo || !['General', 'VIP', 'Student'].includes(ticketType) || !Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 10) {
      return res.status(400).json({ success: false, message: 'Please select a valid event and ticket quantity (1-10).' });
    }
    const event = await Expo.findById(expo);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    // Check if user already has an active confirmed booking for this event
    const activeBooking = await Booking.findOne({ user: req.user._id, expo, status: 'confirmed' });
    if (activeBooking) {
      return res.status(409).json({ success: false, message: 'You already have an active confirmed booking for this event. Check My Bookings.' });
    }

    const prices = { General: 1500, VIP: 3500, Student: 800 };
    const total = prices[ticketType] * Number(quantity);
    const isOnline = paymentMethod === 'online';

    // Create a new booking document (preserves full history of cancelled/refunded records)
    const booking = await Booking.create({
      user: req.user._id,
      expo,
      ticketType,
      quantity: Number(quantity),
      total,
      paymentMethod: isOnline ? 'online' : 'venue',
      paymentProvider: isOnline ? (paymentProvider || 'card') : 'venue',
      paymentStatus: isOnline ? 'paid' : 'pending',
      status: 'confirmed',
      cancellationMessage: ''
    });
    
    const message = isOnline
      ? `Payment of Rs. ${total.toLocaleString()} successful via ${paymentProvider.toUpperCase()}! Booking confirmed.`
      : `Booking reserved! Please pay Rs. ${total.toLocaleString()} at the venue ticket counter on arrival.`;
      
    res.status(201).json({ success: true, message, data: booking });
  } catch (e) {
    next(e);
  }
});
router.get('/mine', protect, async (req, res, next) => {
  try {
    const data = await Booking.find({ user: req.user._id }).populate('expo').sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.patch('/:id/cancel', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id, status: 'confirmed' });
    if (!booking) return res.status(404).json({ success: false, message: 'Active booking not found' });
    
    booking.status = 'cancelled';
    
    let cancelMsg = '';
    if (booking.paymentMethod === 'online' && booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refund_pending';
      cancelMsg = `Your booking has been cancelled. Your online payment of Rs. ${booking.total.toLocaleString()} will be refunded to your original payment method within 24 hours.`;
    } else {
      booking.paymentStatus = 'cancelled';
      cancelMsg = 'Your booking has been cancelled successfully. Since you selected "Pay at Venue", no charges were deducted.';
    }
    
    booking.cancellationMessage = cancelMsg;
    await booking.save();
    
    res.json({
      success: true,
      message: cancelMsg,
      isOnlineRefund: booking.paymentMethod === 'online',
      data: booking
    });
  } catch (e) {
    next(e);
  }
});
export default router;
