import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { api } from '../../services/api';

export function Profile() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  
  const [firstName, setFirstName] = useState(user?.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Textile professional focusing on premium patterns and sustainable materials.');
  
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await api.users.update(user.id, {
        name: `${firstName} ${lastName}`.trim(),
      });
      showToast('Personal information updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update personal information', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await api.users.update(user.id, { email });
      showToast('Contact email saved!', 'success');
    } catch (error) {
      showToast('Failed to update contact details', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Password changed successfully! (Demo)', 'success');
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto animate-sans">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">User Profile</h1>
        <p className="text-sm text-on-surface-variant">Manage your personal information and account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-xl border border-outline-variant p-6 flex flex-col items-center text-center shadow-sm card-lift">
            <div className="relative w-32 h-32 mb-4 group cursor-pointer rounded-full bg-primary-container text-white flex items-center justify-center text-4xl font-bold border-4 border-surface-container shadow-md select-none">
              {user.initials}
              <div className="absolute inset-0 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[28px]">photo_camera</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-primary mb-0.5">{user.name}</h3>
            <p className="text-sm text-on-surface-variant capitalize mb-1">{user.role}</p>
            <div className="flex items-center gap-1 text-xs text-surface-tint mb-4">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span>{user.country || 'Global User'}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-outline-variant p-5 shadow-sm">
            <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 border-b border-outline-variant pb-3">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              Account Status
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">Verification</span>
                <span className="bg-primary-fixed/30 text-primary text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span> Verified
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">Role</span>
                <span className="text-xs font-semibold text-on-surface capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-outline-variant p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person</span>
              Personal Information
            </h3>
            <form className="space-y-5" onSubmit={handleSavePersonal}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">First Name</label>
                  <input className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" type="text" value={firstName} onChange={e => setFirstName(e.target.value)}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Last Name</label>
                  <input className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" type="text" value={lastName} onChange={e => setLastName(e.target.value)}/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Professional Bio</label>
                <textarea className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none" rows={4} value={bio} onChange={e => setBio(e.target.value)}></textarea>
                <p className="text-xs text-on-surface-variant mt-1.5 text-right">{bio.length}/500 characters</p>
              </div>
              <div className="flex justify-end pt-2 border-t border-outline-variant">
                <button className="bg-primary-container hover:bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm" type="submit" disabled={isSaving}>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm">
              <h3 className="text-base font-bold text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">contact_page</span>
                Contact
              </h3>
              <form className="space-y-4" onSubmit={handleSaveContact}>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">mail</span>
                    <input className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" type="email" value={email} onChange={e => setEmail(e.target.value)}/>
                  </div>
                </div>
                <button className="text-sm font-semibold text-primary border border-primary hover:bg-surface-variant px-4 py-2 rounded-lg transition-colors w-full" type="submit" disabled={isSaving}>
                  Update Contact
                </button>
              </form>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm">
              <h3 className="text-base font-bold text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">security</span>
                Security
              </h3>
              <form className="space-y-4" onSubmit={handleSaveSecurity}>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Current Password</label>
                  <input className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" placeholder="••••••••" type="password"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">New Password</label>
                  <input className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" placeholder="••••••••" type="password"/>
                </div>
                <button className="text-sm font-semibold text-primary border border-primary hover:bg-surface-variant px-4 py-2 rounded-lg transition-colors w-full" type="submit">
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
