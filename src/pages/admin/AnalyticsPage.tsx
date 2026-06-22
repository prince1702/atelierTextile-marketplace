import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler, Legend);

export function AnalyticsPage() {
  const { showToast } = useNotification();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.users.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch platform stats:', error);
        showToast('Failed to load stats', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const revenueData = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Revenue ($)',
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

  const volumeData = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Orders',
        data: stats?.monthlyOrders || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#fea619',
        borderRadius: 6,
      }
    ]
  };

  const usersData = {
    labels: months,
    datasets: [
      {
        label: 'Cumulative Users',
        data: stats?.monthlyUsers || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#00a36c',
        backgroundColor: 'rgba(0, 163, 108, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#00a36c',
        tension: 0.25,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false } 
    },
    scales: {
      y: { grid: { color: '#e9edff' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-1">Platform Analytics</h2>
        <p className="text-sm text-on-surface-variant">Visualize transaction volume, cumulative user growth, and marketplace revenue.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm">
              <h4 className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Total Revenue</h4>
              <p className="text-3xl font-bold text-primary mt-2">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm">
              <h4 className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Total Transactions</h4>
              <p className="text-3xl font-bold text-primary mt-2">{stats.totalOrders}</p>
            </div>
            <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm">
              <h4 className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Total Accounts</h4>
              <p className="text-3xl font-bold text-primary mt-2">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Revenue */}
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-6 flex flex-col h-[320px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-primary">Revenue Trends (12 Months)</h3>
                <span className="text-xs text-primary font-bold">USD ($)</span>
              </div>
              <div className="flex-1 relative min-h-0">
                <Line data={revenueData} options={chartOptions} />
              </div>
            </div>

            {/* Chart 2: Orders */}
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-6 flex flex-col h-[320px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-primary">Monthly Sales Volume</h3>
                <span className="text-xs text-secondary font-bold">Orders Count</span>
              </div>
              <div className="flex-1 relative min-h-0">
                <Bar data={volumeData} options={chartOptions} />
              </div>
            </div>

            {/* Chart 3: Users */}
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-6 flex flex-col lg:col-span-2 h-[320px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-primary">Cumulative User Registrations</h3>
                <span className="text-xs text-success font-bold">Accounts</span>
              </div>
              <div className="flex-1 relative min-h-0">
                <Line data={usersData} options={chartOptions} />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
