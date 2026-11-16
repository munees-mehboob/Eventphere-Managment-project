import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Expo from '../models/Expo.js';
import Exhibitor from '../models/Exhibitor.js';
import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();

// Only admin can access these routes
router.use(protect, allowRoles('admin'));

// GET stats for admin dashboard
router.get('/stats', async (_req, res, next) => {
  try {
    const [totalUsers, totalExpos, totalBookings, cancelledBookings, totalExhibitors, bookings, users] = await Promise.all([
      User.countDocuments(),
      Expo.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Exhibitor.countDocuments(),
      Booking.find({ status: 'confirmed' }),
      User.find()
    ]);

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total || 0), 0);
    const roleCounts = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalUsers,
        totalExpos,
        totalBookings,
        cancelledBookings,
        totalRevenue,
        totalExhibitors,
        roleCounts
      }
    });
  } catch (e) {
    next(e);
  }
});

// GET all users
router.get('/', async (_req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (e) {
    next(e);
  }
});

// POST create a user with any role
router.post('/', async (req, res, next) => {
  try {
    const { name, email, password, role = 'attendee' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const validRoles = ['admin', 'organizer', 'exhibitor', 'attendee'];
    const assignedRole = validRoles.includes(role) ? role : 'attendee';

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole
    });

    res.status(201).json({
      success: true,
      message: `User created with role "${assignedRole}"`,
      data: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    next(e);
  }
});

// PATCH update user role
router.patch('/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'organizer', 'exhibitor', 'attendee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Prevent admin from removing their own admin role to avoid lockout
    if (req.user._id.toString() === req.params.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot change your own admin role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Role updated successfully', data: user });
  } catch (e) {
    next(e);
  }
});

// DELETE user
router.delete('/:id', async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (e) {
    next(e);
  }
});

export default router;

