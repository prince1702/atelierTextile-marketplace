import React, { useEffect, useState } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Design, Order } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';

export function SellerDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  
  const [designs, setDesigns] = useState<Design[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const [listingsData, salesData] = await Promise.all([
          api.designs.getMyListings(),
          api.orders.getSellerOrders()
        ]);
        setDesigns(listingsData);
        setSales(salesData);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard 
          title="Active Designs" value={activeDesignsCount} icon="palette" trend="up" trendValue={`${designs.length} designs total`}
          colorClass={{ bg: 'bg-secondary-fixed', iconBg: 'bg-secondary-container/20', iconText: 'text-secondary-container' }}
        />
        <StatCard 
          title="Pending Review" value={designs.filter(d => d.status === 'pending').length} icon="pending" trend="neutral" trendValue="Awaiting admin approval"
          colorClass={{ bg: 'bg-surface-variant', iconBg: 'bg-surface-variant', iconText: 'text-on-surface-variant' }}
        />
      </div>

      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col max-w-3xl">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface/50">
          <h3 className="text-base font-bold text-primary">Recent Designs</h3>
          <Link to="/seller/designs" className="text-sm font-semibold text-primary hover:underline">Portfolio</Link>
        </div>
        <div className="p-5 flex-1 flex flex-col gap-4">
          {designs.slice(0, 4).length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-6">No designs uploaded yet</p>
          ) : (
            designs.slice(0, 4).map((design) => (
              <div key={design.id} className="flex items-center gap-4 p-3 rounded-lg border border-outline-variant bg-surface-container-lowest hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => navigate(`/design/${design.id}`)}>
                <img src={design.image} alt={design.title} className="w-16 h-16 rounded-md object-cover bg-surface-container shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{design.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{design.category} • {design.subcategory}</p>
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
  );
}
