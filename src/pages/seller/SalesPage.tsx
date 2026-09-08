import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Order, Payout, PayoutDetails } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

export function SalesPage() {
  const { user, updateUserSession } = useAuth();
  const [sales, setSales] = useState<Order[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [unpaidBalance, setUnpaidBalance] = useState<number>(0);
  const [totalPaidOut, setTotalPaidOut] = useState<number>(0);
  const [lifetimeEarnings, setLifetimeEarnings] = useState<number>(0);
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>({ upiId: '', gpayNumber: '', accountHolderName: '' });
  
  const [activeTab, setActiveTab] = useState<'sales' | 'payouts'>('sales');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingPayout, setIsEditingPayout] = useState(false);
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  
  const [editUpiId, setEditUpiId] = useState('');
  const [editGpayNumber, setEditGpayNumber] = useState('');
  const [editHolderName, setEditHolderName] = useState('');

  const { showToast } = useNotification();

  const fetchData = async () => {
    try {
      const [ordersData, payoutData] = await Promise.all([
        api.orders.getSellerOrders(),
        api.payouts.getMyPayouts(),
      ]);
      setSales(ordersData);
      setPayouts(payoutData.payouts || []);
      setUnpaidBalance(payoutData.unpaidBalance || 0);
      setTotalPaidOut(payoutData.totalPaidOut || 0);
      setLifetimeEarnings(payoutData.lifetimeEarnings || 0);
      
      const details = payoutData.payoutDetails || { upiId: '', gpayNumber: '', accountHolderName: '' };
      setPayoutDetails(details);
      setEditUpiId(details.upiId || '');
      setEditGpayNumber(details.gpayNumber || '');
      setEditHolderName(details.accountHolderName || '');
    } catch (error) {
      console.error('Failed to fetch sales & payouts:', error);
      showToast('Failed to load wallet & sales data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePayoutDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayout(true);
    try {
      const updated = await api.payouts.updateDetails({
        upiId: editUpiId.trim(),
        gpayNumber: editGpayNumber.trim(),
        accountHolderName: editHolderName.trim(),
      });
      setPayoutDetails(updated);
      if (user) {
        updateUserSession({ ...user, payoutDetails: updated });
      }
      setIsEditingPayout(false);
      showToast('Payment & UPI details saved successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to save payout details', 'error');
    } finally {
      setIsSavingPayout(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'processing': return 'bg-amber-100 text-amber-800';
      case 'pending': return 'bg-surface-variant text-on-surface-variant';
      case 'refunded': return 'bg-error-container text-error';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const hasPaymentDetails = Boolean(payoutDetails.upiId || payoutDetails.gpayNumber);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Sales Received & Wallet</h2>
          <p className="text-sm text-on-surface-variant">
            Monitor purchases made on your designs, current unpaid wallet, and monthly settlements.
          </p>
        </div>
        <button
          onClick={() => setIsEditingPayout(true)}
          className="flex items-center gap-2 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-600">account_balance</span>
          {hasPaymentDetails ? 'Update Payout UPI / GPay' : '⚠️ Add Payout UPI / GPay'}
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Unpaid Wallet Balance */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-3 -bottom-2 opacity-15">
            <span className="material-symbols-outlined text-[90px]">account_balance_wallet</span>
          </div>
          <p className="text-xs uppercase font-bold text-emerald-100 tracking-wider mb-1">
            Current Unpaid Wallet (60%)
          </p>
          <h3 className="text-3xl font-black mb-2">₹{unpaidBalance.toLocaleString()}</h3>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Admin will transfer this balance at the end of the month via your registered UPI/Google Pay.
          </p>
        </div>

        {/* Total Settled / Paid Out */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
              Total Settled (Paid Out)
            </p>
            <span className="material-symbols-outlined text-purple-600 text-[22px]">paid</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface mb-1">₹{totalPaidOut.toLocaleString()}</h3>
          <p className="text-xs text-on-surface-variant">
            {payouts.length} monthly settlement{payouts.length === 1 ? '' : 's'} completed to date.
          </p>
        </div>

        {/* Total Lifetime Earnings */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
              Lifetime 60% Earnings
            </p>
            <span className="material-symbols-outlined text-primary text-[22px]">trending_up</span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-1">₹{lifetimeEarnings.toLocaleString()}</h3>
          <p className="text-xs text-on-surface-variant">
            Cumulative seller revenue across all {sales.filter(s => s.status === 'completed').length} completed orders.
          </p>
        </div>
      </div>

      {/* Payout Details Status Notice */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${hasPaymentDetails ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-300'}`}>
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined text-[24px] ${hasPaymentDetails ? 'text-emerald-700' : 'text-amber-700'}`}>
            {hasPaymentDetails ? 'check_circle' : 'warning'}
          </span>
          <div>
            <p className="text-sm font-bold text-on-surface">
              {hasPaymentDetails ? 'Monthly Settlement Target' : '⚠️ Action Required: Add Payment Details'}
            </p>
            <p className="text-xs text-on-surface-variant">
              {hasPaymentDetails ? (
                <>
                  UPI ID: <strong className="text-emerald-900 font-mono">{payoutDetails.upiId || 'None'}</strong>
                  {payoutDetails.gpayNumber && <> · Google Pay: <strong className="text-emerald-900 font-mono">{payoutDetails.gpayNumber}</strong></>}
                  {payoutDetails.accountHolderName && <> · Name: <strong>{payoutDetails.accountHolderName}</strong></>}
                </>
              ) : (
                'Please provide your UPI ID or Google Pay phone number so the admin can settle your monthly earnings.'
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditingPayout(true)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${hasPaymentDetails ? 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
        >
          {hasPaymentDetails ? 'Edit Details' : 'Add Now'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-outline-variant pb-1">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm rounded-lg transition-all ${
            activeTab === 'sales'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
          Sales Transactions ({sales.length})
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm rounded-lg transition-all ${
            activeTab === 'payouts'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          Monthly Payout History ({payouts.length})
        </button>
      </div>

      {/* TAB 1: Sales Transactions */}
      {activeTab === 'sales' && (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
              <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
                <span className="material-symbols-outlined text-[32px]">payments</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">No sales yet</h3>
              <p className="text-on-surface-variant">When customers purchase licenses for your patterns, they will appear here.</p>
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
        </>
      )}

      {/* TAB 2: Monthly Payout History */}
      {activeTab === 'payouts' && (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
              <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <span className="material-symbols-outlined text-[32px]">history_edu</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">No settlements processed yet</h3>
              <p className="text-on-surface-variant max-w-md mx-auto">
                When the platform Admin processes your monthly payouts, complete records with settlement date, amount, and reference IDs will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                      <th className="py-4 px-6">Settlement Period</th>
                      <th className="py-4 px-6">Amount Paid</th>
                      <th className="py-4 px-6">Payment Method & ID</th>
                      <th className="py-4 px-6">Transaction Ref / UTR</th>
                      <th className="py-4 px-6">Settled Date</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                    {payouts.map((payout) => (
                      <tr key={payout.id || payout._id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600 text-[20px]">calendar_month</span>
                            <span className="font-bold text-primary">{payout.period}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-black text-emerald-800 text-base">
                          ₹{payout.amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-on-surface">{payout.paymentId}</span>
                            <span className="text-[11px] text-on-surface-variant uppercase">{payout.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {payout.transactionRef ? (
                            <span className="font-mono text-xs bg-surface-container px-2 py-1 rounded text-on-surface font-semibold">
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
        </>
      )}

      {/* Edit Payout Details Modal */}
      {isEditingPayout && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[24px]">payments</span>
                <h3 className="text-lg font-bold text-primary">Monthly Payout Settings</h3>
              </div>
              <button
                onClick={() => setIsEditingPayout(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Enter your UPI ID or Google Pay phone number. The Admin will transfer your wallet earnings at the end of every month using these details.
            </p>

            <form onSubmit={handleSavePayoutDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  UPI ID (Google Pay / PhonePe / Paytm / BHIM)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-emerald-600 text-[18px]">qr_code_2</span>
                  <input
                    type="text"
                    className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none"
                    placeholder="e.g. yourname@oksbi / name@paytm"
                    value={editUpiId}
                    onChange={(e) => setEditUpiId(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Google Pay Phone Number
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-emerald-600 text-[18px]">phone_android</span>
                  <input
                    type="text"
                    className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none"
                    placeholder="e.g. +91 9876543210"
                    value={editGpayNumber}
                    onChange={(e) => setEditGpayNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Beneficiary Name (Optional)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">person</span>
                  <input
                    type="text"
                    className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none"
                    placeholder="Account holder name"
                    value={editHolderName}
                    onChange={(e) => setEditHolderName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsEditingPayout(false)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPayout}
                  className="px-5 py-2 text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  {isSavingPayout ? 'Saving...' : 'Save Payment Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
