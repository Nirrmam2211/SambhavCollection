import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ShoppingBagIcon, UserIcon, HeartIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuthStore, useCartStore, useUIStore } from '@/context/store';
import CartDrawer from '@/components/ui/CartDrawer';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { label: 'Collections', to: '/shop' },
  { label: 'Ethnic Fusion', to: '/shop/ethnic-fusion' },
  { label: 'Bespoke', to: '/shop/bandhgala' },
  { label: 'Appointments', to: '/appointments' },
  { label: 'About', to: '/about' },
];

export default function MainLayout() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { cartOpen, menuOpen, toggleCart, toggleMenu, closeAll } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ivory font-sans">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="bg-gold text-ivory text-center py-2 text-xs tracking-widest uppercase">
        Free shipping on orders above ₹5,000 &nbsp;|&nbsp; Size-personalized bespoke tailoring
      </div>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-ivory/95 backdrop-blur-sm shadow-sm' : 'bg-ivory'} border-b border-gold/20`}>
        <nav className="max-w-screen-xl mx-auto px-6 lg:px-12 flex items-center justify-between h-18 py-4">

          {/* Left nav links (desktop) */}
          <ul className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.slice(0, 3).map(l => (
              <li key={l.to}>
                <NavLink to={l.to}
                  className={({ isActive }) =>
                    `text-xs tracking-widest uppercase transition-colors ${isActive ? 'text-gold' : 'text-muted hover:text-ink'}`
                  }>{l.label}</NavLink>
              </li>
            ))}
          </ul>

          {/* Center Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-center" onClick={closeAll}>
            <div className="font-serif text-2xl font-semibold tracking-widest uppercase text-ink leading-none">Sambhav</div>
            <div className="text-xs tracking-[0.4em] uppercase text-gold mt-0.5">Collection</div>
          </Link>

          {/* Right links + icons */}
          <div className="flex items-center gap-6">
            <ul className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.slice(3).map(l => (
                <li key={l.to}>
                  <NavLink to={l.to}
                    className={({ isActive }) =>
                      `text-xs tracking-widest uppercase transition-colors ${isActive ? 'text-gold' : 'text-muted hover:text-ink'}`
                    }>{l.label}</NavLink>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4">
              {/* User */}
              {user ? (
                <div className="relative group">
                  <button className="text-muted hover:text-ink transition-colors">
                    <UserIcon className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-ink text-ivory shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-xs text-gold tracking-widest uppercase">Hello,</p>
                      <p className="font-serif text-sm mt-0.5">{user.name.split(' ')[0]}</p>
                    </div>
                    <Link to="/account"          className="block px-4 py-2.5 text-xs tracking-wide hover:text-gold transition-colors">My Account</Link>
                    <Link to="/orders"           className="block px-4 py-2.5 text-xs tracking-wide hover:text-gold transition-colors">My Orders</Link>
                    <Link to="/measurements"     className="block px-4 py-2.5 text-xs tracking-wide hover:text-gold transition-colors">Measurements</Link>
                    <Link to="/my-appointments"  className="block px-4 py-2.5 text-xs tracking-wide hover:text-gold transition-colors">Appointments</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2.5 text-xs tracking-wide text-gold hover:text-gold-light transition-colors">Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-xs tracking-wide text-red-400 hover:text-red-300 transition-colors border-t border-white/10">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="text-muted hover:text-ink transition-colors">
                  <UserIcon className="w-5 h-5" />
                </Link>
              )}

              {/* Wishlist */}
              <Link to="/wishlist" className="text-muted hover:text-ink transition-colors hidden sm:block">
                <HeartIcon className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <button onClick={toggleCart} className="relative text-muted hover:text-ink transition-colors">
                <ShoppingBagIcon className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-ivory text-[10px] rounded-full flex items-center justify-center font-sans font-medium">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button onClick={toggleMenu} className="lg:hidden text-muted hover:text-ink transition-colors">
                {menuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-ink text-ivory overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-5">
                {NAV_LINKS.map(l => (
                  <NavLink key={l.to} to={l.to} onClick={closeAll}
                    className="text-sm tracking-widest uppercase text-ivory/70 hover:text-gold transition-colors">
                    {l.label}
                  </NavLink>
                ))}
                <div className="border-t border-white/10 pt-5 flex flex-col gap-4">
                  {user ? (
                    <>
                      <Link to="/account" onClick={closeAll} className="text-sm tracking-wide text-ivory/70 hover:text-gold">Account</Link>
                      <Link to="/orders"  onClick={closeAll} className="text-sm tracking-wide text-ivory/70 hover:text-gold">My Orders</Link>
                      <button onClick={() => { handleLogout(); closeAll(); }} className="text-left text-sm text-red-400">Logout</button>
                    </>
                  ) : (
                    <Link to="/login" onClick={closeAll} className="text-sm tracking-wide text-gold">Login / Register</Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page Content ─────────────────────────────────────── */}
      <main>
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-ink text-ivory">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div>
              <div className="font-serif text-2xl font-semibold tracking-widest uppercase mb-1">Sambhav</div>
              <div className="text-xs tracking-[0.4em] uppercase text-gold mb-5">Bespoke Collection</div>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                Handcrafted, size-personalized menswear for the modern Indian man. Mumbai Atelier.
              </p>
              <div className="flex gap-4 mt-6">
                {['Instagram', 'WhatsApp', 'Facebook'].map(s => (
                  <a key={s} href="#" className="text-xs tracking-widest uppercase text-white/30 hover:text-gold transition-colors">{s}</a>
                ))}
              </div>
            </div>

            {[
              { title: 'Collections', links: [
                { label: 'Ethnic Fusion', to: '/shop/ethnic-fusion' },
                { label: 'Bandhgala & Sherwanis', to: '/shop/bandhgala' },
                { label: 'Bespoke Blazers', to: '/shop/blazer' },
                { label: 'Premium Shirts', to: '/shop/shirt' },
                { label: 'Kurtas & Waistcoats', to: '/shop/kurta' },
              ]},
              { title: 'Services', links: [
                { label: 'Book a Fitting', to: '/appointments' },
                { label: 'Size Consultation', to: '/appointments' },
                { label: 'Track My Order', to: '/orders' },
                { label: 'Returns & Alterations', to: '/contact' },
              ]},
              { title: 'Company', links: [
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms & Conditions', to: '/terms' },
                { label: 'Shipping Policy', to: '/shipping' },
              ]},
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs tracking-[0.3em] uppercase text-gold mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-sm text-white/40 hover:text-gold transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} Sambhav Collection. All rights reserved.</p>
            <p className="font-serif italic text-gold/40 text-sm">Every stitch. Your story.</p>
            <div className="flex gap-3">
              {['Razorpay', 'UPI', 'Visa', 'Mastercard', 'COD'].map(p => (
                <span key={p} className="text-xs tracking-widest uppercase text-white/20 border border-white/10 px-2 py-1">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={toggleCart} />
    </div>
  );
}
