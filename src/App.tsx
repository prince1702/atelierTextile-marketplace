import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { PortalLayout } from './components/layout/PortalLayout';

// Public Pages
import { Landing } from './pages/public/Landing';
import { Marketplace } from './pages/public/Marketplace';
import { DesignDetail } from './pages/public/DesignDetail';
import { CartPage } from './pages/public/CartPage';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Admin Portal
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { InventoryPage } from './pages/admin/InventoryPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';

// Seller Portal
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { DesignsPage } from './pages/seller/DesignsPage';
import { UploadPage } from './pages/seller/UploadPage';
import { SalesPage } from './pages/seller/SalesPage';

// Customer Portal
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { WishlistPage } from './pages/customer/WishlistPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { RewardsPage } from './pages/customer/RewardsPage';
import { SupportPage } from './pages/customer/SupportPage';

// Shared Portal
import { Profile } from './pages/shared/Profile';

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <PortalLayout>{children}</PortalLayout>;
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Marketplace />} />
                <Route path="/marketplace" element={<Navigate to="/" replace />} />
                <Route path="/design/:id" element={<DesignDetail />} />
                <Route path="/cart" element={<CartPage />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Seller Routes */}
              <Route path="/seller/*" element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <Routes>
                    <Route path="dashboard" element={<SellerDashboard />} />
                    <Route path="designs" element={<DesignsPage />} />
                    <Route path="upload" element={<UploadPage />} />
                    <Route path="sales" element={<SalesPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Customer Routes */}
              <Route path="/customer/*" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Routes>
                    <Route path="dashboard" element={<CustomerDashboard />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="rewards" element={<RewardsPage />} />
                    <Route path="support" element={<SupportPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Shared Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
