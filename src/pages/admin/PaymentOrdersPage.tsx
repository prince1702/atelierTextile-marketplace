import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Order } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export function PaymentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [expandedScreenshot, setExpandedScreenshot] = useState<string | null>(null);
  const { showToast } = useNotification();

  const fetchOrders = async () => {
    try {
      const data = await api.orders.getPaymentReviewOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch payment review orders:', error);
      showToast('Failed to load payment review orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleApprove = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await api.orders.approveOrder(orderId);
      showToast('Order approved! Customer can now download the design.', 'success');
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to approve order', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    const note = rejectNotes[orderId] || 'Payment screenshot was unclear or invalid. Please re-upload.';
    setProcessingId(orderId);
    try {
      await api.orders.rejectOrder(orderId, note);
      showToast('Order rejected. Customer will be notified.', 'success');
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to reject order', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Payment Approvals</h2>
          <p className="text-sm text-on-surface-variant">Review customer payment screenshots and approve or reject orders.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          <span className="material-symbols-outlined text-amber-600 text-[20px]">pending_actions</span>
          <span className="text-sm font-bold text-amber-700">{orders.length} Pending</span>
        </div>
      </div>

      {/* Fullscreen screenshot viewer */}
      {expandedScreenshot && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedScreenshot(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setExpandedScreenshot(null)}
              className="absolute -top-10 right-0 text-white font-bold text-sm hover:text-amber-400"
            >
              ✕ Close
            </button>
            <img src={expandedScreenshot} alt="Payment screenshot" className="w-full rounded-xl shadow-2xl" />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-green-600">check_circle</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">All payments reviewed!</h3>
          <p className="text-on-surface-variant">No pending payment screenshots to approve right now.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border-b border-outline-variant/50">
                <img
                  src={order.designImage}
                  alt={order.designTitle}
                  className="w-14 h-14 rounded-lg object-cover bg-surface-container shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface">{order.designTitle}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-on-surface-variant">
                    <span>Customer: <strong className="text-on-surface">{order.buyerName}</strong></span>
                    <span>Seller: <strong className="text-on-surface">{order.sellerName}</strong></span>
                    <span>License: <strong className="text-on-surface">{order.licenseType}</strong></span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">ID: {order.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-primary">₹{order.amount.toLocaleString()}</p>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 mt-1">
                    ⏳ Awaiting Approval
                  </span>
                </div>
              </div>

              {/* Screenshot + Actions */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Screenshot thumbnail */}
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Payment Screenshot</p>
                  {order.paymentScreenshot ? (
                    <div
                      className="relative cursor-pointer group rounded-xl overflow-hidden border border-outline-variant shadow-sm"
                      onClick={() => setExpandedScreenshot(order.paymentScreenshot!)}
                    >
                      <img
                        src={order.paymentScreenshot}
                        alt="Payment proof"
                        className="w-full h-48 object-contain bg-surface-container-low group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                          Click to enlarge
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center">
                      <p className="text-xs text-on-surface-variant">No screenshot uploaded yet</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                      Rejection Note (optional)
                    </label>
                    <textarea
                      placeholder="e.g. Screenshot is unclear, wrong amount paid..."
                      rows={4}
                      value={rejectNotes[order.id] || ''}
                      onChange={e => setRejectNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => handleApprove(order.id)}
                      disabled={processingId === order.id}
                      className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === order.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(order.id)}
                      disabled={processingId === order.id}
                      className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === order.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
