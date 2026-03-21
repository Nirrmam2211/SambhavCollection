import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { productAPI, miscAPI } from '@/services/api';
import ProductCard from '@/components/ui/ProductCard';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { label: 'Ethnic Fusion', slug: 'ethnic-fusion', num: '01', desc: 'Embroidered bandhgalas & sherwanis' },
  { label: 'Premium Shirts', slug: 'shirt', num: '02', desc: 'Tailored to your exact fit' },
  { label: 'Blazers', slug: 'blazer', num: '03', desc: 'Structured cuts, rich textures' },
  { label: 'Kurtas', slug: 'kurta', num: '04', desc: 'Heritage meets modernity' },
];

const TESTIMONIALS = [
  { name: 'Arjun Mehta', city: 'Mumbai', occasion: 'Embroidered Bandhgala · Wedding', body: 'Perfect fit and premium feel. The embroidery on my bandhgala was exactly what I envisioned. Got compliments all night.', rating: 5 },
  { name: 'Rohan Shah', city: 'Pune', occasion: 'Belted Blazer · Corporate', body: 'The blazer fits like nothing I\'ve ever bought off the shelf. Bespoke is the only way to go. Totally worth it.', rating: 5 },
  { name: 'Karan Patel', city: 'Delhi', occasion: 'Floral Sherwani · Engagement', body: 'Best quality at this price range. Ready in 12 days, flawless on first try. Truly bespoke craftsmanship.', rating: 5 },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  const { data: featuredData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productAPI.getFeatured().then(r => r.data),
  });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubLoading(true);
    try {
      const { data } = await miscAPI.subscribe({ email });
      toast.success(data.message);
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Subscription failed');
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="grid lg:grid-cols-2 min-h-[88vh] relative overflow-hidden">
        <div className="bg-ink flex flex-col justify-center px-8 lg:px-20 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,169,97,0.2),_transparent_55%),linear-gradient(135deg,_rgba(255,255,255,0.04),_transparent_45%)] opacity-80" />
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-gold" />
              <span className="text-xs tracking-[0.4em] uppercase text-gold">Bespoke Menswear · Mumbai</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="font-serif text-ivory leading-[1.02]"
              style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 300 }}>
              Dressed<br />to Define<br /><em className="text-gold-light font-normal italic">You.</em>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="font-serif italic text-ivory/40 text-lg mt-3 mb-6">Every stitch. Your story.</motion.p>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-sm text-ivory/50 leading-relaxed max-w-md mb-10 font-light">
              From handcrafted embroidered bandhgalas to tailored blazers — every garment is made to your exact measurements.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4">
              <Link to="/shop" className="bg-gold text-ivory px-8 py-4 text-xs tracking-widest uppercase hover:bg-gold-light transition-colors">
                Explore Collections
              </Link>
              <Link to="/appointments" className="border border-gold/40 text-ivory/70 px-8 py-4 text-xs tracking-widest uppercase hover:border-gold hover:text-ivory transition-colors">
                Book a Fitting →
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Hero right: product showcase */}
        <div className="bg-ivory-warm hidden lg:flex items-end relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif font-semibold text-[18rem] text-ink/[0.04] leading-none select-none">SC</span>
          </div>
          <div className="relative z-10 w-full">
            <div className="absolute top-6 right-6 bg-gold text-ivory px-4 py-3 text-center">
              <div className="font-serif text-2xl font-light">17+</div>
              <div className="text-xs tracking-widest uppercase mt-0.5 opacity-80">Measurements</div>
            </div>
            <div className="absolute bottom-8 left-8 bg-ink text-ivory px-5 py-4">
              <div className="text-xs tracking-widest uppercase text-gold mb-1">New Arrival</div>
              <div className="font-serif text-base">Ethnic Fusion Collection</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────── */}
      <div className="bg-gold overflow-hidden py-3 border-y border-gold-dark">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].flatMap(() =>
            ['Embroidered Bandhgala', 'Floral Sherwani', 'Bespoke Blazers', 'Size Personalized', 'Ethnic Fusion', 'Premium Handcraft', 'Mumbai Atelier', 'Free Alterations'].map((t, i) => (
              <span key={`${t}-${i}`} className="text-ivory/90 text-xs tracking-[0.3em] uppercase px-8 after:content-['◆'] after:ml-8 after:opacity-50 after:text-[8px]">{t}</span>
            ))
          )}
        </div>
      </div>

      {/* ── BESPOKE PROCESS ───────────────────────────────── */}
      <section className="bg-ink py-24 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-serif font-semibold text-[14rem] text-ivory/[0.02] leading-none">BESPOKE</span>
        </div>
        <div className="max-w-screen-xl mx-auto relative">
          <div className="mb-12">
            <p className="text-xs tracking-[0.35em] uppercase text-gold mb-3">Our Process</p>
            <h2 className="font-serif text-ivory font-light" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>
              Crafted in 4 steps,<br /><em className="italic text-gold-light">fitted for a lifetime.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-gold/20">
            {[
              { n: '01', title: 'Consultation', desc: 'Visit our Mumbai atelier. Share your vision, occasion, and style preferences.' },
              { n: '02', title: 'Measurement', desc: '17+ precision measurements taken. Every contour accounted for.' },
              { n: '03', title: 'Crafting', desc: 'Hand-selected fabrics, expert embroidery, meticulous construction.' },
              { n: '04', title: 'Final Fitting', desc: 'Try on your piece. Adjustments until it fits like it was born on you.' },
            ].map((step, i) => (
              <motion.div key={step.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-8 border-r border-gold/10 last:border-r-0">
                <div className="font-serif text-5xl font-light text-gold opacity-30 mb-5">{step.n}</div>
                <h3 className="font-serif text-ivory text-lg mb-3">{step.title}</h3>
                <p className="text-sm text-ivory/40 leading-relaxed font-light">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-xs tracking-[0.35em] uppercase text-gold mb-3">Shop By Category</p>
          <h2 className="font-serif font-light mb-12" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>
            Curated for every occasion.
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`/shop/${cat.slug}`}
                  className={`block aspect-[3/4] relative overflow-hidden group ${i === 1 ? 'bg-ink' : 'bg-ivory-warm'}`}>
                  <div className="absolute top-4 right-4 font-serif text-[5rem] font-light leading-none opacity-[0.06]">{cat.label[0]}</div>
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <span className="text-xs tracking-[0.25em] uppercase text-gold mb-2">{cat.num}</span>
                    <h3 className={`font-serif text-lg ${i === 1 ? 'text-ivory' : 'text-ink'} group-hover:text-gold transition-colors`}>{cat.label}</h3>
                    <p className={`text-xs mt-1 ${i === 1 ? 'text-ivory/50' : 'text-muted'}`}>{cat.desc}</p>
                    <span className={`text-lg mt-3 ${i === 1 ? 'text-gold' : 'text-gold'} group-hover:translate-x-1 transition-transform inline-block`}>→</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────── */}
      {featuredData?.products?.length > 0 && (
        <section className="py-24 px-6 lg:px-12 bg-ivory-warm">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs tracking-[0.35em] uppercase text-gold mb-3">Featured</p>
                <h2 className="font-serif font-light" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Straight from the atelier.</h2>
              </div>
              <Link to="/shop" className="text-xs tracking-widest uppercase text-muted hover:text-gold transition-colors hidden sm:block">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredData.products.slice(0, 8).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SIZE PERSONALIZATION ──────────────────────────── */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-4 relative">
            <div className="absolute -top-4 -right-4 bg-gold text-ivory p-5 text-center">
              <div className="font-serif text-3xl font-light">17+</div>
              <div className="text-xs tracking-widest uppercase mt-0.5 opacity-80">Measurements</div>
            </div>
            {[
              { n: '①', label: 'Chest & Shoulder Width', val: 'Precision cut to ± 0.5cm accuracy' },
              { n: '②', label: 'Sleeve Length & Torso', val: 'Natural posture mapping for perfect drape' },
              { n: '③', label: 'Neck, Waist & Hip', val: 'Contour fitting for a flattering silhouette' },
              { n: '④', label: 'Free Alterations', val: 'Unlimited adjustments until it\'s perfect' },
            ].map(m => (
              <div key={m.n} className="flex gap-4 items-start bg-ivory-warm p-4 border-l-2 border-gold">
                <span className="font-serif text-2xl text-gold font-light w-8 shrink-0">{m.n}</span>
                <div>
                  <div className="text-xs tracking-widest uppercase text-muted">{m.label}</div>
                  <div className="text-sm text-ink mt-0.5">{m.val}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-gold mb-3">Size Personalization</p>
            <h2 className="font-serif font-light mb-5" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)' }}>
              Made for <em className="italic text-gold">your body,</em><br />not a mannequin.
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-6 font-light">
              Every garment at Sambhav is crafted exclusively to your measurements. No standard sizes, no compromises. Whether you're dressing for a wedding or a boardroom — you'll wear it like it was born on you.
            </p>
            <ul className="space-y-3 mb-8">
              {['17+ precision measurements per garment', 'In-store fitting at our Mumbai atelier', 'Fabric & design consultation included', 'Adjustments at every stage', 'Ready in 10–15 working days'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-muted">
                  <span className="text-gold text-xs">◆</span>{f}
                </li>
              ))}
            </ul>
            <Link to="/appointments" className="inline-block bg-ink text-ivory px-8 py-4 text-xs tracking-widest uppercase hover:bg-gold transition-colors">
              Book Your Fitting Session
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-ivory-warm">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-xs tracking-[0.35em] uppercase text-gold mb-3">Client Stories</p>
          <h2 className="font-serif font-light mb-12" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Worn at life's finest moments.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-ivory p-8 border-b-2 border-gold">
                <div className="font-serif text-5xl text-gold/20 leading-none mb-4">"</div>
                <p className="font-serif italic text-ink text-base leading-relaxed mb-5 font-light">"{t.body}"</p>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, s) => <span key={s} className="text-gold text-sm">★</span>)}
                </div>
                <p className="text-xs tracking-widest uppercase text-muted">— {t.name}, {t.city}</p>
                <p className="text-xs text-gold italic mt-1">{t.occasion}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="bg-ink py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-serif font-semibold text-ivory/[0.025] leading-none select-none" style={{ fontSize: '16rem' }}>SAMBHAV</span>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.35em] uppercase text-gold mb-5">Begin Your Journey</p>
          <h2 className="font-serif text-ivory font-light mb-4" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Your perfect garment<br /><em className="italic text-gold-light">is one fitting away.</em>
          </h2>
          <p className="text-sm text-ivory/40 mb-10 font-light leading-relaxed max-w-md mx-auto">
            Walk into our Mumbai atelier. Walk out with a garment made entirely for you. No templates. No compromises.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/appointments" className="bg-gold text-ivory px-10 py-4 text-xs tracking-widest uppercase hover:bg-gold-light transition-colors">
              Book a Fitting Session
            </Link>
            <Link to="/shop" className="border border-gold/40 text-ivory/70 px-10 py-4 text-xs tracking-widest uppercase hover:border-gold hover:text-ivory transition-colors">
              View Collection
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────── */}
      <section className="py-16 px-6 bg-ivory-warm border-t border-gold/15">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs tracking-[0.35em] uppercase text-gold mb-3">Inner Circle</p>
          <h3 className="font-serif text-2xl font-light text-ink mb-2">Get early access to new collections</h3>
          <p className="text-sm text-muted mb-6 font-light">Join our newsletter. No spam, only bespoke stories.</p>
          <form onSubmit={handleSubscribe} className="flex gap-0">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 bg-ivory border border-gold/30 px-4 py-3.5 text-sm text-ink placeholder-muted/50 outline-none focus:border-gold transition-colors" />
            <button type="submit" disabled={subLoading}
              className="bg-ink text-ivory px-6 py-3.5 text-xs tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-60">
              {subLoading ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
