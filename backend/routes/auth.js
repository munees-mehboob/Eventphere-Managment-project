import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }
    const safeRole = ['admin', 'organizer', 'exhibitor', 'attendee'].includes(role) ? role : 'attendee';
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      role: safeRole
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const normalizedEmail = (email || '').toLowerCase().trim();
    const rawPass = String(password || '');
    const trimmedPass = rawPass.trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let isMatch = await bcrypt.compare(rawPass, user.password);
    if (!isMatch && trimmedPass !== rawPass) {
      isMatch = await bcrypt.compare(trimmedPass, user.password);
    }

    // Flexible fallback for project demo accounts so presenters never get stuck:
    if (!isMatch) {
      if (normalizedEmail === 'admin@eventsphere.com' && ['@admin123', 'admin123', 'admin', '@Admin123', 'Admin123'].includes(trimmedPass)) {
        isMatch = true;
      } else if (normalizedEmail === 'ashmit@gmail.com' && trimmedPass.toLowerCase() === 'ashmit123') {
        isMatch = true;
      } else if (normalizedEmail === 'sohail@gmail.com' && trimmedPass.toLowerCase() === 'sohail123') {
        isMatch = true;
      } else if (normalizedEmail === 'faizan@gmail.com' && trimmedPass.toLowerCase() === 'faizan123') {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    next(e);
  }
});

export default router;
