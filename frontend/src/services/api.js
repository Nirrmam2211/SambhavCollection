import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
});

// ─── Request Interceptor ──────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    if (error.response?.status === 403) {
      toast.error('You do not have permission to do that.');
    }
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject({ ...error, message });
  }
);

// ─── Auth ─────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data)  => API.post('/auth/register', data),
  login:          (data)  => API.post('/auth/login', data),
  logout:         ()      => API.post('/auth/logout'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail:    (token) => API.get(`/auth/verify-email/${token}`),
  getMe:          ()      => API.get('/auth/me'),
};

// ─── Products ─────────────────────────────────────────────────────
export const productAPI = {
  getAll:     (params) => API.get('/products', { params }),
  getFeatured:()       => API.get('/products/featured'),
  getBySlug:  (slug)   => API.get(`/products/${slug}`),
  create:     (data)   => API.post('/products', data),
  update:     (id, data) => API.put(`/products/${id}`, data),
  delete:     (id)     => API.delete(`/products/${id}`),
};

// ─── Orders ───────────────────────────────────────────────────────
export const orderAPI = {
  create:       (data)   => API.post('/orders', data),
  getMy:        (params) => API.get('/orders/my', { params }),
  getById:      (id)     => API.get(`/orders/${id}`),
  getAll:       (params) => API.get('/orders', { params }),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
};

// ─── Appointments ─────────────────────────────────────────────────
export const appointmentAPI = {
  getSlots:    (date)  => API.get('/appointments/slots', { params: { date } }),
  book:        (data)  => API.post('/appointments', data),
  getMy:       ()      => API.get('/appointments/my'),
  getAll:      (params)=> API.get('/appointments', { params }),
  update:      (id, data) => API.put(`/appointments/${id}`, data),
  cancel:      (id)    => API.delete(`/appointments/${id}`),
};

// ─── Payments ─────────────────────────────────────────────────────
export const paymentAPI = {
  createRazorpayOrder: (orderId) => API.post('/payments/razorpay/create-order', { orderId }),
  verifyRazorpay:      (data)    => API.post('/payments/razorpay/verify', data),
  createStripeIntent:  (orderId) => API.post('/payments/stripe/create-intent', { orderId }),
};

// ─── Users ────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:       ()     => API.get('/users/profile'),
  updateProfile:    (data) => API.put('/users/profile', data),
  updatePassword:   (data) => API.put('/users/password', data),
  updateMeasurements:(data)=> API.put('/users/measurements', data),
  addAddress:       (data) => API.post('/users/addresses', data),
  updateAddress:    (id, data) => API.put(`/users/addresses/${id}`, data),
  deleteAddress:    (id)   => API.delete(`/users/addresses/${id}`),
  toggleWishlist:   (pid)  => API.post(`/users/wishlist/${pid}`),
};

// ─── Reviews ──────────────────────────────────────────────────────
export const reviewAPI = {
  getForProduct: (productId) => API.get(`/reviews/product/${productId}`),
  create:        (data)      => API.post('/reviews', data),
  delete:        (id)        => API.delete(`/reviews/${id}`),
  approve:       (id)        => API.put(`/reviews/${id}/approve`),
};

// ─── Admin ────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard:     ()       => API.get('/admin/dashboard'),
  getUsers:         (params) => API.get('/admin/users', { params }),
  updateUser:       (id, data) => API.put(`/admin/users/${id}`, data),
  getRevAnalytics:  (params) => API.get('/admin/analytics/revenue', { params }),
};

// ─── Other ────────────────────────────────────────────────────────
export const miscAPI = {
  subscribe:   (data) => API.post('/newsletter/subscribe', data),
  contact:     (data) => API.post('/contact', data),
  uploadImages:(files)=> {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    return API.post('/upload/product', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default API;
