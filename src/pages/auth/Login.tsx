import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // Wait for login to set user context, then redirect
      showToast('Welcome back to AtelierTextile!');
      // Navigate is handled by ProtectedRoute once auth state updates, 
      // but we can force it here for UX flow.
      setTimeout(() => navigate('/profile'), 100);
    } catch (error) {
      showToast('Invalid credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-background antialiased flex">
      {/* Left Split: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-low overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAz-90FoD2S-AAro6ABtA6TO8W6FnsGPuRsMzSKKnnofDsAbC2T8S4fFXthKxBsUlhRKz5RFnAmc6137lZ7Yn305g24uiGv9MMC0ZzybOpEGROkBnKUH_x6u9M5HSiJQKfcWxp2lmJfQ-pTTSh51LB-mOmpEs4kGGQHCpeB3EQjM02mX5lp5Z4uNJLJNH35fUmRk1FpUaqz2MO45yydNPhroFvw5tUIka07EZFg8pQTP6-Rwb4CNhAu9eb86eM3z4VXN4wLVjvOtWU')" }}></div>
        <div className="absolute inset-0 bg-primary/40 z-10 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent z-10"></div>
        <div className="relative z-20 p-10 text-white max-w-lg mt-auto mb-10 animate-fade-up">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[24px]">texture</span>
            <span className="font-bold text-lg">AtelierTextile</span>
          </div>
          <h2 className="text-5xl font-bold mb-4 leading-tight">Weave Your<br/>Success.</h2>
          <p className="text-lg text-white/90 leading-relaxed">Join the premier destination for high-end textile design. Discover, source, and collaborate with leading artisans globally.</p>
        </div>
      </div>

      {/* Right Split: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10 bg-surface-container-lowest relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/30 rounded-bl-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-container/10 rounded-tr-full blur-3xl -z-10"></div>

        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center lg:text-left">
            <Link to="/" className="flex items-center justify-center lg:justify-start gap-2 mb-4 text-primary hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-[28px]">texture</span>
              <h1 className="text-2xl font-bold">AtelierTextile</h1>
            </Link>
            <p className="text-sm text-on-surface-variant">Welcome back. Please enter your details.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 bg-white p-8 rounded-xl shadow-card transition-shadow duration-200 hover:shadow-card-hover border border-outline-variant/30">
            {/* Demo Notice */}
            <div className="bg-surface-container p-3 rounded-lg border border-outline-variant mb-4">
              <p className="text-xs font-semibold text-primary mb-1">Demo Accounts:</p>
              <ul className="text-xs text-on-surface-variant space-y-0.5 ml-2 list-disc">
                <li>admin@atelier.com</li>
                <li>seller@atelier.com</li>
                <li>customer@atelier.com</li>
              </ul>
              <p className="text-xs text-on-surface-variant mt-1 italic">Any password works</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="email">Email Address</label>
              <div className="relative input-glow border border-outline-variant rounded-lg transition-all duration-200 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">mail</span>
                </div>
                <input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent rounded-lg text-sm text-on-surface focus:outline-none placeholder-on-surface-variant/50" 
                  placeholder="Enter your email" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="password">Password</label>
              <div className="relative input-glow border border-outline-variant rounded-lg transition-all duration-200 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">lock</span>
                </div>
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-transparent rounded-lg text-sm text-on-surface focus:outline-none placeholder-on-surface-variant/50" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary border-outline-variant rounded cursor-pointer" />
                <label htmlFor="remember-me" className="text-sm text-on-surface-variant cursor-pointer">Remember Me</label>
              </div>
              <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-container transition-colors">Forgot Password?</Link>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm text-white bg-primary-container hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?
              <Link to="/register" className="font-semibold text-primary hover:text-primary-container transition-colors ml-1">Register here</Link>
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-on-surface-variant hover:text-primary flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
