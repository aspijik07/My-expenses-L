import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoginScreen: React.FC = () => {
  const { login, authCredentials } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);

      if (res.success) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF85A1', '#FFC2D1', '#9D84B7', '#06D6A0'],
        });
      } else {
        setError(res.error || 'Invalid credentials');
      }
    }, 300);
  };

  const handleFillDemo = () => {
    setUsername(authCredentials.username);
    setPassword(authCredentials.password);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF5F7] to-[#F8F4FF] dark:from-[#0B1120] dark:via-[#131B2E] dark:to-[#0B1120] transition-colors selection:bg-pink-400 selection:text-white">
      {/* Decorative background glow circles */}
      <div className="fixed top-12 -left-12 w-72 h-72 rounded-full bg-pink-400/20 blur-3xl pointer-events-none" />
      <div className="fixed bottom-12 -right-12 w-80 h-80 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md glass-card rounded-3xl p-6 sm:p-10 border border-pink-200/60 dark:border-slate-800 shadow-2xl animate-fadeIn">
        {/* Top Brand Logo */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-400 via-rose-300 to-purple-400 text-white flex items-center justify-center shadow-md shadow-pink-300/40 transform hover:scale-105 transition-transform">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>

          <div>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-400/20">
              <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
              <span>She Budget Edition</span>
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
              Welcome Back ✨
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Sign in to manage your personal expenses, train tickets, and budget in Moroccan Dirhams (DH).
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="e.g., shebudget"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-400/20 text-slate-900 dark:text-white shadow-xs transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-2xl text-xs sm:text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-400/20 text-slate-900 dark:text-white shadow-xs transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-pink-500 focus:ring-pink-400"
              />
              <span>Remember on this phone</span>
            </label>

            <button
              type="button"
              onClick={handleFillDemo}
              className="text-pink-500 hover:text-pink-600 font-bold hover:underline"
            >
              Fill Credentials
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 hover:opacity-95 shadow-md shadow-pink-300/30 transition-all flex items-center justify-center space-x-2 mt-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to Budget'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Credentials Info Note */}
        <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800 text-center space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Default Access Key:
          </p>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-300 text-[11px] font-mono font-bold">
            <span>@{authCredentials.username}</span>
            <span>•</span>
            <span>{authCredentials.password}</span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1">
            (You can easily customize your username & password in Settings)
          </p>
        </div>
      </div>
    </div>
  );
};
