import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Offer } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Form State
  const [offerName, setOfferName] = useState('');
  const [offerType, setOfferType] = useState<Offer['offerType']>('Festival Offer');
  const [discountPercentage, setDiscountPercentage] = useState<number | ''>(20);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [priority, setPriority] = useState<number>(1);
  const [status, setStatus] = useState<'scheduled' | 'active' | 'expired' | 'disabled'>('scheduled');

  const { showToast } = useNotification();

  const fetchOffersAndStats = async () => {
    try {
      const [offersData, statsData] = await Promise.all([
        api.offers.getAll({
          search: searchQuery,
          status: statusFilter,
          offerType: typeFilter,
          sort: sortBy,
        }),
        api.offers.getStats(),
      ]);
      setOffers(offersData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load offers:', error);
      showToast('Failed to load offers and promotions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffersAndStats();
  }, [searchQuery, statusFilter, typeFilter, sortBy]);

  const handleOpenCreateModal = () => {
    setEditingOffer(null);
    setOfferName('');
    setOfferType('Festival Offer');
    setDiscountPercentage(20);
    setPriority(1);
    setStatus('scheduled');

    // Default dates: start now, end in 7 days
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Format YYYY-MM-DDTHH:mm for datetime-local
    const toDatetimeLocal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setStartDateTime(toDatetimeLocal(now));
    setEndDateTime(toDatetimeLocal(future));
    setShowModal(true);
  };

  const handleOpenEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferName(offer.offerName);
    setOfferType(offer.offerType);
    setDiscountPercentage(offer.discountPercentage);
    setPriority(offer.priority || 1);
    setStatus(offer.status);

    const toDatetimeLocal = (iso: string) => {
      if (!iso) return '';
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setStartDateTime(toDatetimeLocal(offer.startDateTime));
    setEndDateTime(toDatetimeLocal(offer.endDateTime));
    setShowModal(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offerName.trim()) {
      showToast('Please enter an offer name', 'error');
      return;
    }

    const discountNum = Number(discountPercentage);
    if (isNaN(discountNum) || discountNum < 1 || discountNum > 100) {
      showToast('Discount percentage must be between 1% and 100%', 'error');
      return;
    }

    if (!startDateTime || !endDateTime) {
      showToast('Please select both start and end date/times', 'error');
      return;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (start >= end) {
      showToast('Start date/time must be strictly before End date/time', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        offerName: offerName.trim(),
        offerType,
        discountPercentage: discountNum,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        priority: Number(priority),
        status,
      };

      if (editingOffer) {
        await api.offers.update(editingOffer.id, payload);
        showToast('Offer updated successfully!', 'success');
      } else {
        await api.offers.create(payload);
        showToast('New offer created and scheduled!', 'success');
      }

      setShowModal(false);
      fetchOffersAndStats();
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || 'Failed to save offer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (offer: Offer) => {
    const isDisabling = offer.status !== 'disabled';
    const confirmText = isDisabling
      ? `Are you sure you want to disable "${offer.offerName}"? Product discounts for this offer will be paused.`
      : `Re-enable "${offer.offerName}"? The offer status will be updated automatically based on schedule.`;

    if (!window.confirm(confirmText)) return;

    try {
      await api.offers.toggleStatus(offer.id);
      showToast(`Offer ${isDisabling ? 'disabled' : 'enabled'} successfully`, 'success');
      fetchOffersAndStats();
    } catch (error) {
      showToast('Failed to change offer status', 'error');
    }
  };

  const handleDeleteOffer = async (offer: Offer) => {
    if (!window.confirm(`Permanently delete "${offer.offerName}"? If active, original product prices will be restored.`)) return;

    try {
      await api.offers.delete(offer.id);
      showToast('Offer deleted permanently', 'success');
      fetchOffersAndStats();
    } catch (error) {
      showToast('Failed to delete offer', 'error');
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Active
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Scheduled
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            Expired
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Disabled
          </span>
        );
      default:
        return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100">{s}</span>;
    }
  };

  const activeOffer = stats?.currentActiveOffer;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Offers & Festival Promotions</h2>
          <p className="text-sm text-on-surface-variant">Create and schedule percentage-based discount offers automatically applied across all designs.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Create New Offer
        </button>
      </div>

      {/* Active Offer Banner */}
      {activeOffer ? (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl text-white">local_offer</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-extrabold bg-white text-orange-600 px-2 py-0.5 rounded-md">LIVE OFFER</span>
                <span className="text-xs text-white/90 font-medium">{activeOffer.offerType}</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-0.5">{activeOffer.offerName} — {activeOffer.discountPercentage}% OFF ALL PRODUCTS</h3>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur px-4 py-2 rounded-xl text-center shrink-0 border border-white/20">
            <p className="text-[10px] uppercase font-bold tracking-wider text-white/80">Offer Ends On</p>
            <p className="text-sm font-extrabold text-white">{new Date(activeOffer.endDateTime).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 flex items-center gap-3 text-on-surface-variant text-xs font-semibold">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          <span>No promotional offer is currently active. Products are displaying their standard original prices.</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">campaign</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Offers</p>
            <p className="text-2xl font-extrabold text-on-surface mt-0.5">{stats?.totalOffers || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">bolt</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Offers</p>
            <p className="text-2xl font-extrabold text-green-700 mt-0.5">{stats?.activeOffersCount || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">event_upcoming</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Scheduled Offers</p>
            <p className="text-2xl font-extrabold text-blue-700 mt-0.5">{stats?.scheduledOffersCount || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">history</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Expired Offers</p>
            <p className="text-2xl font-extrabold text-gray-700 mt-0.5">{stats?.expiredOffersCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white border border-outline-variant rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-outline-variant bg-surface-container-lowest rounded-xl px-3 py-2 text-xs font-bold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-outline-variant bg-surface-container-lowest rounded-xl px-3 py-2 text-xs font-bold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Offer Types</option>
            <option value="Festival Offer">Festival Offer</option>
            <option value="Seasonal Offer">Seasonal Offer</option>
            <option value="Special Offer">Special Offer</option>
            <option value="Clearance Sale">Clearance Sale</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-outline-variant bg-surface-container-lowest rounded-xl px-3 py-2 text-xs font-bold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="discount_desc">Highest Discount</option>
            <option value="priority">Highest Priority</option>
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            type="text"
            placeholder="Search offer name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Offers Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-2xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">local_offer</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">No offers found</h3>
          <p className="text-sm text-on-surface-variant mb-4">No promotional offers matching your search or filter parameters.</p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-colors inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Create Offer Now
          </button>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-4 px-6">Offer Name</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Start Date & Time</th>
                  <th className="py-4 px-6">End Date & Time</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                {offers.map(offer => (
                  <tr key={offer.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-on-surface">{offer.offerName}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant font-medium">
                      {offer.offerType}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-emerald-700">
                      <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs">
                        {offer.discountPercentage}% OFF
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">
                      {new Date(offer.startDateTime).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">
                      {new Date(offer.endDateTime).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-on-surface-variant">
                      P-{offer.priority || 1}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(offer.status)}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(offer)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors inline-block"
                        title="Edit Offer"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(offer)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          offer.status === 'disabled'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title={offer.status === 'disabled' ? 'Enable Offer' : 'Disable Offer'}
                      >
                        {offer.status === 'disabled' ? 'Enable' : 'Disable'}
                      </button>

                      <button
                        onClick={() => handleDeleteOffer(offer)}
                        className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-error-container/20 transition-colors inline-block"
                        title="Delete Offer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_offer</span>
                {editingOffer ? 'Edit Offer & Promotion' : 'Create Promotional Offer'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Offer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Special Sale, Independence Day Offer..."
                  value={offerName}
                  onChange={e => setOfferName(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Offer Type / Occasion
                  </label>
                  <select
                    value={offerType}
                    onChange={e => setOfferType(e.target.value as any)}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                  >
                    <option value="Festival Offer">Festival Offer</option>
                    <option value="Seasonal Offer">Seasonal Offer</option>
                    <option value="Special Offer">Special Offer</option>
                    <option value="Clearance Sale">Clearance Sale</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Discount Percentage (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    placeholder="e.g. 20"
                    value={discountPercentage}
                    onChange={e => setDiscountPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDateTime}
                    onChange={e => setStartDateTime(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    End Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endDateTime}
                    onChange={e => setEndDateTime(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Priority (Overlapping Rule)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={priority}
                    onChange={e => setPriority(Number(e.target.value))}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:border-primary outline-none"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Higher priority applies if multiple active offers overlap.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                  >
                    <option value="scheduled">Scheduled (Auto-Activate on Start Date)</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium">
                ⚡ When active, the system automatically applies <strong>{discountPercentage || 0}% OFF</strong> across all marketplace designs without overwriting base prices.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save & Schedule Offer'
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
