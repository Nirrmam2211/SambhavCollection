import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/services/api';

// ─── Auth Store ───────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.login(credentials);
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.register(userData);
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await authAPI.logout().catch(() => {});
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await authAPI.getMe();
          set({ user: data.user });
        } catch {
          set({ user: null, token: null });
          localStorage.removeItem('token');
        }
      },

      updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),

      isAdmin:  () => get().user?.role === 'admin',
      isTailor: () => ['admin', 'tailor'].includes(get().user?.role),
    }),
    { name: 'sambhav-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);

// ─── Cart Store ───────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, options = {}) => {
        set(state => {
          const existing = state.items.find(i =>
            i.product._id === product._id &&
            JSON.stringify(i.customizations) === JSON.stringify(options.customizations || {})
          );
          if (existing) {
            return {
              items: state.items.map(i =>
                i === existing ? { ...i, quantity: i.quantity + (options.quantity || 1) } : i
              ),
            };
          }
          return {
            items: [...state.items, {
              product,
              quantity: options.quantity || 1,
              isBespoke:      options.isBespoke || product.isBespoke,
              customizations: options.customizations || {},
              measurements:   options.measurements || {},
            }],
          };
        });
      },

      removeItem: (productId) =>
        set(state => ({ items: state.items.filter(i => i.product._id !== productId) })),

      updateQty: (productId, quantity) =>
        set(state => ({
          items: quantity <= 0
            ? state.items.filter(i => i.product._id !== productId)
            : state.items.map(i => i.product._id === productId ? { ...i, quantity } : i),
        })),

      clearCart: () => set({ items: [] }),

      get total() {
        return get().items.reduce((sum, i) => {
          const price = i.product.price.discounted || i.product.price.base;
          return sum + price * i.quantity;
        }, 0);
      },

      get itemCount() { return get().items.reduce((n, i) => n + i.quantity, 0); },
    }),
    { name: 'sambhav-cart' }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  cartOpen:   false,
  menuOpen:   false,
  searchOpen: false,
  toggleCart:   () => set(s => ({ cartOpen: !s.cartOpen })),
  toggleMenu:   () => set(s => ({ menuOpen: !s.menuOpen })),
  toggleSearch: () => set(s => ({ searchOpen: !s.searchOpen })),
  closeAll:     () => set({ cartOpen: false, menuOpen: false, searchOpen: false }),
}));
