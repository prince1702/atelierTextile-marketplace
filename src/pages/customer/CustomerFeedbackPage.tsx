import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Order, Feedback } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

const RATING_OPTIONS: { label: 'Good' | 'Very Good' | 'Not Good' | 'Duplicate' | 'Refund'; icon: string; color: string; bg: string }[] = [
  { label: 'Very Good', icon: 'thumb_up', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100' },
  { label: 'Good', icon: 'sentiment_satisfied', color: 'text-green-700', bg: 'bg-green-50 border-green-300 hover:bg-green-100' },
  { label: 'Not Good', icon: 'sentiment_dissatisfied', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300 hover:bg-amber-100' },
  { label: 'Duplicate', icon: 'content_copy', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-300 hover:bg-purple-100' },
  { label: 'Refund', icon: 'currency_exchange', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300 hover:bg-rose-100' },
];

export function CustomerFeedbackPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState<'Good' | 'Very Good' | 'Not Good' | 'Duplicate' | 'Refund'>('Very Good');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useNotification();

  const fetchData = async () => {
    try {
      const [ordersData, feedbackData] = await Promise.all([
        api.orders.getMyOrders(),
        api.feedback.getMyFeedback(),
      ]);
      setOrders(ordersData);
      setFeedbacks(feedbackData);
    } catch (error) {
      console.error('Failed to load customer feedback page:', error);
      showToast('Failed to load your orders & feedback', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openFeedbackModal = (order: Order) => {
    const existing = feedbacks.find(f => f.order === order.id);
    setSelectedOrder(order);
    if (existing) {
      setRating(existing.rating);
      setComment(existing.comment || '');
    } else {
      setRating('Very Good');
      setComment('');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmitting(true);
    try {
      await api.feedback.create(selectedOrder.id, rating, comment);
      showToast('Thank you! Your feedback has been submitted.', 'success');
      setSelectedOrder(null);
      fetchData();
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      showToast(error.response?.data?.error || 'Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingBadge = (r: string) => {
    switch (r) {
      case 'Very Good':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">⭐ Very Good</span>;
      case 'Good':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">👍 Good</span>;
      case 'Not Good':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">👎 Not Good</span>;
      case 'Duplicate':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">📋 Duplicate</span>;
      case 'Refund':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">💸 Refund</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{r}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-1">Give & View Feedback</h2>
        <p className="text-sm text-on-surface-variant">Share your experience with sellers on your purchased designs.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Purchased Orders ready for feedback */}
          <div>
            <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">shopping_cart</span>
              Purchased Orders ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="bg-white border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant text-sm">
                No purchases yet. Once you make an order, you can rate your purchase here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(order => {
                  const existingFeedback = feedbacks.find(f => f.order === order.id);
                  return (
                    <div key={order.id} className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {order.designImage ? (
                          <img src={order.designImage} alt={order.designTitle} className="w-14 h-14 rounded-lg object-cover bg-surface-container shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-outline">palette</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-on-surface text-sm truncate">{order.designTitle}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">by {order.sellerName}</p>
                          <div className="mt-1">
                            {existingFeedback ? getRatingBadge(existingFeedback.rating) : (
                              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">Pending Feedback</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => openFeedbackModal(order)}
                        className="px-3.5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">rate_review</span>
                        {existingFeedback ? 'Edit Feedback' : 'Give Feedback'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submitted Feedback List */}
          {feedbacks.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">reviews</span>
                My Submitted Feedback ({feedbacks.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbacks.map(item => (
                  <div key={item.id} className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.designImage ? (
                          <img src={item.designImage} alt={item.designTitle} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : null}
                        <div>
                          <h4 className="font-bold text-on-surface text-sm">{item.designTitle}</h4>
                          <p className="text-xs text-on-surface-variant">Seller: {item.sellerName}</p>
                        </div>
                      </div>
                      {getRatingBadge(item.rating)}
                    </div>

                    {item.comment && (
                      <p className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-2.5 text-xs text-on-surface italic">
                        "{item.comment}"
                      </p>
                    )}

                    <div className="text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/30 flex justify-between">
                      <span>Submitted on</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">rate_review</span>
                Give Feedback
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant">
              {selectedOrder.designImage && (
                <img src={selectedOrder.designImage} alt={selectedOrder.designTitle} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              )}
              <div>
                <p className="font-bold text-on-surface text-sm">{selectedOrder.designTitle}</p>
                <p className="text-xs text-on-surface-variant">Seller: {selectedOrder.sellerName}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Select Rating Option <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RATING_OPTIONS.map(opt => (
                    <button
                      type="button"
                      key={opt.label}
                      onClick={() => setRating(opt.label)}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                        rating === opt.label
                          ? 'border-primary bg-primary-container/10 ring-2 ring-primary text-primary shadow-sm'
                          : `${opt.bg} ${opt.color}`
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Comments / Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details about the quality, duplicate issue, refund reason, or overall satisfaction..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full border border-outline-variant rounded-xl p-3 text-xs text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 border border-outline-variant text-on-surface rounded-xl font-bold text-xs hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
