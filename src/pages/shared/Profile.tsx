import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { api } from '../../services/api';

export function Profile() {
  const { user, updateUserSession } = useAuth();
  const { showToast } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState(user?.name ? user.name.split(' ').slice(1).join(' ') : '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Textile professional focusing on premium patterns and sustainable materials.');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [upiId, setUpiId] = useState(user?.payoutDetails?.upiId || '');
  const [gpayNumber, setGpayNumber] = useState(user?.payoutDetails?.gpayNumber || '');
  const [accountHolderName, setAccountHolderName] = useState(user?.payoutDetails?.accountHolderName || user?.name || '');
  const [isSavingPayout, setIsSavingPayout] = useState(false);

  const handleSavePayoutDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingPayout(true);
    try {
      const updatedDetails = await api.payouts.updateDetails({
        upiId: upiId.trim(),
        gpayNumber: gpayNumber.trim(),
        accountHolderName: accountHolderName.trim(),
      });
      updateUserSession({
        ...user,
        payoutDetails: updatedDetails,
      });
      showToast('Payment & Payout details saved successfully! Admin will use these for end-of-month settlements.', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to save payout details', 'error');
    } finally {
      setIsSavingPayout(false);
    }
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const updated = await api.users.update(user.id, {
        name: `${firstName} ${lastName}`.trim(),
      });
      updateUserSession(updated);
      showToast('Personal information updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update personal information', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const updated = await api.users.update(user.id, { email });
      updateUserSession(updated);
      showToast('Contact email updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update contact details', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await api.auth.changePassword(newPassword.trim(), currentPassword.trim() || undefined);
      showToast('Password updated directly in database! You can log in with your new password.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update password', 'error');
    } finally {
      setIsSaving(false);
    }
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
          {/* Payout & Payment Settings for Sellers and Admins */}
          {(user.role === 'seller' || user.role === 'admin') && (
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-3 border-b border-emerald-100">
                <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[22px]">payments</span>
                  Monthly Payout & UPI Settings
                </h3>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
                  Seller Payments
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                Provide your <strong>UPI ID</strong> or <strong>Google Pay Phone Number</strong>. Platform Admins use these details to transfer your 60% wallet earnings at the end of each month.
              </p>
              <form className="space-y-4" onSubmit={handleSavePayoutDetails}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      UPI ID (Google Pay / PhonePe / Paytm / Bank UPI)
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-emerald-600 text-[18px]">qr_code_2</span>
                      <input 
                        className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all" 
                        type="text" 
                        placeholder="e.g. yourname@oksbi / name@paytm" 
                        value={upiId} 
                        onChange={e => setUpiId(e.target.value)}
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
                        className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all" 
                        type="text" 
                        placeholder="e.g. +91 9876543210" 
                        value={gpayNumber} 
                        onChange={e => setGpayNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Account / Beneficiary Name (Optional)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">person</span>
                    <input 
                      className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all" 
                      type="text" 
                      placeholder="Account holder name as per bank records" 
                      value={accountHolderName} 
                      onChange={e => setAccountHolderName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-emerald-100">
                  <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${upiId || gpayNumber ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
                    {upiId || gpayNumber ? 'Payout method active' : 'Please provide at least one payment method'}
                  </span>
                  <button 
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm" 
                    type="submit" 
                    disabled={isSavingPayout}
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    {isSavingPayout ? 'Saving...' : 'Save Payout Details'}
                  </button>
                </div>
              </form>
            </div>
          )}

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
                Contact Email
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
                  Update Email
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
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-outline-variant rounded-lg pl-4 pr-10 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                      placeholder="••••••••" 
                      type={showCurrentPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showCurrentPass ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-outline-variant rounded-lg pl-4 pr-10 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                      placeholder="••••••••" 
                      type={showNewPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showNewPass ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-outline-variant rounded-lg pl-4 pr-10 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                      placeholder="••••••••" 
                      type={showConfirmPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-2.5 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showConfirmPass ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <button className="text-sm font-semibold text-primary border border-primary hover:bg-surface-variant px-4 py-2 rounded-lg transition-colors w-full" type="submit" disabled={isSaving}>
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
