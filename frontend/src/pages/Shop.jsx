import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { productAPI } from '@/services/api';
import ProductCard from '@/components/ui/ProductCard';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Ethnic Fusion', value: 'ethnic-fusion' },
  { label: 'Bandhgala', value: 'bandhgala' },
  { label: 'Sherwani', value: 'sherwani' },
  { label: 'Blazer', value: 'blazer' },
  { label: 'Shirt', value: 'shirt' },
  { label: 'Kurta', value: 'kurta' },
  { label: 'Waistcoat', value: 'waistcoat' },
  { label: 'Essential Tee', value: 'tee' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

const OCCASIONS = ['wedding', 'festive', 'casual', 'corporate', 'party', 'daily'];

export default function Shop() {
  const { category: routeCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: routeCategory || searchParams.get('category') || '',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    occasion: '',
    page: 1,
  });

  useEffect(() => {
    if (routeCategory) setFilters(f => ({ ...f, category: routeCategory, page: 1 }));
  }, [routeCategory]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productAPI.getAll({
      ...filters,
      limit: 12,
    }).then(r => r.data),
    keepPreviousData: true,
  });

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="min-h-screen bg-ivory">
      {/* Page Header */}
      <div className="bg-ink text-ivory py-14 px-6 text-center">
        <p className="text-xs tracking-[0.35em] uppercase text-gold mb-3">Our Collections</p>
        <h1 className="font-serif text-4xl font-light">
          {filters.category
            ? CATEGORIES.find(c => c.value === filters.category)?.label || 'Shop'
            : 'All Collections'}
        </h1>
        {data && <p className="text-ivory/40 text-sm mt-3">{data.total} pieces available</p>}
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c.value}
                onClick={() => setFilter('category', c.value)}
                className={`px-4 py-2 text-xs tracking-widest uppercase transition-colors ${
                  filters.category === c.value
                    ? 'bg-ink text-ivory'
                    : 'border border-gold/30 text-muted hover:border-gold hover:text-ink'
                }`}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)}
              className="text-xs tracking-widest uppercase border border-gold/30 bg-ivory px-3 py-2 text-muted outline-none focus:border-gold cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 border border-gold/30 px-4 py-2 text-xs tracking-widest uppercase text-muted hover:border-gold hover:text-ink transition-colors">
              <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            className="bg-ivory-warm border border-gold/20 p-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6 overflow-hidden">
            <div>
              <label className="text-xs tracking-widest uppercase text-gold block mb-3">Occasion</label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map(o => (
                  <button key={o} onClick={() => setFilter('occasion', filters.occasion === o ? '' : o)}
                    className={`px-3 py-1.5 text-xs tracking-wide capitalize transition-colors ${
                      filters.occasion === o ? 'bg-gold text-ivory' : 'border border-gold/30 text-muted hover:border-gold'
                    }`}>{o}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-gold block mb-3">Price Range (₹)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice}
                  onChange={e => setFilter('minPrice', e.target.value)}
                  className="flex-1 border border-gold/30 bg-ivory px-3 py-2 text-sm outline-none focus:border-gold" />
                <input type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={e => setFilter('maxPrice', e.target.value)}
                  className="flex-1 border border-gold/30 bg-ivory px-3 py-2 text-sm outline-none focus:border-gold" />
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={() => setFilters({ category: '', sort: 'newest', minPrice: '', maxPrice: '', occasion: '', page: 1 })}
                className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">
                <XMarkIcon className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-ivory-warm mb-3" />
                <div className="h-3 bg-ivory-warm w-2/3 mb-2" />
                <div className="h-4 bg-ivory-warm w-full mb-1" />
                <div className="h-4 bg-ivory-warm w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="font-serif text-xl text-muted italic">Failed to load products.</p>
          </div>
        ) : data?.products?.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-muted italic mb-3">No products found.</p>
            <button onClick={() => setFilters({ category: '', sort: 'newest', minPrice: '', maxPrice: '', occasion: '', page: 1 })}
              className="text-xs tracking-widest uppercase text-gold hover:underline">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {[...Array(data.pages)].map((_, i) => (
                  <button key={i} onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                    className={`w-10 h-10 text-sm transition-colors ${
                      filters.page === i + 1 ? 'bg-ink text-ivory' : 'border border-gold/30 text-muted hover:border-gold'
                    }`}>{i + 1}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
