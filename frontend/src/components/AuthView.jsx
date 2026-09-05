import React, { useState } from 'react';
import { Scale, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function AuthView({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your confirm password.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const newUser = await apiService.registerUser(name.trim(), email.trim(), password);
        onAuthSuccess(newUser);
      } else {
        const user = await apiService.loginUser(email.trim(), password);
        onAuthSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC] text-[#01162B] px-4 py-12 relative overflow-hidden">
      
      {/* Background Subtle Ambient Highlights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#6A90B4]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#00385A]/10 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#01162B] text-white shadow-xl mb-4 transform hover:scale-105 transition-transform">
          <Scale className="h-7 w-7 text-[#6A90B4]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#01162B] flex items-center justify-center gap-2">
          LEGAL LENS
          <span className="rounded-full bg-[#6A90B4]/15 px-2.5 py-0.5 text-xs font-bold text-[#00385A]">
            PRO
          </span>
        </h1>
        <p className="text-sm font-medium text-[#6A90B4] mt-1">
          Know Before You Sign · AI Legal Contract Sandbox
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#D2DBEB]/80 shadow-xl p-8 relative z-10">
        
        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-[#F0F4F8] p-1.5 mb-6 border border-[#D2DBEB]/60">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-[#01162B] text-white shadow-xs'
                : 'text-[#00385A] hover:text-[#01162B]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-[#01162B] text-white shadow-xs'
                : 'text-[#00385A] hover:text-[#01162B]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 p-3.5 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#01162B] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A2BF]" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#D2DBEB] bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00385A] text-[#01162B] transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#01162B] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A2BF]" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#D2DBEB] bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00385A] text-[#01162B] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#01162B] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A2BF]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#D2DBEB] bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00385A] text-[#01162B] transition-all"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#01162B] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A2BF]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#D2DBEB] bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00385A] text-[#01162B] transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#01162B] hover:bg-[#00385A] py-3 px-4 text-xs font-bold text-white shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <span>Log In to Legal Lens</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Create Account & Start</span>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Text */}
        <div className="mt-6 pt-5 border-t border-[#D2DBEB]/60 text-center">
          {mode === 'login' ? (
            <p className="text-xs text-[#00385A]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="font-bold text-[#01162B] underline hover:text-[#2563EB] transition-colors"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#00385A]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-[#01162B] underline hover:text-[#2563EB] transition-colors"
              >
                Log in
              </button>
            </p>
          )}
        </div>

      </div>

      {/* Security Disclaimer */}
      <div className="mt-8 text-center text-[11px] text-[#94A2BF] flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>JWT Encrypted Session · Multi-Tenant Isolated Sandbox</span>
      </div>

    </div>
  );
}
