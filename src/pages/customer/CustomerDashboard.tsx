import React, { useEffect, useState } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Design, Order } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { useCart } from '../../contexts/CartContext';

export function CustomerDashboard() {
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useCart();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [recommended, setRecommended] = useState<Design[]>([]);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const [ordersData, recommendedData, profileData] = await Promise.all([
          api.orders.getMyOrders(),
          api.designs.getAll({ limit: 3 }),
          api.users.getById(user.id)
        ]);
        setOrders(ordersData);
        setRecommended(recommendedData.designs);
        setCustomerProfile(profileData);
      } catch (error) {
        console.error('Failed to load customer dashboard data:', error);
        showToast('Failed to load dashboard metrics', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, showToast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
        <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 3);
  const activeLicensesCount = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fade-up animate-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Welcome back, {user?.name.split(' ')[0]} 👋</h2>
          <p className="text-sm text-on-surface-variant">Manage your orders, licenses, and discover new patterns.</p>
        </div>
        <Link 
          to="/marketplace"
          className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary transition-colors shadow-sm w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">explore</span>
          Browse Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard 
          title="Active Licenses" value={activeLicensesCount} icon="workspace_premium" trend="neutral" trendValue="All licenses valid"
          colorClass={{ bg: 'bg-primary-fixed', iconBg: 'bg-primary-fixed/50', iconText: 'text-primary' }}
        />
        <StatCard 
          title="Saved Patterns" value={wishlist.length} icon="favorite" trend="up" trendValue="In your wishlist"
          colorClass={{ bg: 'bg-error-container', iconBg: 'bg-error-container/50', iconText: 'text-error' }}
        />
        <StatCard 
          title="Reward Points" value="1,250" icon="stars" trend="up" trendValue="Gold membership tier"
          colorClass={{ bg: 'bg-secondary-fixed', iconBg: 'bg-secondary-container/20', iconText: 'text-secondary-container' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface/50">
            <h3 className="text-base font-bold text-primary">Recent Orders & Licenses</h3>
            <Link to="/customer/orders" className="text-sm font-semibold text-primary hover:underline">View All</Link>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-4">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">No purchases made yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg border border-outline-variant bg-surface-container-lowest">
                  <img src={order.designImage} alt={order.designTitle} className="w-12 h-12 rounded bg-surface-container object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-on-surface text-sm truncate">{order.designTitle}</h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{order.id} • {order.date}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block ${
                      order.status === 'completed' ? 'bg-primary-fixed text-primary' :
                      order.status === 'processing' ? 'bg-secondary-fixed text-secondary' :
                      'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {order.status}
                    </div>
                    <p className="text-xs font-semibold text-on-surface">${order.amount}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommended for You */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface/50">
            <h3 className="text-base font-bold text-primary">Recommended For You</h3>
            <Link to="/marketplace" className="text-sm font-semibold text-primary hover:underline">Explore</Link>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-4">
            {recommended.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">No designs available yet</p>
            ) : (
              recommended.map((design) => {
                const isSaved = wishlist.some(d => d.id === design.id);
                return (
                  <div key={design.id} className="flex items-center gap-4 p-3 rounded-lg border border-outline-variant bg-surface-container-lowest hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => navigate(`/design/${design.id}`)}>
                    <img src={design.image} alt={design.title} className="w-16 h-16 rounded-md object-cover bg-surface-container shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-on-surface text-sm truncate group-hover:text-primary transition-colors">{design.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">by {design.designerName}</p>
                      <p className="text-xs font-semibold text-primary-container mt-1">${design.price}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(design);
                      }}
                      className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary-fixed hover:text-primary transition-colors shrink-0"
                    >
                      <span className={`material-symbols-outlined text-[18px] ${isSaved ? 'filled text-error' : ''}`}>favorite</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
