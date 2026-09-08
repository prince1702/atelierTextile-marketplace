import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Payout, PayoutDetails } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

interface PendingSeller {
  id: string;
  _id?: string;
  name: string;
  email: string;
  initials?: string;
  avatar?: string;
  grossSales: number;
  lifetimeEarnings: number;
  totalPaidOut: number;
  unpaidBalance: number;
  totalOrders: number;
  payoutDetails: PayoutDetails;
  hasPaymentDetails: boolean;
  lastPayout?: {
    amount: number;
    period: string;
    paidAt: string;
    transactionRef?: string;
  } | null;
}

export function SellerPayoutsPage() {
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  // Modal State for processing payout
  const [selectedSeller, setSelectedSeller] = useState<PendingSeller | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutPeriod, setPayoutPeriod] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'gpay' | 'bank_transfer'>('upi');
  const [paymentId, setPaymentId] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter & Search states
  const [historySearch, setHistorySearch] = useState('');
  const [historyPeriodFilter, setHistoryPeriodFilter] = useState('all');

  const { showToast } = useNotification();

  const getCurrentMonthPeriod = () => {
    const d = new Date();
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pendingData, historyData] = await Promise.all([
        api.payouts.getPendingPayouts(),
        api.payouts.getPayoutHistory(),
      ]);
      setPendingSellers(pendingData);
      setPayoutHistory(historyData);
    } catch (error) {
      console.error('Failed to load seller payouts:', error);
      showToast('Failed to load payout data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openPayoutModal = (seller: PendingSeller) => {
    setSelectedSeller(seller);
    setPayoutAmount(seller.unpaidBalance);
    setPayoutPeriod(getCurrentMonthPeriod());
    const method = seller.payoutDetails?.upiId ? 'upi' : 'gpay';
    setPaymentMethod(method);
    setPaymentId(seller.payoutDetails?.upiId || seller.payoutDetails?.gpayNumber || '');
    setTransactionRef('');
    setNotes('');
  };

  const handleConfirmPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller) return;

    if (payoutAmount <= 0) {
      showToast('Payout amount must be greater than zero', 'error');
      return;
    }

    if (!paymentId) {
      showToast('Payment UPI or Google Pay ID is required', 'error');
      return;
    }

    const sellerId = selectedSeller.id || selectedSeller._id || '';
    if (!sellerId) {
      showToast('Invalid seller ID', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.payouts.processPayout(sellerId, {
        amount: payoutAmount,
        period: payoutPeriod || getCurrentMonthPeriod(),
        paymentMethod,
        paymentId,
        transactionRef,
        notes,
      });

      showToast(res.message || `Payout of ₹${payoutAmount.toLocaleString()} processed! Wallet reset to zero.`, 'success');
      setSelectedSeller(null);
      await loadData();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to process payout', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  const handleExportCSV = () => {
    if (payoutHistory.length === 0) {
      showToast('No payout history available to export', 'warning');
      return;
    }

    const headers = ['Period', 'Seller Name', 'Seller Email', 'Amount (INR)', 'Payment Method', 'Payment ID', 'Transaction Ref / UTR', 'Settled Date', 'Processed By'];
    const rows = payoutHistory.map(p => [
      `"${p.period || ''}"`,
      `"${p.sellerName || ''}"`,
      `"${p.sellerEmail || ''}"`,
      p.amount,
      `"${p.paymentMethod || ''}"`,
      `"${p.paymentId || ''}"`,
      `"${p.transactionRef || ''}"`,
      `"${p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : ''}"`,
      `"${p.paidByName || 'Admin'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TexDesigner_Seller_Payouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Payout history CSV downloaded successfully', 'success');
  };

  // Metrics
  const totalPendingPool = pendingSellers.reduce((sum, s) => sum + s.unpaidBalance, 0);
  const totalSettledToDate = payoutHistory.reduce((sum, p) => sum + p.amount, 0);
  const sellersWithPending = pendingSellers.filter(s => s.unpaidBalance > 0);
  const sellersMissingPayment = pendingSellers.filter(s => s.unpaidBalance > 0 && !s.hasPaymentDetails);

  // Filtered History
  const periods = Array.from(new Set(payoutHistory.map(p => p.period).filter(Boolean)));
  const filteredHistory = payoutHistory.filter(p => {
    const matchesPeriod = historyPeriodFilter === 'all' || p.period === historyPeriodFilter;
    const s = historySearch.toLowerCase().trim();
    const matchesSearch = !s ||
      (p.sellerName && p.sellerName.toLowerCase().includes(s)) ||
      (p.sellerEmail && p.sellerEmail.toLowerCase().includes(s)) ||
      (p.paymentId && p.paymentId.toLowerCase().includes(s)) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(s));
    return matchesPeriod && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Seller Monthly Settlements</h2>
          <p className="text-sm text-on-surface-variant">
            Transfer end-of-month earnings to sellers via UPI / Google Pay and reset their pending wallets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-white border border-outline-variant hover:bg-surface-variant text-on-surface px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-xs uppercase font-bold text-emerald-100 tracking-wider mb-1">
            Current Unpaid Pool (60%)
          </p>
          <h3 className="text-3xl font-black mb-1">₹{totalPendingPool.toLocaleString()}</h3>
          <p className="text-xs text-emerald-100">
            Across {sellersWithPending.length} seller{sellersWithPending.length === 1 ? '' : 's'} awaiting payout
          </p>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
              Total Settled (Paid Out)
            </p>
            <span className="material-symbols-outlined text-purple-600 text-[20px]">paid</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface mb-1">₹{totalSettledToDate.toLocaleString()}</h3>
          <p className="text-xs text-on-surface-variant">
            {payoutHistory.length} total monthly transactions
          </p>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
              Sellers Ready for Payout
            </p>
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
          </div>
          <h3 className="text-2xl font-bold text-emerald-800 mb-1">
            {pendingSellers.filter(s => s.unpaidBalance > 0 && s.hasPaymentDetails).length}
          </h3>
          <p className="text-xs text-on-surface-variant">
            Valid UPI ID or Google Pay provided
          </p>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
              Missing Payment Details
            </p>
            <span className="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
          </div>
          <h3 className="text-2xl font-bold text-amber-700 mb-1">
            {sellersMissingPayment.length}
          </h3>
          <p className="text-xs text-on-surface-variant">
            Sellers with balance but no UPI/GPay
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-outline-variant pb-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm rounded-lg transition-all ${
            activeTab === 'pending'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
          Pending Settlements ({sellersWithPending.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          Payout History Archive ({payoutHistory.length})
        </button>
      </div>

      {/* TAB 1: Pending Settlements */}
      {activeTab === 'pending' && (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
              <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
            </div>
          ) : pendingSellers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">No pending settlements</h3>
              <p className="text-on-surface-variant">All seller wallets are currently settled and at zero balance.</p>
            </div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                      <th className="py-4 px-6">Seller Details</th>
                      <th className="py-4 px-6">Payment Method & ID</th>
                      <th className="py-4 px-6">Total Orders / Sales</th>
                      <th className="py-4 px-6">Unpaid Wallet (60%)</th>
                      <th className="py-4 px-6">Last Payout</th>
                      <th className="py-4 px-6 text-right">Settlement Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                    {pendingSellers.map((seller) => {
                      const hasBalance = seller.unpaidBalance > 0;
                      const hasPayment = seller.hasPaymentDetails;
                      const paymentText = seller.payoutDetails?.upiId || seller.payoutDetails?.gpayNumber || '';

                      return (
                        <tr key={seller.id || seller._id} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {seller.initials || seller.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-on-surface">{seller.name}</p>
                                <p className="text-xs text-on-surface-variant">{seller.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {hasPayment ? (
                              <div className="flex flex-col gap-1">
                                {seller.payoutDetails?.upiId && (
                                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg w-fit">
                                    <span className="material-symbols-outlined text-[14px] text-emerald-700">qr_code_2</span>
                                    <span className="font-mono text-xs font-bold text-emerald-900">{seller.payoutDetails.upiId}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(seller.payoutDetails.upiId!, 'UPI ID')}
                                      className="text-emerald-700 hover:text-emerald-950 ml-1"
                                      title="Copy UPI ID"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                    </button>
                                  </div>
                                )}
                                {seller.payoutDetails?.gpayNumber && (
                                  <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg w-fit">
                                    <span className="material-symbols-outlined text-[14px] text-sky-700">phone_android</span>
                                    <span className="font-mono text-xs font-bold text-sky-900">{seller.payoutDetails.gpayNumber}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(seller.payoutDetails.gpayNumber!, 'Google Pay Number')}
                                      className="text-sky-700 hover:text-sky-950 ml-1"
                                      title="Copy Phone Number"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-1 rounded-lg font-semibold">
                                <span className="material-symbols-outlined text-[14px]">warning</span>
                                Not provided yet
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6">
                            <p className="font-semibold text-on-surface">{seller.totalOrders} Completed Orders</p>
                            <p className="text-xs text-on-surface-variant">Gross: ₹{seller.grossSales.toLocaleString()}</p>
                          </td>

                          <td className="py-4 px-6">
                            {hasBalance ? (
                              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 font-black text-base px-3 py-1 rounded-xl">
                                <span className="material-symbols-outlined text-[18px] text-emerald-700">account_balance_wallet</span>
                                ₹{seller.unpaidBalance.toLocaleString()}
                              </div>
                            ) : (
                              <span className="text-xs text-on-surface-variant font-medium">₹0 (Settled)</span>
                            )}
                          </td>

                          <td className="py-4 px-6">
                            {seller.lastPayout ? (
                              <div>
                                <p className="font-bold text-xs text-on-surface">₹{seller.lastPayout.amount.toLocaleString()}</p>
                                <p className="text-[11px] text-on-surface-variant">{seller.lastPayout.period}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-on-surface-variant italic">No previous payouts</span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-right">
                            {hasBalance ? (
                              <button
                                onClick={() => openPayoutModal(seller)}
                                disabled={!hasPayment}
                                title={!hasPayment ? 'Seller has not added UPI ID or Google Pay yet' : 'Process payout'}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                  hasPayment
                                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                                    : 'bg-surface-variant text-on-surface-variant opacity-60 cursor-not-allowed'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">payments</span>
                                Mark as Paid
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                Fully Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: Payout History Archive */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-outline-variant shadow-sm">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search seller, email, UPI, or UTR..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-xs text-on-surface focus:border-primary outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-on-surface-variant whitespace-nowrap">Period:</label>
              <select
                value={historyPeriodFilter}
                onChange={(e) => setHistoryPeriodFilter(e.target.value)}
                className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold text-on-surface outline-none"
              >
                <option value="all">All Periods ({payoutHistory.length})</option>
                {periods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px]">receipt_long</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">No payout records found</h3>
              <p className="text-on-surface-variant">No settlements match your current search or filter criteria.</p>
            </div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                      <th className="py-4 px-6">Period</th>
                      <th className="py-4 px-6">Seller</th>
                      <th className="py-4 px-6">Amount Paid</th>
                      <th className="py-4 px-6">Payment ID</th>
                      <th className="py-4 px-6">Transaction Ref / UTR</th>
                      <th className="py-4 px-6">Settled Date</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                    {filteredHistory.map((payout) => (
                      <tr key={payout.id || payout._id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-bold text-primary">{payout.period}</span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-on-surface">{payout.sellerName}</p>
                          <p className="text-xs text-on-surface-variant">{payout.sellerEmail}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-black text-emerald-800 text-base">₹{payout.amount.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-on-surface">{payout.paymentId}</span>
                            <span className="text-[10px] text-on-surface-variant uppercase font-semibold bg-surface-container px-1.5 py-0.5 rounded">
                              {payout.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {payout.transactionRef ? (
                            <span className="font-mono text-xs bg-surface-container px-2.5 py-1 rounded text-on-surface font-bold">
                              {payout.transactionRef}
                            </span>
                          ) : (
                            <span className="text-xs text-on-surface-variant italic">Direct Settlement</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-on-surface-variant">
                          {payout.paidAt ? new Date(payout.paidAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            {payout.status || 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Process Payout Settlement Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[24px]">payments</span>
                <h3 className="text-lg font-bold text-primary">Settle Seller Payout</h3>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Seller Summary Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-emerald-950">{selectedSeller.name}</h4>
                  <p className="text-xs text-emerald-800">{selectedSeller.email}</p>
                </div>
                <span className="text-xs font-black text-emerald-900 bg-emerald-200/70 px-2.5 py-1 rounded-lg">
                  Due: ₹{selectedSeller.unpaidBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200 text-xs">
                <span className="text-emerald-800">Payment ID:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-emerald-950">
                  <span>{selectedSeller.payoutDetails?.upiId || selectedSeller.payoutDetails?.gpayNumber || 'N/A'}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedSeller.payoutDetails?.upiId || selectedSeller.payoutDetails?.gpayNumber || '', 'Payment ID')}
                    className="text-emerald-700 hover:text-emerald-950"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmPayout} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                    Settlement Period
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface font-semibold focus:border-emerald-600 outline-none"
                    value={payoutPeriod}
                    onChange={(e) => setPayoutPeriod(e.target.value)}
                    placeholder="e.g. August 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                    Amount to Pay (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-emerald-900 font-bold focus:border-emerald-600 outline-none"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Payment Method & Destination ID
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      paymentMethod === 'upi'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-on-surface-variant border-outline-variant'
                    }`}
                  >
                    UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gpay')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      paymentMethod === 'gpay'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-on-surface-variant border-outline-variant'
                    }`}
                  >
                    Google Pay
                  </button>
                </div>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono text-on-surface focus:border-emerald-600 outline-none"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="UPI ID or Phone number used"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Bank / UPI Reference Number (UTR / Txn ID)
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono text-on-surface focus:border-emerald-600 outline-none"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI/321980123/SBI or UTR number"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Admin Notes (Optional)
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:border-emerald-600 outline-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal settlement remarks"
                />
              </div>

              <div className="pt-2 text-xs text-on-surface-variant">
                ℹ️ Clicking <strong>Confirm & Mark as Paid</strong> will reset this seller's unpaid wallet balance to <strong>₹0</strong> and store this record permanently.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setSelectedSeller(null)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  {isProcessing ? 'Processing Settlement...' : 'Confirm & Mark as Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
