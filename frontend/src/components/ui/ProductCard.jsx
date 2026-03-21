import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuthStore, useCartStore } from '@/context/store';
import { userAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const [isWished, setIsWished] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const price = product.price?.discounted || product.price?.base || 0;
  const original = product.price?.base || 0;
  const hasDiscount = product.price?.discounted && product.price.discounted < original;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to save items'); return; }
    try {
      await userAPI.toggleWishlist(product._id);
      setIsWished(w => !w);
      toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Something went wrong'); }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    addItem(product, { quantity: 1 });
    toast.success('Added to bag!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-ivory-warm aspect-[3/4]">
          {product.images?.length > 0 ? (
            <>
              <img
                src={product.images[imgIdx]?.url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Hover second image */}
              {product.images?.length > 1 && (
                <img
                  src={product.images[1]?.url}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-ink flex items-center justify-center">
              <span className="font-serif text-6xl text-ivory/10">SC</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isBespoke && (
              <span className="bg-gold text-ivory text-xs px-2 py-1 tracking-widest uppercase">Bespoke</span>
            )}
            {hasDiscount && (
              <span className="bg-ink text-ivory text-xs px-2 py-1 tracking-widest uppercase">
                {Math.round(((original - price) / original) * 100)}% Off
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 bg-ivory/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-ivory"
          >
            {isWished
              ? <HeartSolid className="w-4 h-4 text-gold" />
              : <HeartIcon className="w-4 h-4 text-muted" />
            }
          </button>

          {/* Quick add */}
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-0 left-0 right-0 bg-ink text-ivory py-3 text-xs tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-gold"
          >
            Quick Add
          </button>
        </div>

        {/* Info */}
        <div className="pt-3 pb-2">
          <p className="text-xs tracking-widest uppercase text-gold mb-1">{product.category?.replace(/-/g, ' ')}</p>
          <h3 className="font-serif text-base text-ink leading-snug group-hover:text-gold transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-serif text-base text-ink">₹{price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-sm text-muted line-through">₹{original.toLocaleString()}</span>
            )}
          </div>

          {/* Stars */}
          {product.ratings?.count > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-xs ${s <= Math.round(product.ratings.average) ? 'text-gold' : 'text-muted/30'}`}>★</span>
                ))}
              </div>
              <span className="text-xs text-muted">({product.ratings.count})</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
