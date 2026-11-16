import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import expoRoutes from './routes/expos.js';
import sessionRoutes from './routes/sessions.js';
import exhibitorRoutes from './routes/exhibitors.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/users.js';
import reviewRoutes from './routes/reviews.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req,res)=>res.json({success:true,message:'EventSphere API is running'}));
app.use('/api/auth', authRoutes);
app.use('/api/expos', expoRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/exhibitors', exhibitorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use((err,_req,res,_next)=>res.status(err.status || 500).json({success:false,message:err.message || 'Server error'}));
const port = process.env.PORT || 5000;
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) { console.error('Please set MONGO_URI and JWT_SECRET in backend/.env'); process.exit(1); }
 mongoose.connect(process.env.MONGO_URI).then(async()=>{
  // Seed / Verify Super Admin from .env credentials
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await User.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`[Admin] Initial Super Admin account created: ${adminEmail}`);
    } else if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log(`[Admin] Elevated ${adminEmail} to admin role`);
    }
  }

  app.listen(port,()=>console.log(`EventSphere API running at http://localhost:${port}`));
}).catch(err=>{console.error('MongoDB connection failed:',err.message);process.exit(1)});
