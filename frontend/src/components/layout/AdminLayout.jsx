import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  ChartBarIcon, ShoppingBagIcon, UserGroupIcon,
  CubeIcon, CalendarDaysIcon, ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/context/store';

const NAV = [
  { label: 'Dashboard',    to: '/admin',              icon: ChartBarIcon },
  { label: 'Products',     to: '/admin/products',     icon: CubeIcon },
  { label: 'Orders',       to: '/admin/orders',       icon: ShoppingBagIcon },
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarDaysIcon },
  { label: 'Users',        to: '/admin/users',        icon: UserGroupIcon },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-ivory flex flex-col shrink-0">
        <Link to="/" className="px-8 py-7 border-b border-white/10">
          <div className="font-serif text-xl font-semibold tracking-widest uppercase">Sambhav</div>
          <div className="text-xs tracking-[0.3em] uppercase text-gold mt-0.5">Admin Panel</div>
        </Link>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm tracking-wide transition-colors rounded-sm ${
                  isActive ? 'bg-gold/20 text-gold' : 'text-white/50 hover:text-ivory hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-medium">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-ivory leading-none">{user?.name?.split(' ')[0]}</p>
              <p className="text-xs text-white/40 mt-0.5">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/40 hover:text-red-400 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl text-ink">Admin Dashboard</h1>
          <Link to="/" className="text-xs tracking-widest uppercase text-muted hover:text-gold transition-colors">
            ← View Store
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
