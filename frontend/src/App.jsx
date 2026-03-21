import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/context/store';

// Layout
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Public pages (lazy loaded)
const Home          = lazy(() => import('@/pages/Home'));
const Shop          = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Cart          = lazy(() => import('@/pages/Cart'));
const Checkout      = lazy(() => import('@/pages/Checkout'));
const OrderSuccess  = lazy(() => import('@/pages/OrderSuccess'));
const Appointments  = lazy(() => import('@/pages/Appointments'));
const About         = lazy(() => import('@/pages/About'));
const Contact       = lazy(() => import('@/pages/Contact'));
const Login         = lazy(() => import('@/pages/Login'));
const Register      = lazy(() => import('@/pages/Register'));
const ForgotPassword= lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const VerifyEmail   = lazy(() => import('@/pages/VerifyEmail'));

// Account pages
const Account       = lazy(() => import('@/pages/Account'));
const MyOrders      = lazy(() => import('@/pages/MyOrders'));
const OrderDetail   = lazy(() => import('@/pages/OrderDetail'));
const Wishlist      = lazy(() => import('@/pages/Wishlist'));
const Measurements  = lazy(() => import('@/pages/Measurements'));
const MyAppointments= lazy(() => import('@/pages/MyAppointments'));

// Admin pages
const AdminDashboard  = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProducts   = lazy(() => import('@/pages/admin/Products'));
const AdminOrders     = lazy(() => import('@/pages/admin/Orders'));
const AdminAppointments = lazy(() => import('@/pages/admin/Appointments'));
const AdminUsers      = lazy(() => import('@/pages/admin/Users'));

// Guards
const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (!token && !user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/account" replace />;
  return children;
};

const PageLoader = () => (
  <div className="min-h-screen bg-ivory flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="font-serif text-muted italic text-lg">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'Jost', sans-serif",
              fontSize: '14px',
              background: '#0a0a0a',
              color: '#f7f2eb',
              borderRadius: '2px',
              border: '1px solid rgba(184,146,42,0.3)',
            },
            success: { iconTheme: { primary: '#b8922a', secondary: '#f7f2eb' } },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── Main Layout ──────────────────────────────── */}
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="shop/:category" element={<Shop />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />

              {/* Auth */}
              <Route path="login"           element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="register"        element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
              <Route path="verify-email/:token"   element={<VerifyEmail />} />

              {/* Protected */}
              <Route path="checkout"       element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
              <Route path="account"        element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="orders"         element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="orders/:id"     element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="wishlist"       element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="measurements"   element={<ProtectedRoute><Measurements /></ProtectedRoute>} />
              <Route path="my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
            </Route>

            {/* ── Admin Layout ─────────────────────────────── */}
            <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products"    element={<AdminProducts />} />
              <Route path="orders"      element={<AdminOrders />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="users"       element={<AdminUsers />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
