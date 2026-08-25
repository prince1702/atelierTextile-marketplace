import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const { sendSignupOtp, verifySignupOtp } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Handle Resend Countdown Timer
  useEffect(() => {
    let interval: any;
    if (step === 4 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  // Request OTP Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await sendSignupOtp(email);
      showToast(res.message || 'Verification code sent to your email!');
      setStep(4);
      setResendTimer(60);
      setCanResend(false);
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Error sending verification code';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      const res = await sendSignupOtp(email);
      showToast(res.message || 'A new verification code has been sent!');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Error resending OTP';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input Changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input box
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // OTP Backspace / Keydown
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // OTP Paste event
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      showToast('Please paste a valid 6-digit numeric code', 'error');
      return;
    }
    const digits = pastedData.split('');
    setOtp(digits);
    otpInputsRef.current[5]?.focus();
  };

  // Final Submit with OTP Verification
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      showToast('Please enter the full 6-digit verification code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await verifySignupOtp(name, email, password, role, fullOtp);
      showToast('Account verified and created successfully!');
      setTimeout(() => navigate(`/${role}/dashboard`), 100);
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Invalid or expired verification code';
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
          Back to TexDesigner
        </Link>
      </div>

      <main className="w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant bg-white text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <span className="material-symbols-outlined text-[24px]">texture</span>
            <span className="font-bold text-lg">TexDesigner</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-1">
            {step === 4 ? 'Verify Your Email' : 'Join TexDesigner'}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {step === 4 ? `We sent a 6-digit code to ${email}` : 'Create your account to explore premium textiles.'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="px-8 pt-8 pb-4 bg-white relative">
          <div className="absolute top-12 left-12 right-12 h-0.5 bg-outline-variant/30">
            <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          </div>
          <div className="relative flex justify-between">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center z-10">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white transition-colors duration-300 ${step >= i ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {step > i ? <span className="material-symbols-outlined text-[16px]">check</span> : <span className="text-xs font-bold">{i}</span>}
                </div>
                <span className={`mt-2 text-xs font-semibold ${step >= i ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {i === 1 ? 'Basic Info' : i === 2 ? 'Role' : i === 3 ? 'Security' : 'OTP Verify'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={step === 3 ? handleSendOtp : step === 4 ? handleVerifyAndRegister : (e) => { e.preventDefault(); handleNext(); }}>
          <div className="p-8 min-h-[300px] relative">
            
            {/* Step 1: Basic Info */}
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

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div className="space-y-4 animate-slide-in">
                <p className="text-sm text-on-surface-variant mb-4">How do you plan to use TexDesigner?</p>
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

            {/* Step 3: Password & Terms */}
            {step === 3 && (
              <div className="space-y-5 animate-slide-in">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
                  <div className="relative">
                    <input 
                      required 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full pl-4 pr-10 py-2.5 bg-white border border-outline-variant rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all" 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">Must be at least 6 characters long.</p>
                </div>
                <div className="flex items-start mt-4 gap-3">
                  <input required id="terms" type="checkbox" className="w-4 h-4 text-primary mt-0.5 cursor-pointer rounded border-outline-variant" />
                  <label htmlFor="terms" className="text-sm text-on-surface-variant cursor-pointer">
                    I agree to the <a className="text-primary hover:underline font-semibold">Terms of Service</a> and <a className="text-primary hover:underline font-semibold">Privacy Policy</a>.
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: OTP Verification Screen */}
            {step === 4 && (
              <div className="space-y-6 text-center animate-slide-in py-2">
                <div className="w-14 h-14 bg-primary-fixed/20 text-primary rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-on-surface">Enter Verification Code</h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Please check your inbox for <strong>{email}</strong> and enter the 6-digit code below.
                  </p>
                </div>

                {/* 6-Digit OTP Boxes */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 my-4">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpInputsRef.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white border-2 border-outline-variant rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="text-on-surface-variant">Didn't get the code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="font-bold text-primary hover:underline focus:outline-none"
                    >
                      Resend OTP Code
                    </button>
                  ) : (
                    <span className="font-semibold text-outline">
                      Resend code in {resendTimer}s
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-outline-variant bg-surface-container-low flex justify-between items-center">
            <button 
              type="button" 
              onClick={handleBack} 
              disabled={step === 1 || isLoading} 
              className={`px-5 py-2 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-primary-fixed/20 transition-colors flex items-center gap-1 ${(step === 1 || step === 4) ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
            </button>
            
            {step < 3 ? (
              <button type="submit" className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 shadow-sm transition-colors flex items-center gap-1">
                Continue <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : step === 3 ? (
              <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 shadow-sm transition-colors flex items-center gap-1 disabled:opacity-70">
                {isLoading ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">mail</span>}
                Send OTP Code
              </button>
            ) : (
              <button type="submit" disabled={isLoading || otp.join('').length !== 6} className="w-full sm:w-auto px-8 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                {isLoading ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">verified</span>}
                Verify & Create Account
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
