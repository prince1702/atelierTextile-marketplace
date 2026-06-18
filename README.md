# AtelierTextile Marketplace

A full-stack premium textile design marketplace built with **React + TypeScript** (frontend) and **Node.js + Express + MongoDB** (backend).

## 🚀 Live Demo

- **Frontend:** Deployed on Vercel
- **Backend:** Deploy separately (Railway, Render, or MongoDB Atlas)

---

## 🧱 Tech Stack

### Frontend
- React 19 + TypeScript
- Vite + TailwindCSS
- React Router v7
- Chart.js + React Chart.js 2

### Backend (`atelierTextile-backend/`)
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (image uploads)
- Multer, bcryptjs, express-validator

---

## 📁 Project Structure

```
textile/
├── src/                         # Frontend source
│   ├── components/
│   │   ├── layout/              # Navbar, Footer, PortalLayout
│   │   └── ui/                  # DesignCard, StatCard
│   ├── contexts/                # Auth, Cart, Notification
│   ├── pages/                   # admin, seller, customer, public, auth
│   ├── services/api.ts          # API abstraction layer
│   └── data/mockData.ts         # Mock data (replace with real API)
│
└── atelierTextile-backend/      # Backend API
    ├── config/                  # DB + Cloudinary config
    ├── controllers/             # Business logic
    ├── middleware/              # Auth, roles, upload, error handler
    ├── models/                  # Mongoose schemas
    ├── routes/                  # Express routes
    └── server.js                # Entry point
```

---

## ⚡ Getting Started

### Frontend

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

### Backend

```bash
cd atelierTextile-backend
npm install
cp .env.example .env    # Fill in your values
node seeder.js --import # Seed demo data
npm run dev
```

API runs on `http://localhost:5000`

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@atelier.com` | `admin123` |
| Seller | `seller@atelier.com` | `seller123` |
| Customer | `customer@atelier.com` | `customer123` |

---

## 🔑 Environment Variables

Copy `.env.example` in the backend folder and fill in:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/atelierTextile
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=http://localhost:5173
```

---

## 📦 API Endpoints

| Resource | Base Path | Description |
|----------|-----------|-------------|
| Auth | `/api/auth` | Register, Login, Profile |
| Designs | `/api/designs` | CRUD + Filters + Pagination |
| Users | `/api/users` | Admin Management + Stats |
| Orders | `/api/orders` | Placement + History |
| Cart | `/api/cart` | Add/Remove/Clear |
| Wishlist | `/api/wishlist` | Toggle Add/Remove |
| Tickets | `/api/tickets` | Support System |

---

## 🛡️ Role-Based Access

- **Admin:** Full platform control, user management, analytics
- **Seller:** Upload and manage designs, view own orders and sales
- **Customer:** Browse, wishlist, cart, purchase, support tickets
