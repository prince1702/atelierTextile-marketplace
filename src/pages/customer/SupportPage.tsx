import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Ticket } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useNotification();

  // Ticket form fields
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [category, setCategory] = useState('Technical Issue');

  const fetchTickets = async () => {
    try {
      const data = await api.tickets.getMyTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      showToast('Failed to load tickets', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast('Please fill out all fields', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.tickets.create({ subject, description, priority, category });
      showToast('Support ticket raised successfully!', 'success');
      setSubject('');
      setDescription('');
      setPriority('medium');
      setCategory('Technical Issue');
      setShowCreateModal(false);
      fetchTickets();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to submit ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'low': return 'bg-surface-variant text-on-surface-variant';
      case 'medium': return 'bg-primary-fixed/30 text-primary';
      case 'high': return 'bg-secondary-fixed/50 text-secondary-container';
      case 'urgent': return 'bg-error-container text-error';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'open': return 'bg-error-container text-error';
      case 'in-progress': return 'bg-secondary-fixed text-secondary';
      case 'resolved': return 'bg-primary-fixed text-primary';
      case 'closed': return 'bg-surface-variant text-on-surface-variant';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Customer Support</h2>
          <p className="text-sm text-on-surface-variant">Raise tickets for orders, licensing issues, or technical problems.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary transition-colors shadow-sm w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Support Ticket
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
            <span className="material-symbols-outlined text-[32px]">support_agent</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">No support tickets</h3>
          <p className="text-on-surface-variant mb-6">Need help? Open a support ticket, and our team will get back to you shortly.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-container transition-colors shadow-sm"
          >
            Create Your First Ticket
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm space-y-4 hover:border-primary/20 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                    {ticket.id}
                  </span>
                  <h3 className="font-bold text-on-surface text-base">{ticket.subject}</h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-on-surface-variant px-2.5 py-0.5 rounded border border-outline-variant">
                    {ticket.category}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority} Priority
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-on-surface-variant leading-relaxed">
                {ticket.description}
              </p>

              <div className="flex justify-between items-center text-xs text-on-surface-variant pt-3 border-t border-outline-variant/30">
                <span>Created on: {ticket.createdAt.split('T')[0]}</span>
                <span className="font-semibold text-primary">{ticket.responses} response(s) from team</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Support Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-outline-variant shadow-modal w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-bold text-primary text-lg">Raise Support Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Subject</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                  placeholder="Summarize your issue..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                  >
                    <option>Technical Issue</option>
                    <option>Licensing Query</option>
                    <option>Billing Question</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                  placeholder="Describe your request or bug in detail..."
                  required
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 border border-outline-variant rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
