import React from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { designs, orders } from '../../data/mockData';
import { Link } from 'react-router-dom';

export function SellerDashboard() {
  const { user } = useAuth();

  // Filter mock data for this specific seller (simulated)
  const myDesigns = designs.slice(0, 3);
  const myRecentOrders = orders.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-up">
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
          title="Total Earnings" value="$42,800" icon="account_balance_wallet" trend="up" trendValue="+15% this month"
          colorClass={{ bg: 'bg-primary-fixed', iconBg: 'bg-primary-fixed/50', iconText: 'text-primary' }}
        />
        <StatCard 
          title="Active Designs" value="24" icon="palette" trend="up" trendValue="+2 this week"
          colorClass={{ bg: 'bg-secondary-fixed', iconBg: 'bg-secondary-container/20', iconText: 'text-secondary-container' }}
        />
        <StatCard 
          title="Total Sales" value="284" icon="receipt_long" trend="up" trendValue="+12 this month"
          colorClass={{ bg: 'bg-tertiary-fixed', iconBg: 'bg-tertiary-container/20', iconText: 'text-tertiary-container' }}
        />
        <StatCard 
          title="Avg Rating" value="4.8" icon="star" trend="neutral" trendValue="Based on 156 reviews"
          colorClass={{ bg: 'bg-surface-variant', iconBg: 'bg-surface-variant', iconText: 'text-on-surface-variant' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface/50">
            <h3 className="text-base font-bold text-primary">Recent Sales</h3>
            <button className="text-sm font-semibold text-primary hover:underline">View All</button>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
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
                {myRecentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-lowest">
                    <td className="py-3 px-5 font-medium text-on-surface">{order.id}</td>
                    <td className="py-3 px-5 text-on-surface-variant">{order.design}</td>
                    <td className="py-3 px-5 font-semibold text-primary-container">${order.amount}</td>
                    <td className="py-3 px-5 text-on-surface-variant">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Designs */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface/50">
            <h3 className="text-base font-bold text-primary">Top Performing Designs</h3>
            <button className="text-sm font-semibold text-primary hover:underline">Portfolio</button>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-4">
            {myDesigns.map((design) => (
              <div key={design.id} className="flex items-center gap-4 p-3 rounded-lg border border-outline-variant bg-surface-container-lowest hover:border-primary/30 transition-colors cursor-pointer group">
                <img src={design.image} alt={design.title} className="w-16 h-16 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{design.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{design.sales} sales • ${design.revenue.toLocaleString()} revenue</p>
                </div>
                <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded text-xs font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-[14px] text-secondary-container filled">star</span>
                  {design.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
