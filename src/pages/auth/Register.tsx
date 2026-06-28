import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      await register(name, email, password, role);
      showToast('Account created successfully!');
      setTimeout(() => navigate(`/${role}/dashboard`), 100);
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Error creating account';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mb-4">
        <Link to="/" className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to AtelierTextile
        </Link>
      </div>

      <main className="w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant bg-white text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <span className="material-symbols-outlined text-[24px]">texture</span>
            <span className="font-bold text-lg">AtelierTextile</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-1">Join Atelier</h1>
          <p className="text-sm text-on-surface-variant">Create your account to explore premium textiles.</p>
        </div>

        {/* Progress Indicator */}
        <div className="px-8 pt-8 pb-4 bg-white relative">
          <div className="absolute top-12 left-12 right-12 h-0.5 bg-outline-variant/30">
            <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          </div>
          <div className="relative flex justify-between">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center z-10">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white transition-colors duration-300 ${step >= i ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {step > i ? <span className="material-symbols-outlined text-[16px]">check</span> : <span className="text-xs font-bold">{i}</span>}
                </div>
                <span className={`mt-2 text-xs font-semibold ${step >= i ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {i === 1 ? 'Basic Info' : i === 2 ? 'Role' : 'Security'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          <div className="p-8 min-h-[300px] relative">
            
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5 animate-slide-in">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Full Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all" placeholder="Jane Doe" type="text" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Email Address</label>
                  <input required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all" placeholder="jane@example.com" type="email" />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4 animate-slide-in">
                <p className="text-sm text-on-surface-variant mb-4">How do you plan to use AtelierTextile?</p>
                <label className="relative block cursor-pointer group">
                  <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} className="peer sr-only" />
                  <div className="p-4 bg-white border-2 border-outline-variant rounded-xl peer-checked:border-primary peer-checked:bg-primary-fixed/10 hover:shadow-md transition-all flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${role === 'customer' ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}>
                      <span className="material-symbols-outlined">shopping_bag</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface">Customer / Buyer</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">I want to discover and purchase premium textiles.</p>
                    </div>
                  </div>
                </label>
                <label className="relative block cursor-pointer group">
                  <input type="radio" name="role" value="seller" checked={role === 'seller'} onChange={() => setRole('seller')} className="peer sr-only" />
                  <div className="p-4 bg-white border-2 border-outline-variant rounded-xl peer-checked:border-primary peer-checked:bg-primary-fixed/10 hover:shadow-md transition-all flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${role === 'seller' ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}>
                      <span className="material-symbols-outlined">storefront</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface">Designer / Seller</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">I want to showcase and sell my textile creations.</p>
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5 animate-slide-in">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
                  <input required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all" placeholder="••••••••" type="password" />
                  <p className="text-xs text-on-surface-variant mt-2">Must be at least 8 characters long.</p>
                </div>
                <div className="flex items-start mt-4 gap-3">
                  <input required id="terms" type="checkbox" className="w-4 h-4 text-primary mt-0.5 cursor-pointer rounded border-outline-variant" />
                  <label htmlFor="terms" className="text-sm text-on-surface-variant cursor-pointer">
                    I agree to the <a className="text-primary hover:underline font-semibold">Terms of Service</a> and <a className="text-primary hover:underline font-semibold">Privacy Policy</a>.
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-outline-variant bg-surface-container-low flex justify-between items-center">
            <button type="button" onClick={handleBack} disabled={step === 1} className={`px-5 py-2 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-primary-fixed/20 transition-colors flex items-center gap-1 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
            </button>
            
            {step < 3 ? (
              <button type="submit" className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 shadow-sm transition-colors flex items-center gap-1">
                Continue <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 shadow-sm transition-colors flex items-center gap-1 disabled:opacity-70">
                {isLoading ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">check</span>}
                Create Account
              </button>
            )}
          </div>
        </form>

        <div className="px-8 py-4 bg-surface-container-lowest text-center border-t border-outline-variant">
          <p className="text-sm text-on-surface-variant">
            Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
