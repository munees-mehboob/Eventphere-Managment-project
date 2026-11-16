# EventSphere Management — MERN eProject

A responsive event and expo management starter built with React, Bootstrap, Express and MongoDB.

## Features
- Modern responsive homepage with event photography, categories and event search
- Event listing, event details and ticket booking flow
- User registration/login with hashed passwords and JWT authentication
- My Bookings page with cancellation
- Schedule page
- Exhibitor hub
- Organizer dashboard to create/delete expos
- Exhibitor application endpoints and session management endpoints
- Four sample expos are inserted automatically the first time the backend connects to an empty database

## Requirements
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection

## Setup (Windows / VS Code)
1. Extract this ZIP and open the `EventSphere-Management` folder in VS Code.
2. Open terminal in the project root and run:
   ```bash
   npm run install:all
   ```
3. Copy `backend/.env.example` to `backend/.env` and set values:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/eventsphere
   JWT_SECRET=replace_this_with_a_long_random_secret
   CLIENT_URL=http://localhost:5173
   ```
4. Start backend in terminal 1:
   ```bash
   npm run dev:backend
   ```
5. Start frontend in terminal 2:
   ```bash
   npm run dev:frontend
   ```
6. Open http://localhost:5173

## Organizer dashboard
Public registration intentionally allows only attendee and exhibitor roles. To enable the organizer dashboard for a test account, register normally, then in MongoDB Compass open database `eventsphere`, collection `users`, find that account and change its `role` field to `organizer`. Log out and log in again. The dashboard will then appear in navigation. Never expose organizer/admin role selection in public production registration.

## Demo ticket prices
General: Rs. 1,500 · VIP: Rs. 3,500 · Student: Rs. 800. This project records demo bookings only; it does not collect real payments.

## Notes
- Event images are loaded from Unsplash over the internet.
- Booking endpoints require login and save reservations in MongoDB.
- Organizer event creation/deletion requires an organizer/admin JWT.
- This is an educational eProject starter. Before production use, add payment gateway integration, email notifications, rate limiting, stronger validation, audit logs and deployment secrets management.
