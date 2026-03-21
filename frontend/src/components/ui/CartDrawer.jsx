import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/context/store';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, updateQty, total } = useCartStore();
  const shipping = total >= 5000 ? 0 : 150;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-ivory z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/20">
              <div>
                <h2 className="font-serif text-xl text-ink">Your Bag</h2>
                <p className="text-xs tracking-widest uppercase text-muted mt-0.5">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
              </div>
              <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="font-serif text-6xl text-gold/20 mb-4">∅</div>
                  <p className="font-serif text-lg text-muted italic mb-2">Your bag is empty</p>
                  <p className="text-sm text-muted/60 mb-6">Discover our bespoke collections</p>
                  <Link to="/shop" onClick={onClose}
                    className="bg-ink text-ivory px-8 py-3 text-xs tracking-widest uppercase hover:bg-gold transition-colors">
                    Shop Now
                  </Link>
                </div>
              ) : (
                items.map((item, idx) => {
                  const price = item.product.price.discounted || item.product.price.base;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 py-4 border-b border-gold/10 last:border-0"
                    >
                      {/* Image */}
                      <div className="w-20 h-24 bg-ivory-warm shrink-0 overflow-hidden">
                        {item.product.images?.[0]?.url ? (
                          <img src={item.product.images[0].url} alt={item.product.name}
                            className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-ink/10 flex items-center justify-center font-serif text-2xl text-ink/20">SC</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-serif text-sm text-ink leading-snug line-clamp-2">{item.product.name}</h3>
                          <button onClick={() => removeItem(item.product._id)}
                            className="text-muted/40 hover:text-red-400 transition-colors shrink-0">
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.isBespoke && (
                          <span className="text-xs tracking-widest uppercase text-gold mt-1 block">Bespoke</span>
                        )}

                        {item.customizations?.fabric && (
                          <p className="text-xs text-muted mt-0.5">Fabric: {item.customizations.fabric}</p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity */}
                          <div className="flex items-center gap-2 border border-gold/30">
                            <button onClick={() => updateQty(item.product._id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-muted hover:text-ink hover:bg-gold/10 transition-colors">
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <button onClick={() => updateQty(item.product._id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-muted hover:text-ink hover:bg-gold/10 transition-colors">
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-serif text-base text-ink">
                            ₹{(price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gold/20 bg-ivory-warm">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-muted">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-gold">Free</span> : `₹${shipping}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted/60">Add ₹{(5000 - total).toLocaleString()} more for free shipping</p>
                  )}
                  <div className="flex justify-between font-serif text-lg text-ink pt-2 border-t border-gold/20">
                    <span>Total</span>
                    <span>₹{(total + shipping).toLocaleString()}</span>
                  </div>
                </div>
                <Link to="/checkout" onClick={onClose}
                  className="block w-full bg-ink text-ivory text-center py-4 text-xs tracking-widest uppercase hover:bg-gold transition-colors">
                  Proceed to Checkout
                </Link>
                <button onClick={onClose}
                  className="block w-full text-center mt-3 text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors py-2">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
