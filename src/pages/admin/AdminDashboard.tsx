import React, { useEffect, useState } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
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
  const { showToast } = useNotification();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.users.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        showToast('Failed to load platform statistics', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Platform Revenue ($)',
        data: stats?.monthlyRevenue || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
        <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

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
          title="Total Users" value={stats.totalUsers} icon="group" trend="up" trendValue="+12% this month"
          colorClass={{ bg: 'bg-primary-fixed', iconBg: 'bg-primary-fixed/50', iconText: 'text-primary' }}
        />
        <StatCard 
          title="Total Sellers" value={stats.totalSellers} icon="storefront" trend="up" trendValue="+5% this month"
          colorClass={{ bg: 'bg-secondary-fixed', iconBg: 'bg-secondary-container/20', iconText: 'text-secondary-container' }}
        />
        <StatCard 
          title="Total Orders" value={stats.totalOrders} icon="how_to_reg" trend="neutral" trendValue="Stable this week"
          colorClass={{ bg: 'bg-tertiary-fixed', iconBg: 'bg-tertiary-container/20', iconText: 'text-tertiary-container' }}
        />
        <StatCard 
          title="Platform Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon="payments" trend="up" trendValue="+22% vs last month"
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
          <h3 className="text-base font-bold text-primary mb-5">Quick Actions</h3>
          <div className="space-y-3 flex-1">
            <a href="/admin/inventory" className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant hover:border-primary transition-all bg-surface-container-lowest">
              <span className="material-symbols-outlined text-[24px] text-primary">pending_actions</span>
              <div className="text-left">
                <p className="text-sm font-bold text-on-surface">Pending Approvals</p>
                <p className="text-xs text-on-surface-variant">Review new design submissions</p>
              </div>
            </a>
            <a href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant hover:border-primary transition-all bg-surface-container-lowest">
              <span className="material-symbols-outlined text-[24px] text-secondary">group</span>
              <div className="text-left">
                <p className="text-sm font-bold text-on-surface">Manage Users</p>
                <p className="text-xs text-on-surface-variant">Suspend, activate, or view members</p>
              </div>
            </a>
            <a href="/admin/analytics" className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant hover:border-primary transition-all bg-surface-container-lowest">
              <span className="material-symbols-outlined text-[24px] text-tertiary">analytics</span>
              <div className="text-left">
                <p className="text-sm font-bold text-on-surface">Detailed Analytics</p>
                <p className="text-xs text-on-surface-variant">Platform orders and user growth reports</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
