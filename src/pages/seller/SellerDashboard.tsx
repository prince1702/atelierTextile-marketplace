import React, { useEffect, useState } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Design, Order } from '../../types';
import { Link } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';

export function SellerDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  const [designs, setDesigns] = useState<Design[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const [listingsData, salesData, profileData] = await Promise.all([
          api.designs.getMyListings(),
          api.orders.getSellerOrders(),
          api.users.getById(user.id)
        ]);
        setDesigns(listingsData);
        setSales(salesData);
        setSellerProfile(profileData);
      } catch (error) {
        console.error('Failed to load seller dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
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

  const activeDesignsCount = designs.filter(d => d.status === 'active').length;
  const topDesigns = [...designs]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);
  const recentSales = sales.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-up animate-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Seller Dashboard</h2>
          <p className="text-sm text-on-surface-variant">Overview of your design portfolio and recent sales.</p>
        </div>
        <Link 
          to="/seller/upload"
          className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary transition-colors shadow-sm w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Upload New Design
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Earnings" value={`$${(sellerProfile?.totalRevenue || 0).toLocaleString()}`} icon="account_balance_wallet" trend="up" trendValue="Accumulated total"
          colorClass={{ bg: 'bg-primary-fixed', iconBg: 'bg-primary-fixed/50', iconText: 'text-primary' }}
        />
        <StatCard 
          title="Active Designs" value={activeDesignsCount} icon="palette" trend="up" trendValue={`${designs.length} designs total`}
          colorClass={{ bg: 'bg-secondary-fixed', iconBg: 'bg-secondary-container/20', iconText: 'text-secondary-container' }}
        />
        <StatCard 
          title="Total Sales" value={sellerProfile?.totalOrders || 0} icon="receipt_long" trend="up" trendValue={`${sales.length} transactions`}
          colorClass={{ bg: 'bg-tertiary-fixed', iconBg: 'bg-tertiary-container/20', iconText: 'text-tertiary-container' }}
        />
        <StatCard 
          title="Pending Review" value={designs.filter(d => d.status === 'pending').length} icon="pending" trend="neutral" trendValue="Awaiting admin approval"
          colorClass={{ bg: 'bg-surface-variant', iconBg: 'bg-surface-variant', iconText: 'text-on-surface-variant' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface/50">
            <h3 className="text-base font-bold text-primary">Recent Sales</h3>
            <Link to="/seller/sales" className="text-sm font-semibold text-primary hover:underline">View All</Link>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
            {recentSales.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-10">No sales transactions found</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-xs text-on-surface-variant uppercase border-b border-outline-variant">
                  <tr>
                    <th className="py-3 px-5">Order ID</th>
                    <th className="py-3 px-5">Design</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {recentSales.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-lowest">
                      <td className="py-3 px-5 font-medium text-on-surface font-mono text-xs">{order.id}</td>
                      <td className="py-3 px-5 text-on-surface-variant">{order.designTitle}</td>
                      <td className="py-3 px-5 font-semibold text-primary-container">${order.amount}</td>
                      <td className="py-3 px-5 text-on-surface-variant">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Performing Designs */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface/50">
            <h3 className="text-base font-bold text-primary">Top Performing Designs</h3>
            <Link to="/seller/designs" className="text-sm font-semibold text-primary hover:underline">Portfolio</Link>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-4">
            {topDesigns.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">No designs uploaded yet</p>
            ) : (
              topDesigns.map((design) => (
                <div key={design.id} className="flex items-center gap-4 p-3 rounded-lg border border-outline-variant bg-surface-container-lowest hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => window.location.href=`/design/${design.id}`}>
                  <img src={design.image} alt={design.title} className="w-16 h-16 rounded-md object-cover bg-surface-container shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{design.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">{design.sales} sales • ${design.revenue.toLocaleString()} revenue</p>
                  </div>
                  <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded text-xs font-semibold text-on-surface">
                    <span className="material-symbols-outlined text-[14px] text-secondary-container filled">star</span>
                    {design.rating}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
