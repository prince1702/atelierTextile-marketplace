import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { User } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

export function UserManagement() {
  const [userList, setUserList] = useState<User[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useNotification();
  const { user: currentUser, updateUserSession } = useAuth();

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
      fetchUsers();
    } catch (error) {
      showToast('Failed to delete user account', 'error');
    }
  };

  const filteredUsers = userList.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary-fixed/30 text-primary';
      case 'pending': return 'bg-surface-variant text-on-surface-variant';
      case 'suspended': return 'bg-error-container text-error';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary';
      case 'pending': return 'bg-outline';
      case 'suspended': return 'bg-error';
      default: return 'bg-outline';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in animate-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">User Management</h2>
          <p className="text-sm text-on-surface-variant">Manage registered accounts and update credentials directly.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-outline-variant bg-white rounded-lg px-4 py-2 text-sm text-on-surface font-semibold focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="seller">Sellers</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm select-none">
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize font-medium text-on-surface-variant">{user.role}</span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">{user.joinedAt?.split('T')[0] || 'N/A'}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{user.country || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(user.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(user.status)}`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors inline-block"
                        title="Edit User Email/Password"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button 
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
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-error-container/20 transition-colors inline-block"
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
