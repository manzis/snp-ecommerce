'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { Eye, EyeOff, Check, Sun, Moon } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await AuthService.signIn(email, password);
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 font-rubik transition-colors duration-300 relative overflow-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-[#fafafa] text-[#242424]'}`}>

      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-opacity duration-700 ${isDarkMode ? 'bg-[#bef264]/10' : 'bg-[#bef264]/20'}`} />
        <div className={`absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] transition-opacity duration-700 ${isDarkMode ? 'bg-[#bef264]/10' : 'bg-[#bef264]/20'}`} />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-full border transition-colors ${isDarkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#242424]/10 hover:bg-[#242424]/5 text-[#242424]'}`}
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="w-full max-w-[440px] space-y-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-[2px]">
                <div className="flex gap-[2px]">
                  <div className={`w-2 h-2 ${isDarkMode ? 'bg-white' : 'bg-[#242424]'}`} />
                  <div className={`w-2 h-2 ${isDarkMode ? 'bg-white/20' : 'bg-[#242424]/20'}`} />
                </div>
                <div className="flex gap-[2px]">
                  <div className={`w-2 h-2 ${isDarkMode ? 'bg-white/20' : 'bg-[#242424]/20'}`} />
                  <div className={`w-2 h-2 ${isDarkMode ? 'bg-white' : 'bg-[#242424]'}`} />
                </div>
              </div>
              <span className="text-[18px] font-medium">BrightSNP</span>
            </div>
            <div className={`px-3 py-1 border rounded-sm ${isDarkMode ? 'border-white/10' : 'border-[#242424]/10'}`}>
              <span className={`text-[10px] font-medium ${isDarkMode ? 'text-white/40' : 'text-[#242424]/40'}`}>Members</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-[24px] font-semibold leading-tight">Welcome Back</h1>
            <p className="text-[14px] text-[#71717a] font-medium">Sign in to continue building</p>
          </div>
        </div>

        {/* Form Section */}
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wide">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className={`w-full bg-transparent border rounded-md px-4 py-3.5 text-[14px] focus:outline-none transition-colors ${isDarkMode ? 'border-white/10 focus:border-white/40 placeholder:text-white/20 text-white' : 'border-[#242424]/20 focus:border-[#242424]/60 placeholder:text-[#242424]/30 text-[#242424]'}`}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  className={`w-full bg-transparent border rounded-md px-4 py-3.5 text-[14px] focus:outline-none transition-colors pr-12 ${isDarkMode ? 'border-white/10 focus:border-white/40 placeholder:text-white/20 text-white' : 'border-[#242424]/20 focus:border-[#242424]/60 placeholder:text-[#242424]/30 text-[#242424]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-white/30 hover:text-white/60' : 'text-[#242424]/30 hover:text-[#242424]/60'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`w-5 h-5 border transition-all duration-200 flex items-center justify-center ${rememberMe ? (isDarkMode ? 'bg-white border-white' : 'bg-[#242424] border-[#242424]') : (isDarkMode ? 'border-white/10 bg-transparent' : 'border-[#242424]/20 bg-transparent')}`}>
                  {rememberMe && <Check size={14} className={isDarkMode ? "text-black" : "text-white"} />}
                </div>
                <span className={`text-[12px] transition-colors ${isDarkMode ? 'text-[#71717a] group-hover:text-white/60' : 'text-[#71717a] group-hover:text-[#242424]/60'}`}>Remember me</span>
              </div>
              <button type="button" className={`text-[13px] font-medium transition-colors ${isDarkMode ? 'text-[#71717a] hover:text-white' : 'text-[#71717a] hover:text-[#242424]'}`}>
                Forgot Password?
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] py-3 px-4 text-center">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-medium py-3.5 text-[15px] rounded-lg transition-colors disabled:opacity-50 ${isDarkMode ? 'bg-[#f4f4f5] text-[#0a0a0a] hover:bg-white' : 'bg-[#242424] text-white hover:bg-black'}`}
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>

            <p className="text-center text-[13px] text-[#71717a]">
              Don't have an account? <button type="button" className={`hover:underline font-medium ml-1 ${isDarkMode ? 'text-white' : 'text-[#242424]'}`}>Sign Up</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

