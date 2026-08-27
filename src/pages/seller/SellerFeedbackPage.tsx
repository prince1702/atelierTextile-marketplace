import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Feedback } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export function SellerFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<string>('all');
  const { showToast } = useNotification();

  const fetchFeedbacks = async () => {
    try {
      const data = await api.feedback.getSellerFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to fetch seller feedback:', error);
      showToast('Failed to load design feedback', 'error');
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
    return filterRating === 'all' || item.rating === filterRating;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Customer Feedback on My Designs</h2>
          <p className="text-sm text-on-surface-variant">Review customer ratings and quality feedback for your uploaded designs.</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2">
          <span className="material-symbols-outlined text-purple-600 text-[20px]">rate_review</span>
          <span className="text-sm font-bold text-purple-700">{feedbacks.length} Reviews Received</span>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-xs font-medium">
        <span className="material-symbols-outlined text-amber-600 shrink-0 text-xl">lock</span>
        <span>Customer names and identities are kept anonymous to maintain honest feedback and privacy. Only system Administrators can view customer details.</span>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-outline-variant rounded-xl p-4 flex flex-wrap gap-2 items-center shadow-sm">
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

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">reviews</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">No feedback yet</h3>
          <p className="text-sm text-on-surface-variant">No feedback matching your selected rating filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedbacks.map(item => (
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
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">visibility_off</span>
                        <span>Customer: <strong className="text-on-surface font-semibold">Anonymous Customer</strong></span>
                      </div>
                    </div>
                  </div>
                  {getRatingBadge(item.rating)}
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
                <span>Feedback Received</span>
                <span>{new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
