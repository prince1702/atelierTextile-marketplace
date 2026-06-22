import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Order } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.orders.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        showToast('Failed to load orders', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [showToast]);

  const handleDownload = (designTitle: string) => {
    showToast(`Initializing secure download for: ${designTitle}`, 'success');
    setTimeout(() => {
      showToast(`Downloaded high-res file package for ${designTitle}!`, 'success');
    }, 1500);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary-fixed text-primary';
      case 'processing': return 'bg-secondary-fixed text-secondary';
      case 'pending': return 'bg-surface-variant text-on-surface-variant';
      case 'refunded': return 'bg-error-container text-error';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-1">My Orders & Licenses</h2>
        <p className="text-sm text-on-surface-variant">View your purchases, download design source files, and review license agreements.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
            <span className="material-symbols-outlined text-[32px]">shopping_bag</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">No purchases yet</h3>
          <p className="text-on-surface-variant mb-6">Your ordered items and active licenses will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-4 px-6">Design Details</th>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Designer</th>
                  <th className="py-4 px-6">License Type</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={order.designImage} 
                          alt={order.designTitle} 
                          className="w-10 h-10 rounded object-cover bg-surface-container shrink-0" 
                        />
                        <div>
                          <p className="font-semibold text-on-surface">{order.designTitle}</p>
                          <p className="text-[11px] text-on-surface-variant">{order.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">
                      {order.id}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {order.sellerName}
                    </td>
                    <td className="py-4 px-6 font-medium text-on-surface-variant">
                      {order.licenseType}
                    </td>
                    <td className="py-4 px-6 font-bold text-primary">
                      ${order.amount}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {order.status === 'completed' ? (
                        <button 
                          onClick={() => handleDownload(order.designTitle)}
                          className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm inline-flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          Download Files
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant italic">Pending Verification</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
