import { Router } from 'express';
import Exhibitor from '../models/Exhibitor.js';
import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();

router.post('/apply', protect, allowRoles('exhibitor'), async (req, res, next) => {
  try {
    const { expo, company, products, description, contact } = req.body;
    if (!expo || !company || !contact) {
      return res.status(400).json({ success: false, message: 'Expo, company name and contact number are required' });
    }
    const existing = await Exhibitor.findOne({ user: req.user._id, expo });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already submitted an application for this expo' });
    }
    const item = await Exhibitor.create({
      user: req.user._id,
      expo,
      company,
      products: products || '',
      description: description || '',
      contact
    });
    res.status(201).json({ success: true, message: 'Application submitted successfully', data: item });
  } catch (e) {
    next(e);
  }
});

router.get('/mine', protect, allowRoles('exhibitor'), async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await Exhibitor.find({ user: req.user._id })
        .populate('expo', 'title date location')
        .sort({ createdAt: -1 })
    });
  } catch (e) {
    next(e);
  }
});

router.get('/', protect, allowRoles('admin', 'organizer'), async (_req, res, next) => {
  try {
    res.json({
      success: true,
      data: await Exhibitor.find()
        .populate('user', 'name email')
        .populate('expo', 'title date location')
        .sort({ createdAt: -1 })
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/status', protect, allowRoles('admin', 'organizer'), async (req, res, next) => {
  try {
    const { status, booth } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const updateData = { status };
    if (booth !== undefined) {
      updateData.booth = String(booth).trim();
    }
    const item = await Exhibitor.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('user', 'name email')
      .populate('expo', 'title date location');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, message: 'Application updated successfully', data: item });
  } catch (e) {
    next(e);
  }
});

export default router;
