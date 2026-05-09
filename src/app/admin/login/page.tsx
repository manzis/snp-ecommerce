'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { Eye, EyeOff, Check } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6 font-mono">
      <div className="w-full max-w-[440px] space-y-12">
        {/* Header Section */}
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-[2px]">
                <div className="flex gap-[2px]">
                  <div className="w-2 h-2 bg-white" />
                  <div className="w-2 h-2 bg-white/20" />
                </div>
                <div className="flex gap-[2px]">
                  <div className="w-2 h-2 bg-white/20" />
                  <div className="w-2 h-2 bg-white" />
                </div>
              </div>
              <span className="text-[18px] font-medium tracking-tight">Bright Nepcare</span>
            </div>
            <div className="px-3 py-1 border border-white/10 rounded-sm">
              <span className="text-[10px] font-bold text-white/40 tracking-[0.2em]">MEMBERS</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-[30px] font-bold tracking-tight leading-tight">Welcome Back</h1>
            <p className="text-[14px] text-[#71717a] font-light">Sign in to continue building</p>
          </div>
        </div>

        {/* Form Section */}
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-[0.1em]">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-transparent border border-white/10 px-4 py-3.5 text-[14px] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/10"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-[0.1em]">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-transparent border border-white/10 px-4 py-3.5 text-[14px] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`w-5 h-5 border transition-all duration-200 flex items-center justify-center ${rememberMe ? 'bg-white border-white' : 'border-white/10 bg-transparent'}`}>
                  {rememberMe && <Check size={14} className="text-black" />}
                </div>
                <span className="text-[12px] text-[#71717a] group-hover:text-white/60 transition-colors">Remember me</span>
              </div>
              <button type="button" className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider hover:text-white transition-colors">
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
              className="w-full bg-[#f4f4f5] text-[#0a0a0a] font-bold py-4 text-[12px] uppercase tracking-[0.2em] hover:bg-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>

            <p className="text-center text-[10px] text-[#71717a]">
              Don't have an account? <button type="button" className="text-white hover:underline uppercase font-bold tracking-wider ml-1">Sign Up</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
