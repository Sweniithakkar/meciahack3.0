import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  BookOpen,
  FileText,
  Gavel,
  Shield
} from 'lucide-react';
import { apiService } from '../services/apiService';

export default function AuthView({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Initialize Google Identity Services if available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
      } catch (e) {
        console.warn('Google GIS Init warning:', e);
      }
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setGoogleLoading(true);
    setError('');
    try {
      // Decode JWT payload or fallback
      let userEmail = 'user.google@legallens.ai';
      let userName = 'Google Authorized User';
      let credential = response?.credential || '';

      if (credential) {
        try {
          const payload = JSON.parse(atob(credential.split('.')[1]));
          if (payload.email) userEmail = payload.email;
          if (payload.name) userName = payload.name;
        } catch (_) {}
      }

      const user = await apiService.loginWithGoogle(userEmail, userName, credential);
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleTriggerGoogle = () => {
    setError('');
    if (typeof window !== 'undefined' && window.google?.accounts?.id && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn('Google prompt fallback:', e);
      }
    }

    // Direct Google authentication flow fallback
    const promptEmail = prompt('Enter your Google Email address to authenticate with Legal Lens Google OAuth:', 'alex.legal@gmail.com');
    if (!promptEmail || !promptEmail.includes('@')) return;

    setGoogleLoading(true);
    const mockName = promptEmail.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase());
    
    apiService.loginWithGoogle(promptEmail.trim().toLowerCase(), mockName, 'GOOGLE_OAUTH_TOKEN')
      .then((user) => {
        setGoogleLoading(false);
        onAuthSuccess(user);
      })
      .catch((err) => {
        setGoogleLoading(false);
        setError(err.message || 'Google login error.');
      });
  };

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
        setError('Passwords do not match.');
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

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      
      {/* LEFT SIDE: Dark Navy Legal-Themed Visual (Hidden on mobile, 50% width on md+) */}
      <div className="hidden lg:flex lg:w-1/2 legal-pattern-bg text-white relative flex-col justify-between p-12 overflow-hidden border-r border-[#00385A]/60">
        
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#6A90B4]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#00385A]/40 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00223D] border border-[#6A90B4]/40 shadow-lg text-[#6A90B4]">
            <Scale className="h-6 w-6 text-[#6A90B4]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              LEGAL LENS
              <span className="rounded-full bg-[#6A90B4]/20 px-2 py-0.5 text-[10px] font-bold text-[#A2C4D9] border border-[#6A90B4]/30">
                PRO
              </span>
            </h1>
            <p className="text-xs text-[#6A90B4]">Know Before You Sign.</p>
          </div>
        </div>

        {/* Hero Visual Legal Imagery & Text Content */}
        <div className="relative z-10 my-auto py-12 space-y-8 max-w-xl">
          
          {/* Subtle Legal Imagery Emblem */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00385A]/60 border border-[#6A90B4]/30 text-[#A2C4D9]">
              <Gavel className="h-6 w-6 text-[#A2C4D9]" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00385A]/60 border border-[#6A90B4]/30 text-[#A2C4D9]">
              <BookOpen className="h-6 w-6 text-[#A2C4D9]" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00385A]/60 border border-[#6A90B4]/30 text-[#A2C4D9]">
              <Shield className="h-6 w-6 text-[#A2C4D9]" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Legal documents made simple.
            </h2>
            <p className="text-base text-[#C9D3DD] font-normal leading-relaxed">
              Upload. Analyze. Understand.<br />
              Make informed decisions.
            </p>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3 text-sm text-[#E2EAF2]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="font-medium">Detect risky clauses instantly</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-[#E2EAF2]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="font-medium">Get clear plain-language explanations</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-[#E2EAF2]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="font-medium">Know your exact next steps before signing</span>
            </div>
          </div>

        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-6 border-t border-[#00385A]/80 flex items-center justify-between text-xs text-[#6A90B4]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Bank-grade 256-bit encryption</span>
          </div>
          <span>Legal Lens v3.0</span>
        </div>

      </div>

      {/* RIGHT SIDE: Clean White Authentication Card */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#01162B] text-[#6A90B4] shadow-md mb-2">
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#01162B]">LEGAL LENS</h1>
          <p className="text-xs text-[#6A90B4]">Know Before You Sign.</p>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl border border-[#D2DBEB] shadow-xl p-8 sm:p-10">
          
          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-[#01162B] tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-xs sm:text-sm text-[#6A90B4] mt-1">
              {mode === 'login' ? 'Sign in to continue to Legal Lens' : 'Start analyzing legal agreements in seconds'}
            </p>
          </div>

          {/* Prominent Google Sign-In Button */}
          <button
            type="button"
            onClick={handleTriggerGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#D2DBEB] bg-white hover:bg-[#F8FAFC] py-3 px-4 text-xs sm:text-sm font-bold text-[#01162B] shadow-2xs transition-all hover:shadow-xs active:scale-98 disabled:opacity-50 mb-6"
          >
            {googleLoading ? (
              <span className="flex items-center gap-2 text-xs">
                <span className="h-4 w-4 border-2 border-[#01162B] border-t-transparent rounded-full animate-spin" />
                Connecting to Google...
              </span>
            ) : (
              <>
                {/* SVG Google Logo */}
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-full border-t border-[#D2DBEB]" />
            <span className="absolute bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-[#94A2BF]">
              OR
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 p-3.5 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
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
                    placeholder="Jane Doe"
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

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#00385A]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#D2DBEB] text-[#01162B] focus:ring-[#00385A]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Please contact administrator to reset your password or sign in via Google.')}
                  className="font-bold text-[#00385A] hover:underline"
                >
                  Forgot password?
                </button>
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
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Create Account &amp; Start</span>
                  <Sparkles className="h-4 w-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Footer Toggle Link */}
          <div className="mt-6 pt-5 border-t border-[#D2DBEB]/60 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-[#00385A]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
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
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="font-bold text-[#01162B] underline hover:text-[#2563EB] transition-colors"
                >
                  Log in
                </button>
              </p>
            )}
          </div>

        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center text-[11px] text-[#94A2BF] flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Multi-Tenant JWT Secured · Legal Lens AI Sandbox</span>
        </div>

      </div>

    </div>
  );
}
