import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Design } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export function InventoryPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'rejected'>('pending');
  const { showToast } = useNotification();

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      // Query designs filtered by status
      const response = await api.designs.getAll({ status: activeTab, limit: 50 });
      setDesigns(response.designs);
    } catch (error) {
      console.error('Failed to load inventory designs:', error);
      showToast('Failed to load listings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [activeTab]);

  const handleUpdateStatus = async (id: string, newStatus: 'active' | 'pending' | 'rejected') => {
    try {
      await api.designs.updateStatus(id, newStatus);
      showToast(`Design listing status updated to ${newStatus}`, 'success');
      fetchDesigns();
    } catch (error) {
      showToast('Failed to update design status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this design listing?')) return;
    try {
      await api.designs.delete(id);
      showToast('Design deleted permanently', 'success');
      fetchDesigns();
    } catch (error) {
      showToast('Failed to delete design', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Design Catalog Inventory</h2>
          <p className="text-sm text-on-surface-variant">Review pending creative uploads, manage the active marketplace catalog, and reject items.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-outline-variant flex gap-2 w-fit">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'pending' ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">pending_actions</span>
          Pending Approvals
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'active' ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Active Marketplace
        </button>
        <button 
          onClick={() => setActiveTab('rejected')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'rejected' ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">cancel</span>
          Rejected
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
          <span className="material-symbols-outlined text-[48px] text-outline mb-4">folder_open</span>
          <h3 className="text-lg font-bold text-on-surface mb-1">No designs found</h3>
          <p className="text-sm text-on-surface-variant">There are no designs currently marked as {activeTab}.</p>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-4 px-6">Design Details</th>
                  <th className="py-4 px-6">Designer</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Recommended Fabric</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                {designs.map(design => (
                  <tr key={design.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={design.image} 
                          alt={design.title} 
                          className="w-12 h-12 rounded object-cover bg-surface-container shrink-0" 
                        />
                        <div>
                          <p className="font-semibold text-on-surface">{design.title}</p>
                          <p className="text-[11px] text-on-surface-variant">Uploaded: {design.createdAt.split('T')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {design.designerName}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {design.category}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {design.fabric}
                    </td>
                    <td className="py-4 px-6 font-bold text-primary">
                      ${design.price}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {activeTab === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(design.id, 'active')}
                            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(design.id, 'rejected')}
                            className="px-3 py-1.5 bg-error-container text-error rounded-lg text-xs font-semibold hover:bg-error hover:text-white transition-all inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                            Reject
                          </button>
                        </>
                      )}
                      
                      {activeTab === 'rejected' && (
                        <button 
                          onClick={() => handleUpdateStatus(design.id, 'active')}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">publish</span>
                          Re-Publish
                        </button>
                      )}

                      <button 
                        onClick={() => handleDelete(design.id)}
                        className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-error-container/20 transition-colors inline-block"
                        title="Delete permanently"
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
    </div>
  );
}
