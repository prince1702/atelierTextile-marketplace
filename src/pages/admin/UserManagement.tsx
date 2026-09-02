import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { User, Design } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { WatermarkedImage } from '../../components/ui/WatermarkedImage';
import { optimizeCloudinaryUrl } from '../../utils/imageOptimize';

export function UserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || 'all';

  const [userList, setUserList] = useState<User[]>([]);
  const [filter, setFilter] = useState(roleParam);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useNotification();
  const { user: currentUser, updateUserSession } = useAuth();

  // Selected seller profile modal state
  const [selectedSeller, setSelectedSeller] = useState<User | null>(null);
  const [sellerDesigns, setSellerDesigns] = useState<Design[]>([]);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'seller' | 'customer'>('customer');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);
  const [showEditConfirmPass, setShowEditConfirmPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync filter when URL search parameter changes
  useEffect(() => {
    if (roleParam && ['all', 'seller', 'customer', 'admin'].includes(roleParam)) {
      setFilter(roleParam);
    }
  }, [roleParam]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.users.getAll();
      setUserList(data);
    } catch (error) {
      console.error('Failed to fetch user list:', error);
      showToast('Failed to load user list', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    if (newFilter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ role: newFilter });
    }
  };

  const handleOpenSellerProfile = async (targetUser: User) => {
    setSelectedSeller(targetUser);
    setIsLoadingDesigns(true);
    try {
      // Fetch full details and designs for this seller
      const userDetail = await api.users.getById(targetUser.id);
      setSelectedSeller(userDetail);
      if (userDetail.designs) {
        setSellerDesigns(userDetail.designs);
      } else {
        // Fallback: fetch designs by designer ID
        const allDesignsRes = await api.designs.getAll({ status: 'all', limit: 100 });
        const filtered = (allDesignsRes.designs || []).filter((d: Design) => String(d.designer) === String(targetUser.id));
        setSellerDesigns(filtered);
      }
    } catch (err) {
      console.warn('Could not load specific seller designs:', err);
    } finally {
      setIsLoadingDesigns(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword('');
    setEditConfirmPassword('');
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const payload: { name?: string; email?: string; role?: 'admin' | 'seller' | 'customer'; password?: string } = {
        name: editName,
        email: editEmail,
        role: editRole,
      };
      if (editPassword.trim()) {
        if (editPassword.trim().length < 6) {
          showToast('Password must be at least 6 characters long', 'error');
          setIsSubmitting(false);
          return;
        }
        if (editPassword.trim() !== editConfirmPassword.trim()) {
          showToast('Passwords do not match', 'error');
          setIsSubmitting(false);
          return;
        }
        payload.password = editPassword.trim();
      }

      const updated = await api.users.update(editingUser.id, payload);
      
      // If updating current logged in admin's profile, sync AuthContext session
      if (currentUser && currentUser.id === editingUser.id) {
        updateUserSession(updated);
      }

      showToast('User email & password updated directly in database!', 'success');
      setEditingUser(null);
      if (selectedSeller && selectedSeller.id === editingUser.id) {
        setSelectedSeller({ ...selectedSeller, ...payload });
      }
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await api.users.updateStatus(id, newStatus);
      showToast(`User status updated to ${newStatus}`, 'success');
      if (selectedSeller && selectedSeller.id === id) {
        setSelectedSeller({ ...selectedSeller, status: newStatus as any });
      }
      fetchUsers();
    } catch (error) {
      showToast('Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      await api.users.delete(id);
      showToast('User account deleted permanently', 'success');
      if (selectedSeller && selectedSeller.id === id) {
        setSelectedSeller(null);
      }
      fetchUsers();
    } catch (error) {
      showToast('Failed to delete user account', 'error');
    }
  };

  const filteredUsers = userList.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  // Calculate total seller metrics
  const sellersList = userList.filter(u => u.role === 'seller');
  const totalSellersWallet = sellersList.reduce((sum, s) => sum + (s.walletBalance || 0), 0);
  const totalSellersGross = sellersList.reduce((sum, s) => sum + (s.grossSales || 0), 0);
  const totalSellersOrders = sellersList.reduce((sum, s) => sum + (s.totalOrders || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'pending': return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'suspended': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-600';
      case 'pending': return 'bg-amber-600';
      case 'suspended': return 'bg-red-600';
      default: return 'bg-outline';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in animate-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">
            {filter === 'seller' ? 'Seller Wallets & Profiles' : 'User Management'}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {filter === 'seller' 
              ? 'View all seller wallet balances, 60% revenue payouts, and full individual seller profiles.' 
              : 'Manage registered user accounts, seller wallets, and credentials.'}
          </p>
        </div>

        {/* Role Filter Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-outline-variant flex gap-1.5 w-fit shadow-sm">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === 'all' ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            All Users ({userList.length})
          </button>
          <button
            onClick={() => handleFilterChange('seller')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === 'seller' ? 'bg-emerald-700 text-white shadow-sm' : 'hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            Sellers ({sellersList.length})
          </button>
          <button
            onClick={() => handleFilterChange('customer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === 'customer' ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            Customers
          </button>
          <button
            onClick={() => handleFilterChange('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === 'admin' ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            Admins
          </button>
        </div>
      </div>

      {/* Sellers Wallet Overview Banner (Shown on Sellers tab or All Users) */}
      {(filter === 'seller' || filter === 'all') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gradient-to-r from-emerald-900 to-teal-950 p-5 rounded-2xl text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-800/60 border border-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px] text-emerald-300">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-emerald-300 tracking-wider">Total Sellers 60% Wallet Pool</p>
              <h3 className="text-2xl font-black text-white">₹{totalSellersWallet.toLocaleString()}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-emerald-800/80 sm:pl-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-800/60 border border-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px] text-emerald-300">payments</span>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-emerald-300 tracking-wider">Total Gross Seller Sales</p>
              <h3 className="text-2xl font-black text-white">₹{totalSellersGross.toLocaleString()}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-emerald-800/80 sm:pl-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-800/60 border border-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px] text-emerald-300">storefront</span>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-emerald-300 tracking-wider">Active Sellers & Volume</p>
              <h3 className="text-2xl font-black text-white">{sellersList.length} Sellers · {totalSellersOrders} Orders</h3>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-4 px-6">User / Seller</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Seller Wallet (60%)</th>
                  <th className="py-4 px-6">Catalog Designs</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => user.role === 'seller' ? handleOpenSellerProfile(user) : handleOpenEdit(user)}
                          className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm select-none shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                        >
                          {user.initials}
                        </div>
                        <div>
                          <p 
                            onClick={() => user.role === 'seller' ? handleOpenSellerProfile(user) : handleOpenEdit(user)}
                            className="font-semibold hover:text-primary cursor-pointer transition-colors"
                          >
                            {user.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`capitalize font-bold text-xs px-2.5 py-1 rounded-md ${
                        user.role === 'seller' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        user.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.role === 'seller' ? (
                        <div>
                          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1.5 shadow-2xs">
                            <span className="material-symbols-outlined text-[15px] text-emerald-700">account_balance_wallet</span>
                            ₹{(user.walletBalance || 0).toLocaleString()}
                          </span>
                          {user.grossSales !== undefined && (
                            <p className="text-[11px] text-on-surface-variant mt-0.5">Gross: ₹{user.grossSales.toLocaleString()} ({user.totalOrders || 0} orders)</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-on-surface-variant text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant font-medium">
                      {user.role === 'seller' ? (
                        <span>{user.totalDesigns || 0} Designs</span>
                      ) : (
                        <span className="text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant text-xs">{user.joinedAt?.split('T')[0] || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(user.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(user.status)}`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      {/* View Profile & Wallet Button for Sellers */}
                      {user.role === 'seller' && (
                        <button
                          type="button"
                          onClick={() => handleOpenSellerProfile(user)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-700 hover:text-white transition-all shadow-sm inline-flex items-center gap-1"
                          title="View complete seller profile, wallet, and design catalog"
                        >
                          <span className="material-symbols-outlined text-[15px]">person_search</span>
                          View Profile
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors inline-block align-middle"
                        title="Edit User Email/Password"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleUpdateStatus(user.id, user.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          user.status === 'suspended' 
                            ? 'bg-primary text-white hover:bg-primary-container' 
                            : 'bg-error-container text-error hover:bg-error hover:text-white'
                        }`}
                      >
                        {user.status === 'suspended' ? 'Re-Activate' : 'Suspend'}
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-error-container/20 transition-colors inline-block align-middle"
                        title="Delete User permanently"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant">
            <span>Showing {filteredUsers.length} users</span>
          </div>
        </div>
      )}

      {/* ── Seller Profile & Wallet Modal ────────────────────────────────────────── */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-outline-variant w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xl flex items-center justify-center border border-emerald-300 shadow-sm">
                  {selectedSeller.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-on-surface">{selectedSeller.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(selectedSeller.status)}`}>
                      {selectedSeller.status}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{selectedSeller.email} · ID: <span className="font-mono">{selectedSeller.id}</span></p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSeller(null)}
                className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Financial Wallet Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                    Seller Wallet (60%)
                  </span>
                  <p className="text-2xl font-black text-emerald-900">₹{(selectedSeller.walletBalance || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-700">Net payable to seller</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-[11px] uppercase font-bold text-blue-800 tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    Gross Sales (100%)
                  </span>
                  <p className="text-2xl font-black text-blue-900">₹{(selectedSeller.grossSales || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-blue-700">Total volume generated</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-[11px] uppercase font-bold text-purple-800 tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">savings</span>
                    Platform Fee (40%)
                  </span>
                  <p className="text-2xl font-black text-purple-900">₹{(selectedSeller.adminShare || Math.round((selectedSeller.grossSales || 0) * 0.40)).toLocaleString()}</p>
                  <p className="text-[10px] text-purple-700">Platform commission</p>
                </div>

                <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl space-y-1 shadow-2xs">
                  <span className="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                    Orders Completed
                  </span>
                  <p className="text-2xl font-black text-on-surface">{selectedSeller.totalOrders || 0}</p>
                  <p className="text-[10px] text-on-surface-variant">Total buyer purchases</p>
                </div>
              </div>

              {/* Seller Information Details */}
              <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/60 space-y-3">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Account Information</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-on-surface-variant block font-medium">Role:</span>
                    <span className="font-semibold text-on-surface capitalize">{selectedSeller.role}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block font-medium">Country:</span>
                    <span className="font-semibold text-on-surface">{selectedSeller.country || 'India'}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block font-medium">Joined Date:</span>
                    <span className="font-semibold text-on-surface">{selectedSeller.joinedAt?.split('T')[0] || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block font-medium">Account Status:</span>
                    <span className="font-semibold text-on-surface capitalize">{selectedSeller.status}</span>
                  </div>
                </div>
              </div>

              {/* Seller's Uploaded Designs Catalog */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
                    Uploaded Designs by {selectedSeller.name} ({sellerDesigns.length})
                  </h4>
                  <span className="text-xs text-on-surface-variant">Live & Pending Listings</span>
                </div>

                {isLoadingDesigns ? (
                  <div className="py-12 flex justify-center items-center">
                    <div className="w-8 h-8 border-3 border-outline-variant border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : sellerDesigns.length === 0 ? (
                  <div className="text-center py-10 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline mb-1">draw</span>
                    <p className="text-xs text-on-surface-variant">This seller has not uploaded any designs yet.</p>
                  </div>
                ) : (
                  <div className="border border-outline-variant rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-container-low font-bold text-on-surface-variant border-b border-outline-variant">
                        <tr>
                          <th className="py-3 px-4">Design</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {sellerDesigns.map((des: Design) => (
                          <tr key={des.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-md overflow-hidden bg-surface-container shrink-0 border border-outline-variant/60">
                                  {des.isBulk && !des.image ? (
                                    <div className="w-full h-full bg-red-600 text-white flex items-center justify-center">
                                      <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                                    </div>
                                  ) : (
                                    <WatermarkedImage 
                                      src={optimizeCloudinaryUrl(des.image, 'thumbnail')} 
                                      alt={des.title} 
                                      density="compact"
                                      className="w-full h-full object-cover" 
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-on-surface">{des.title}</p>
                                  <p className="text-[10px] text-on-surface-variant">{des.dimensions || 'Standard'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-on-surface-variant">{des.category}</td>
                            <td className="py-3 px-4 font-bold text-primary">₹{des.price?.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                des.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                des.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {des.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <a
                                href={`/design/${des.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-surface border border-outline-variant rounded-md text-[11px] font-semibold text-primary hover:bg-primary hover:text-white transition-all inline-flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                                View
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(selectedSeller);
                  }}
                  className="px-3.5 py-2 bg-primary/10 text-primary border border-primary/25 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit Credentials
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedSeller.id, selectedSeller.status)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                    selectedSeller.status === 'suspended'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-600 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {selectedSeller.status === 'suspended' ? 'check_circle' : 'block'}
                  </span>
                  {selectedSeller.status === 'suspended' ? 'Re-Activate Seller' : 'Suspend Seller'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSeller(null)}
                className="px-5 py-2 bg-surface text-on-surface border border-outline-variant rounded-xl text-xs font-semibold hover:bg-surface-container transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                Edit User Account
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">New Password (Optional)</label>
                <div className="relative">
                  <input
                    type={showEditPass ? 'text' : 'password'}
                    placeholder="Leave blank to keep existing password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-lg pl-3 pr-10 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="absolute right-3 top-2.5 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showEditPass ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {editPassword.trim().length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showEditConfirmPass ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={editConfirmPassword}
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-outline-variant rounded-lg pl-3 pr-10 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditConfirmPass(!showEditConfirmPass)}
                      className="absolute right-3 top-2.5 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showEditConfirmPass ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-on-surface-variant">Directly updates user password in MongoDB database upon save.</p>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Update Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

