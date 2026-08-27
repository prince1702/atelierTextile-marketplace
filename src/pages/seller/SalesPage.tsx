import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Order } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export function SalesPage() {
  const [sales, setSales] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await api.orders.getSellerOrders();
        setSales(data);
      } catch (error) {
        console.error('Failed to fetch sales orders:', error);
        showToast('Failed to load sales orders', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, [showToast]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary-fixed text-primary';
      case 'processing': return 'bg-secondary-fixed text-secondary';
      case 'pending': return 'bg-surface-variant text-on-surface-variant';
      case 'refunded': return 'bg-error-container text-error';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const completedSales = sales.filter(s => s.status === 'completed');
  const totalGrossSales = completedSales.reduce((sum, s) => sum + s.amount, 0);
  const totalWalletEarnings = completedSales.reduce((sum, s) => sum + (s.sellerEarnings || Math.round(s.amount * 0.60)), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Sales Received & Wallet</h2>
          <p className="text-sm text-on-surface-variant">Monitor purchases made on your designs and your 60% wallet earnings.</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="material-symbols-outlined text-emerald-600 text-[22px]">account_balance_wallet</span>
          <div>
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Wallet Balance (60%)</p>
            <p className="text-lg font-bold text-emerald-900 leading-none">₹{totalWalletEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
            <span className="material-symbols-outlined text-[32px]">payments</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">No sales yet</h3>
          <p className="text-on-surface-variant mb-6">When customers purchase licenses for your patterns, they will be listed here.</p>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-4 px-6">Design details</th>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Buyer Name</th>
                  <th className="py-4 px-6">License Type</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Wallet Earned (60%)</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                {sales.map(sale => {
                  const earned60 = sale.sellerEarnings || Math.round(sale.amount * 0.60);
                  return (
                    <tr key={sale.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={sale.designImage} 
                            alt={sale.designTitle} 
                            className="w-10 h-10 rounded object-cover bg-surface-container shrink-0" 
                          />
                          <p className="font-semibold text-on-surface">{sale.designTitle}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">{sale.id}</td>
                      <td className="py-4 px-6 text-on-surface-variant">{sale.buyerName}</td>
                      <td className="py-4 px-6 font-medium text-on-surface-variant">{sale.licenseType}</td>
                      <td className="py-4 px-6 font-bold text-on-surface">₹{sale.amount.toLocaleString()}</td>
                      <td className="py-4 px-6 font-bold text-emerald-700">
                        {sale.status === 'completed' ? `₹${earned60.toLocaleString()}` : <span className="text-on-surface-variant font-normal">Pending</span>}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">{sale.date}</td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusClass(sale.status)}`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
