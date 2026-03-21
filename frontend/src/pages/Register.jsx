import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/context/store';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await registerUser({ name: data.name, email: data.email, phone: data.phone, password: data.password });
      toast.success('Account created! Welcome to Sambhav.');
      navigate('/account');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center mb-8">
          <div className="font-serif text-2xl font-semibold tracking-widest uppercase text-ink">Sambhav</div>
          <div className="text-xs tracking-[0.4em] uppercase text-gold mt-0.5">Collection</div>
        </Link>
        <h2 className="font-serif text-2xl font-light text-ink mb-1">Create Account</h2>
        <p className="text-sm text-muted mb-8">Join the Sambhav inner circle</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', rules: { required: 'Name is required' } },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', rules: { required: 'Email is required' } },
            { name: 'phone', label: 'Mobile Number', type: 'tel', placeholder: '98765 43210', rules: {} },
            { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', rules: { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } } },
            { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', rules: { validate: v => v === watch('password') || 'Passwords do not match' } },
          ].map(f => (
            <div key={f.name}>
              <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">{f.label}</label>
              <input type={f.type} {...register(f.name, f.rules)} placeholder={f.placeholder}
                className="w-full border border-gold/30 bg-ivory px-4 py-3 text-sm outline-none focus:border-gold transition-colors placeholder-muted/40" />
              {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name].message}</p>}
            </div>
          ))}
          <button type="submit" disabled={isLoading}
            className="w-full bg-ink text-ivory py-4 text-xs tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-60">
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
