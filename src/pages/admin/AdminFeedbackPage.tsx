import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Feedback } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useNotification();

  const fetchFeedbacks = async () => {
    try {
      const data = await api.feedback.getAdminFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to fetch admin feedback:', error);
      showToast('Failed to load feedback records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const getRatingBadge = (rating: string) => {
    switch (rating) {
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
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{rating}</span>;
    }
  };

  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesRating = filterRating === 'all' || item.rating === filterRating;
    const custName = typeof item.customer === 'object' ? item.customer?.name : item.customerName;
    const custEmail = typeof item.customer === 'object' ? item.customer?.email : '';
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.designTitle.toLowerCase().includes(query) ||
      item.sellerName.toLowerCase().includes(query) ||
      (custName && custName.toLowerCase().includes(query)) ||
      (custEmail && custEmail.toLowerCase().includes(query)) ||
      (item.comment && item.comment.toLowerCase().includes(query));
    return matchesRating && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Customer Feedback Management</h2>
          <p className="text-sm text-on-surface-variant">Admin view of all customer feedback, ratings, and issue reports with customer identity.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">rate_review</span>
          <span className="text-sm font-bold text-blue-700">{feedbacks.length} Total Feedback</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['all', 'Very Good', 'Good', 'Not Good', 'Duplicate', 'Refund'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRating(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterRating === r
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {r === 'all' ? 'All Ratings' : r}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">reviews</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">No feedback found</h3>
          <p className="text-sm text-on-surface-variant">No customer feedback matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedbacks.map(item => {
            const custObj = typeof item.customer === 'object' ? item.customer : null;
            const customerName = custObj?.name || item.customerName || 'Customer';
            const customerEmail = custObj?.email || '';

            return (
              <div key={item.id} className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {item.designImage ? (
                        <img src={item.designImage} alt={item.designTitle} className="w-12 h-12 rounded-lg object-cover bg-surface-container shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-outline">palette</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-on-surface text-sm line-clamp-1">{item.designTitle}</h4>
                        <p className="text-xs text-on-surface-variant">Seller: <span className="font-semibold text-on-surface">{item.sellerName}</span></p>
                      </div>
                    </div>
                    {getRatingBadge(item.rating)}
                  </div>

                  {/* Customer Info (ADMIN VISIBLE) */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold mb-0.5">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">account_circle</span>
                      Customer (Admin View): {customerName}
                    </div>
                    {customerEmail && (
                      <p className="text-blue-700 pl-5">{customerEmail}</p>
                    )}
                  </div>

                  {/* Comment */}
                  {item.comment ? (
                    <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-3 text-xs text-on-surface italic">
                      "{item.comment}"
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant italic">No additional comments provided.</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/40">
                  <span>Order ID: {item.order}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
