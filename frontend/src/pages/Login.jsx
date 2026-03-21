// Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/context/store';
import toast from 'react-hot-toast';

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate(searchParams.get('redirect') || '/account');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-ivory grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-ink items-center justify-center relative overflow-hidden">
        <span className="font-serif font-semibold text-ivory/[0.04]" style={{ fontSize: '18rem' }}>SC</span>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-serif text-ivory text-4xl font-light mb-2">Welcome Back</p>
          <p className="font-serif italic text-gold/70 text-lg">Every stitch. Your story.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="block text-center mb-8">
            <div className="font-serif text-2xl font-semibold tracking-widest uppercase text-ink">Sambhav</div>
            <div className="text-xs tracking-[0.4em] uppercase text-gold mt-0.5">Collection</div>
          </Link>

          {searchParams.get('session') === 'expired' && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 mb-6 text-center">
              Your session expired. Please log in again.
            </div>
          )}

          <h2 className="font-serif text-2xl font-light text-ink mb-1">Sign In</h2>
          <p className="text-sm text-muted mb-8">Access your account and measurements</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">Email</label>
              <input type="email" {...register('email', { required: 'Email is required' })}
                className="w-full border border-gold/30 bg-ivory px-4 py-3 text-sm outline-none focus:border-gold transition-colors placeholder-muted/40"
                placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">Password</label>
              <input type="password" {...register('password', { required: 'Password is required' })}
                className="w-full border border-gold/30 bg-ivory px-4 py-3 text-sm outline-none focus:border-gold transition-colors placeholder-muted/40"
                placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-gold hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-ink text-ivory py-4 text-xs tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-60">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            New here?{' '}
            <Link to="/register" className="text-gold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
