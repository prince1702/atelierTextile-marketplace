import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Reset link sent to your email');
  };

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-xl border border-outline-variant shadow-card overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 text-primary mb-4 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-[24px]">texture</span>
            <span className="font-bold text-lg">AtelierTextile</span>
          </Link>
          <h1 className="text-2xl font-bold text-on-surface mb-2">Reset Password</h1>
          <p className="text-sm text-on-surface-variant">
            {submitted 
              ? "We've sent a password reset link to your email." 
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        <div className="p-8">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Email Address</label>
                <div className="relative input-glow border border-outline-variant rounded-lg transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">mail</span>
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-transparent rounded-lg text-sm outline-none" 
                    placeholder="Enter your email" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-lg font-semibold text-sm text-white bg-primary-container hover:bg-primary transition-colors shadow-sm">
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-primary-fixed text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
              </div>
              <p className="text-sm font-medium text-on-surface mb-6">Didn't receive the email? Check your spam folder or try again.</p>
              <button onClick={() => setSubmitted(false)} className="text-primary font-semibold text-sm hover:underline">
                Try another email address
              </button>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-outline-variant bg-surface-container-lowest text-center">
          <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-container flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
