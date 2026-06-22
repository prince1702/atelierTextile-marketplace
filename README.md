# AtelierTextile Marketplace

A premium, full-stack B2B textile design marketplace where designers list patterns and buyers purchase commercial print/digital licenses.

*   **Frontend:** React 19 + TypeScript + Vite + TailwindCSS
*   **Backend:** Node.js + Express + MongoDB + Mongoose + JWT + Cloudinary

---

## 🧱 Features & Integration

*   **API Client Layer:** Real API integration via Axios interceptors in [src/services/api.ts](file:///c:/Users/princ/OneDrive/Desktop/textile/src/services/api.ts). Handles automatic JWT headers, Mongo `_id` normalizations, and loading/empty states.
*   **Complete Role Flows:** All routes wired to live database collections (`/api/auth`, `/api/designs`, `/api/cart`, `/api/wishlist`, `/api/orders`, `/api/users`, `/api/tickets`).
*   **Decoupled State:** Mock data layer is completely replaced, and TypeScript interfaces are isolated in [src/types/index.ts](file:///c:/Users/princ/OneDrive/Desktop/textile/src/types/index.ts).

---

## 📁 Project Structure

```
textile/
├── src/                         # React Frontend
│   ├── components/layout/       # Navbar, Footer, PortalLayout
│   ├── components/ui/           # DesignCard, StatCard
│   ├── contexts/                # AuthContext, CartContext, NotificationContext
│   ├── pages/                   # admin, seller, customer, public, auth, shared
│   ├── services/api.ts          # Axios API communication
│   └── types/index.ts           # Type definitions
│
└── atelierTextile-backend/      # Express REST API
    ├── config/                  # DB + Cloudinary configurations
    ├── controllers/             # Endpoint controllers
    ├── middleware/              # Auth, roles, uploads, error handlers
    ├── models/                  # Mongo schemas
    ├── routes/                  # Express routing
    ├── seeder.js                # Database seeder
    └── server.js                # Server entry point
```

---

## ⚡ Local Setup

### 1. Database & Backend
Ensure MongoDB is running locally.

```bash
cd atelierTextile-backend
npm install
cp .env.example .env    # Configure local variables (PORT, MONGODB_URI, JWT_SECRET)
npm run seed            # Seeds MongoDB with demo accounts & initial designs
npm run dev             # Launches API server at http://localhost:5000
```

### 2. Frontend
Start the React development server.

```bash
# In the root project directory
npm install
npm run dev             # Runs Vite dev server at http://localhost:5173
```

---

## 🧪 E2E API Test Suite

A programmatic integration test suite is included in the backend directory to verify all three role flows end-to-end against MongoDB:

```bash
cd atelierTextile-backend
node test-api.js
```

**Test checklist verified:**
*   **Customer:** Login → Profile → Wishlist toggle → Cart addition → Order checkout ($1,100) → Raise support ticket → Logout.
*   **Seller:** Login → Design upload with safe upload fallback → Listings fetch → Logout.
*   **Admin:** Login → Platform stats → Approve pending design → Suspend customer account → Verify suspended customer login block → Re-activate customer account.

---

## 🔑 Demo Accounts (Seeded)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@atelier.com` | `admin123` |
| **Seller** | `seller@atelier.com` | `seller123` |
| **Customer** | `customer@atelier.com` | `customer123` |

---

## 📦 Deployment

### Railway Backend Deployment
1. Connect your Railway account to the repository.
2. Deploy the `atelierTextile-backend/` subfolder.
3. Configure the following environment variables:
   *   `PORT=5000`
   *   `MONGODB_URI` (Atlas connection string)
   *   `JWT_SECRET` (Secure JWT key)
   *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   *   `FRONTEND_URL` (Deployed frontend URL)
4. Execute `npm run seed` against the Atlas database to import initial data.

### Vercel Frontend Deployment
1. Import the root repository directory to Vercel (automatically builds React/Vite assets based on `vercel.json`).
2. Add environment variable:
   *   `VITE_API_URL` (Point to your live Railway backend URL, e.g. `https://xxx.up.railway.app`).
3. Ensure the backend CORS origin allows requests from the deployed Vercel domain.
