import React, { useEffect, useState, useRef } from 'react';
import { api, API_URL } from '../../services/api';
import type { Order } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useNotification();

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

  useEffect(() => { fetchOrders(); }, []);

  const handleDownload = async (designTitle: string, designId: string, fileType?: string) => {
    if (!designId) {
      showToast('No file available for download', 'error');
      return;
    }

    const token = localStorage.getItem('atelier_token') || '';
    const typeParam = fileType ? `&fileType=${fileType}` : '';
    const downloadUrl = `${API_URL}/api/designs/${designId}/download?token=${encodeURIComponent(token)}${typeParam}`;

    showToast(`Downloading ${fileType ? fileType.toUpperCase() : ''}: ${designTitle}...`, 'success');

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        showToast(errData.error || `Download failed (${response.status})`, 'error');
        return;
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const disposition = response.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^"\n]+)"?/);
      link.download = match ? match[1] : `${designTitle}${fileType ? `_${fileType}` : ''}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      showToast('Download failed. Please try again.', 'error');
    }
  };

  const handleUploadScreenshot = (orderId: string) => {
    setUploadingOrderId(orderId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingOrderId) return;
    try {
      await api.orders.uploadPaymentScreenshot(uploadingOrderId, file);
      showToast('Screenshot uploaded! Awaiting admin approval.', 'success');
      fetchOrders();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploadingOrderId(null);
      e.target.value = '';
    }
  };

  const getStatusBadge = (order: Order) => {
    switch (order.status) {
      case 'completed':
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">✓ Approved</span>;
      case 'rejected':
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">✗ Rejected</span>;
      case 'pending':
        if (order.paymentScreenshot) {
          return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">⏳ Under Review</span>;
        }
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">💳 Awaiting Payment</span>;
      case 'processing':
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">Processing</span>;
      case 'refunded':
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant">Refunded</span>;
      default:
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant">{order.status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-1">My Orders & Licenses</h2>
        <p className="text-sm text-on-surface-variant">View your purchases, upload payment proofs, and download approved designs.</p>
      </div>

      {/* Hidden file input for screenshot re-upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
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
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                {/* Design image + info */}
                <img
                  src={order.designImage}
                  alt={order.designTitle}
                  className="w-16 h-16 rounded-lg object-cover bg-surface-container shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface truncate">{order.designTitle}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">by {order.sellerName} · {order.licenseType}</p>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5 truncate">ID: {order.id}</p>
                </div>
                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-lg text-primary">₹{order.amount.toLocaleString()}</p>
                  <div className="mt-1">{getStatusBadge(order)}</div>
                </div>
              </div>

              {/* Rejection note */}
              {order.status === 'rejected' && order.paymentNote && (
                <div className="mx-5 mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">error</span>
                  <div>
                    <p className="text-xs font-bold text-red-700">Payment Rejected</p>
                    <p className="text-xs text-red-600 mt-0.5">{order.paymentNote}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-outline-variant/50 px-5 py-3 bg-surface-container-lowest flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  {order.paymentScreenshot && (
                    <a
                      href={order.paymentScreenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-[14px]">image</span>
                      View Screenshot
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  {order.status === 'completed' && (() => {
                    const d = order.design as any;
                    const designId = typeof d === 'string' ? d : (d?.id || d?._id?.toString() || '');
                    const lt = (order.licenseType || '').toUpperCase();
                    const fileType = (lt === 'PDC' || lt === 'TIF') ? lt.toLowerCase() : undefined;

                    return (
                      <button
                        onClick={() => handleDownload(order.designTitle, designId, fileType)}
                        className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm inline-flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        Download
                      </button>
                    );
                  })()}
                  {(order.status === 'pending' && !order.paymentScreenshot) && (
                    <button
                      onClick={() => handleUploadScreenshot(order.id)}
                      className="px-3.5 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors shadow-sm inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                      Upload Payment Proof
                    </button>
                  )}
                  {order.status === 'rejected' && (
                    <button
                      onClick={() => handleUploadScreenshot(order.id)}
                      className="px-3.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors shadow-sm inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                      Re-upload Screenshot
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
