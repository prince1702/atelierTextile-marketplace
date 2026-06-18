import React from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { users, orders, monthlyRevenue, months } from '../../data/mockData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export function AdminDashboard() {
  const { user } = useAuth();

  const chartData = {
    labels: months.slice(0, 6),
    datasets: [
      {
        label: 'Revenue ($)',
        data: monthlyRevenue.slice(0, 6),
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#1e3a8a',
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { tooltip: { mode: 'index' as const, intersect: false } },
    scales: {
      y: { grid: { color: '#e9edff' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Welcome back, {user?.name.split(' ')[0]} 👋</h2>
          <p className="text-sm text-on-surface-variant">Here is the latest data for the Atelier Textile Marketplace.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-outline-variant rounded-lg px-4 py-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calendar_today</span>
          <span className="text-sm font-semibold text-on-surface">June 2024</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Users" value="12,450" icon="group" trend="up" trendValue="+12% this month"
          colorClass={{ bg: 'bg-primary-fixed', iconBg: 'bg-primary-fixed/50', iconText: 'text-primary' }}
        />
        <StatCard 
          title="Total Sellers" value="842" icon="storefront" trend="up" trendValue="+5% this month"
          colorClass={{ bg: 'bg-secondary-fixed', iconBg: 'bg-secondary-container/20', iconText: 'text-secondary-container' }}
        />
        <StatCard 
          title="Active Accounts" value="8,921" icon="how_to_reg" trend="neutral" trendValue="Stable this week"
          colorClass={{ bg: 'bg-tertiary-fixed', iconBg: 'bg-tertiary-container/20', iconText: 'text-tertiary-container' }}
        />
        <StatCard 
          title="Revenue (MTD)" value="$84K" icon="payments" trend="up" trendValue="+22% vs last month"
          colorClass={{ bg: 'bg-surface-variant', iconBg: 'bg-surface-variant', iconText: 'text-on-surface-variant' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface/50">
            <h3 className="text-base font-bold text-primary">Revenue Overview</h3>
          </div>
          <div className="p-6 flex-1 min-h-[300px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-base font-bold text-primary mb-5">Recent Activity</h3>
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">publish</span>
              </div>
              <div className="flex-1 bg-surface-container-low rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-primary">New Pattern</span>
                  <span className="text-[10px] text-on-surface-variant">2m ago</span>
                </div>
                <p className="text-xs text-on-surface-variant">Studio Nord uploaded 'Summer Silk Wave'</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary-container shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
              </div>
              <div className="flex-1 bg-surface-container-low rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-primary">Order Placed</span>
                  <span className="text-[10px] text-on-surface-variant">1h ago</span>
                </div>
                <p className="text-xs text-on-surface-variant">Order #8492 fulfilled by ThreadCo</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-error shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">report</span>
              </div>
              <div className="flex-1 bg-surface-container-low rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-error">IP Flag</span>
                  <span className="text-[10px] text-on-surface-variant">5h ago</span>
                </div>
                <p className="text-xs text-on-surface-variant">Pattern #2234 flagged for review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
