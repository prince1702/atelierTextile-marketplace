import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { User } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export function UserManagement() {
  const [userList, setUserList] = useState<User[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useNotification();

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
          <p className="text-sm text-on-surface-variant">Manage all registered accounts across the platform.</p>
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
    </div>
  );
}
