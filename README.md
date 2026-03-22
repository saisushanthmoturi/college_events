# College Event Management System

A comprehensive, full-stack platform designed to help students discover, register for, and manage college events and clubs.



## ✨ Features

### For Students (Participants)
- **Event Discovery:** Browse and search for events by category, date, and club.
- **Club Joining:** Apply to join clubs with a formal application form.
- **Seamless Registration:** Register for both free and paid events.
- **Payment Integration:** Secure payments via Razorpay for ticketed events.
- **Personal Dashboard:** Track your registered events and club statuses.

### For Club Leaders (Presidents & VPs)
- **Club Management:** Review and approve/reject member join requests.
- **Event Creation:** Create, edit, and manage events specifically for your club.
- **Admin Dashboard:** Access analytics and management tools for your specific club activities.

### For Super Admins
- **Full Control:** Manage all users, clubs, and events across the platform.
- **Platform Analytics:** View global statistics on user growth and event participation.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, React Bootstrap, Framer Motion, Axios.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (Mongoose).
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control.
- **Image Hosting:** Cloudinary (Dynamic switching enabled).
- **Payments:** Razorpay API.
- **Deployment:** Vercel (Serverless Functions).

## 📦 Installation & Local Setup

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for image uploads)

### 2. Clone the Repository
```bash
git clone https://github.com/saisushanthmoturi/college_events.git
cd college_events
```

### 3. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` folder:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Run the seed script to populate initial data:
```bash
node seed.js
```
Start the server:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` folder:
```env
VITE_API_URL=http://localhost:5001/api
```
Start the frontend:
```bash
npm run dev
```

## 🛡️ License
Distributed under the MIT License.
