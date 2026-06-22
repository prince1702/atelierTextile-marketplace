import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Design } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';

export function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useNotification();

  const fetchListings = async () => {
    try {
      const data = await api.designs.getMyListings();
      setDesigns(data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      showToast('Failed to load listings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.designs.delete(id);
      showToast('Listing deleted successfully', 'success');
      fetchListings();
    } catch (error) {
      showToast('Failed to delete listing', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary-fixed/30 text-primary';
      case 'pending': return 'bg-surface-variant text-on-surface-variant';
      case 'rejected': return 'bg-error-container text-error';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">My Design Listings</h2>
          <p className="text-sm text-on-surface-variant">View your uploaded patterns, monitor approval status, and manage listings.</p>
        </div>
        <Link 
          to="/seller/upload"
          className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary transition-colors shadow-sm w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Upload New Design
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
            <span className="material-symbols-outlined text-[32px]">palette</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">No designs uploaded</h3>
          <p className="text-on-surface-variant mb-6">Upload your first textile pattern and make it available for licenses.</p>
          <Link 
            to="/seller/upload"
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-container transition-colors shadow-sm"
          >
            Upload Design
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-4 px-6">Design Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Fabric</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Sales</th>
                  <th className="py-4 px-6">Revenue</th>
                  <th className="py-4 px-6">Status</th>
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
                          className="w-10 h-10 rounded object-cover bg-surface-container shrink-0" 
                        />
                        <div>
                          <p className="font-semibold text-on-surface">{design.title}</p>
                          <p className="text-[11px] text-on-surface-variant">ID: {design.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">{design.category}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{design.fabric}</td>
                    <td className="py-4 px-6 font-semibold">${design.price}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{design.sales}</td>
                    <td className="py-4 px-6 font-bold text-primary">${design.revenue.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(design.status)}`}>
                        {design.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDelete(design.id)}
                        className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-error-container/20 transition-colors"
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
