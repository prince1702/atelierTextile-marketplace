import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Design } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
import { WatermarkedImage } from '../../components/ui/WatermarkedImage';
import { optimizeCloudinaryUrl } from '../../utils/imageOptimize';

export function InventoryPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'rejected'>('pending');
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
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

  const openPreview = (design: Design) => {
    setSelectedDesign(design);
    setPreviewImage(design.image || '');
  };

  const closePreview = () => {
    setSelectedDesign(null);
    setPreviewImage('');
  };

  const handleUpdateStatus = async (id: string, newStatus: 'active' | 'pending' | 'rejected') => {
    try {
      await api.designs.updateStatus(id, newStatus);
      showToast(`Design listing status updated to ${newStatus}`, 'success');
      if (selectedDesign && selectedDesign.id === id) {
        setSelectedDesign({ ...selectedDesign, status: newStatus });
      }
      fetchDesigns();
    } catch (error: any) {
      console.error('❌ updateDesignStatus error:', error?.response?.data || error?.message || error);
      const serverMsg = error?.response?.data?.error || error?.message || 'Unknown error';
      showToast(`Failed to update design status: ${serverMsg}`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this design listing?')) return;
    try {
      await api.designs.delete(id);
      showToast('Design deleted permanently', 'success');
      if (selectedDesign && selectedDesign.id === id) {
        closePreview();
      }
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
          <p className="text-sm text-on-surface-variant">Review pending creative uploads, inspect full design specifications before approving or rejecting, and manage the active marketplace catalog.</p>
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
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                {designs.map(design => (
                  <tr key={design.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => openPreview(design)}
                          className="relative w-14 h-14 rounded-lg overflow-hidden bg-surface-container shrink-0 cursor-pointer border border-outline-variant/60 hover:opacity-90 transition-opacity"
                          title="Click to preview design"
                        >
                          {design.isBulk && !design.image ? (
                            <div className="w-full h-full bg-gradient-to-br from-red-500 to-amber-600 flex flex-col items-center justify-center text-white p-1">
                              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                              <span className="text-[8px] font-bold uppercase">PDF</span>
                            </div>
                          ) : (
                            <WatermarkedImage 
                              src={optimizeCloudinaryUrl(design.image, 'thumbnail')} 
                              alt={design.title} 
                              density="compact"
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        <div>
                          <p 
                            onClick={() => openPreview(design)}
                            className="font-semibold text-on-surface hover:text-primary cursor-pointer transition-colors"
                          >
                            {design.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {design.isBulk && (
                              <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded">BULK PDF</span>
                            )}
                            <p className="text-[11px] text-on-surface-variant">Uploaded: {design.createdAt ? String(design.createdAt).split('T')[0] : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      <span className="font-medium text-on-surface">{design.designerName}</span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      <span className="px-2.5 py-1 bg-surface-container rounded-md text-xs font-semibold">{design.category}</span>
                      {design.subcategory && (
                        <p className="text-[11px] text-on-surface-variant mt-1">{design.subcategory}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-primary">
                      ₹{design.price?.toLocaleString()}
                      {design.pdcPrice ? (
                        <p className="text-[11px] text-on-surface-variant font-normal">PDC: ₹{design.pdcPrice.toLocaleString()}</p>
                      ) : null}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      {/* View / Preview Modal Button */}
                      <button 
                        type="button"
                        onClick={() => openPreview(design)}
                        className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/25 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all shadow-sm inline-flex items-center gap-1"
                        title="View full design details & media modal"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        View
                      </button>

                      {/* Direct Live Page Link */}
                      <a
                        href={`/design/${design.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-surface text-on-surface-variant border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container hover:text-primary transition-all inline-flex items-center gap-1"
                        title="Open live customer page in new tab"
                      >
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        Live
                      </a>

                      {activeTab === 'pending' && (
                        <>
                          <button 
                            type="button"
                            onClick={() => handleUpdateStatus(design.id, 'active')}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center gap-1"
                            title="Approve design and publish to marketplace"
                          >
                            <span className="material-symbols-outlined text-[15px]">check</span>
                            Approve
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleUpdateStatus(design.id, 'rejected')}
                            className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                            title="Reject design"
                          >
                            <span className="material-symbols-outlined text-[15px]">close</span>
                            Reject
                          </button>
                        </>
                      )}
                      
                      {activeTab === 'rejected' && (
                        <button 
                          type="button"
                          onClick={() => handleUpdateStatus(design.id, 'active')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center gap-1"
                          title="Re-publish design to marketplace"
                        >
                          <span className="material-symbols-outlined text-[15px]">publish</span>
                          Re-Publish
                        </button>
                      )}

                      {activeTab === 'active' && (
                        <button 
                          type="button"
                          onClick={() => handleUpdateStatus(design.id, 'rejected')}
                          className="px-3 py-1.5 bg-amber-100 text-amber-800 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                          title="Unpublish / Move to Rejected"
                        >
                          <span className="material-symbols-outlined text-[15px]">block</span>
                          Reject
                        </button>
                      )}

                      <button 
                        type="button"
                        onClick={() => handleDelete(design.id)}
                        className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-error-container/20 transition-colors inline-block align-middle"
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

      {/* ── Admin Design Preview Modal ────────────────────────────────────────────── */}
      {selectedDesign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-outline-variant w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">preview</span>
                <div>
                  <h3 className="text-lg font-bold text-on-surface leading-tight">{selectedDesign.title}</h3>
                  <p className="text-xs text-on-surface-variant">Designer: <span className="font-semibold text-on-surface">{selectedDesign.designerName}</span> · ID: <span className="font-mono">{selectedDesign.id}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedDesign.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : selectedDesign.status === 'rejected' 
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                }`}>
                  {selectedDesign.status}
                </span>
                <button
                  onClick={closePreview}
                  className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Media Preview Column */}
                <div className="md:col-span-6 space-y-4">
                  {selectedDesign.isBulk && selectedDesign.pdfUrl ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-2">
                        <span className="material-symbols-outlined text-[36px] text-red-600">picture_as_pdf</span>
                        <h4 className="text-sm font-bold text-on-surface">Bulk PDF Catalog Mode</h4>
                        <p className="text-xs text-on-surface-variant">This design contains a bulk catalog PDF file.</p>
                        <a
                          href={selectedDesign.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          Open PDF in New Window
                        </a>
                      </div>

                      <div className="h-80 border border-outline-variant rounded-xl overflow-hidden bg-surface-container">
                        <iframe
                          src={`${selectedDesign.pdfUrl}#toolbar=0`}
                          className="w-full h-full border-none"
                          title="PDF Preview"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Main Image */}
                      <div className="h-80 rounded-xl overflow-hidden bg-surface-container border border-outline-variant relative flex items-center justify-center">
                        <WatermarkedImage 
                          src={previewImage || selectedDesign.image} 
                          alt={selectedDesign.title} 
                          density="dense"
                          className="w-full h-full object-contain" 
                        />
                      </div>

                      {/* Image Thumbnails Gallery */}
                      {(() => {
                        const allImgs = [selectedDesign.image, ...(selectedDesign.additionalImages || [])].filter(Boolean);
                        if (allImgs.length <= 1) return null;
                        return (
                          <div className="grid grid-cols-5 gap-2">
                            {allImgs.map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setPreviewImage(img)}
                                className={`h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                  previewImage === img ? 'border-primary ring-2 ring-primary/30' : 'border-outline-variant hover:border-primary/50 opacity-75'
                                }`}
                              >
                                <img src={img} alt={`Sample ${i + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Details & Specs Column */}
                <div className="md:col-span-6 space-y-4">
                  {/* Price Banner */}
                  <div className="p-4 bg-primary-fixed/20 border border-primary/20 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-bold text-primary">Standard Price</span>
                      <p className="text-2xl font-black text-primary">₹{selectedDesign.price?.toLocaleString()}</p>
                    </div>
                    {selectedDesign.pdcPrice ? (
                      <div className="text-right">
                        <span className="text-xs uppercase font-bold text-on-surface-variant">PDC / TIF Price</span>
                        <p className="text-xl font-bold text-on-surface">₹{selectedDesign.pdcPrice.toLocaleString()}</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Specifications Grid */}
                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/60 space-y-3">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Specifications & Meta</h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-on-surface-variant block font-medium">Category:</span>
                        <span className="font-semibold text-on-surface">{selectedDesign.category}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block font-medium">Subcategory:</span>
                        <span className="font-semibold text-on-surface">{selectedDesign.subcategory || 'None'}</span>
                      </div>
                      {selectedDesign.designType && (
                        <div>
                          <span className="text-on-surface-variant block font-medium">Machine / Design Type:</span>
                          <span className="font-semibold text-on-surface">{selectedDesign.designType}</span>
                        </div>
                      )}
                      {selectedDesign.designFormat && (
                        <div>
                          <span className="text-on-surface-variant block font-medium">Format:</span>
                          <span className="font-semibold text-on-surface">{selectedDesign.designFormat}</span>
                        </div>
                      )}
                      {selectedDesign.dimensions && (
                        <div>
                          <span className="text-on-surface-variant block font-medium">Dimensions / Repeat:</span>
                          <span className="font-semibold text-on-surface">{selectedDesign.dimensions}</span>
                        </div>
                      )}
                      {selectedDesign.area && (
                        <div>
                          <span className="text-on-surface-variant block font-medium">Area:</span>
                          <span className="font-semibold text-on-surface">{selectedDesign.area}</span>
                        </div>
                      )}
                      {selectedDesign.needle && (
                        <div>
                          <span className="text-on-surface-variant block font-medium">Needle:</span>
                          <span className="font-semibold text-on-surface">{selectedDesign.needle}</span>
                        </div>
                      )}
                      {selectedDesign.sareeConcept && (
                        <div>
                          <span className="text-on-surface-variant block font-medium">Concept:</span>
                          <span className="font-semibold text-on-surface">{selectedDesign.sareeConcept}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-on-surface-variant block font-medium">License:</span>
                        <span className="font-semibold text-on-surface">{selectedDesign.licenseType || 'Standard Regional'}</span>
                      </div>
                    </div>

                    {selectedDesign.colorways && selectedDesign.colorways.length > 0 && (
                      <div className="pt-2 border-t border-outline-variant/40">
                        <span className="text-on-surface-variant block font-medium text-xs mb-1">Colorways:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedDesign.colorways.map((cw, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-white border border-outline-variant rounded text-[11px] font-medium">{cw}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDesign.tags && selectedDesign.tags.length > 0 && (
                      <div className="pt-2 border-t border-outline-variant/40">
                        <span className="text-on-surface-variant block font-medium text-xs mb-1">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedDesign.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-white border border-outline-variant rounded text-[11px] text-on-surface-variant">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedDesign.description && (
                    <div className="p-3.5 bg-white border border-outline-variant/60 rounded-xl space-y-1">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Description</span>
                      <p className="text-xs text-on-surface leading-relaxed whitespace-pre-wrap">{selectedDesign.description}</p>
                    </div>
                  )}

                  {/* Public Store Link */}
                  <div className="pt-1">
                    <a
                      href={`/design/${selectedDesign.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      View in Public Customer Store
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleDelete(selectedDesign.id)}
                className="px-3.5 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete Permanently
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closePreview}
                  className="px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-xl text-xs font-semibold hover:bg-surface-container transition-colors"
                >
                  Close
                </button>

                {selectedDesign.status !== 'active' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedDesign.id, 'active')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Approve & Publish
                  </button>
                )}

                {selectedDesign.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedDesign.id, 'rejected')}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    Reject Design
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

