import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { api } from '../../services/api';

export function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (!token) {
      showToast('Invalid reset link. Please request a new one.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.auth.resetPassword(token, password);
      setIsSuccess(true);
      showToast(result.message || 'Password reset successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to reset password. The link may be expired.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-xl border border-outline-variant shadow-card overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 text-primary mb-4 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-[24px]">texture</span>
            <span className="font-bold text-lg">TexDesigner</span>
          </Link>
          <h1 className="text-2xl font-bold text-on-surface mb-2">
            {isSuccess ? 'Password Reset!' : 'Set New Password'}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {isSuccess
              ? 'Your password has been updated successfully.'
              : 'Enter your new password below.'}
          </p>
        </div>

        <div className="p-8">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  New Password
                </label>
                <div className="relative input-glow border border-outline-variant rounded-lg transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">lock</span>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-transparent rounded-lg text-sm outline-none"
                    placeholder="At least 6 characters"
                    disabled={isLoading}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary transition-colors"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  Confirm Password
                </label>
                <div className="relative input-glow border border-outline-variant rounded-lg transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">lock</span>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-transparent rounded-lg text-sm outline-none"
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                    minLength={6}
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-1.5">
                <p className="text-xs text-on-surface-variant font-medium">Password strength</p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        password.length >= level * 3
                          ? password.length >= 12
                            ? 'bg-green-500'
                            : password.length >= 8
                            ? 'bg-amber-500'
                            : 'bg-red-400'
                          : 'bg-surface-container'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {password.length === 0
                    ? 'Enter a password'
                    : password.length < 8
                    ? 'Weak — try adding more characters'
                    : password.length < 12
                    ? 'Good — consider making it longer'
                    : 'Strong password!'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm text-white bg-primary-container hover:bg-primary transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Resetting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                    Reset Password
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <p className="text-sm font-medium text-on-surface mb-2">
                Your password has been reset successfully.
              </p>
              <p className="text-sm text-on-surface-variant mb-6">
                You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm text-white bg-primary-container hover:bg-primary transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Go to Login
              </button>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-outline-variant bg-surface-container-lowest text-center">
          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-container flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Request a new reset link
          </Link>
        </div>
      </div>
    </div>
  );
}
