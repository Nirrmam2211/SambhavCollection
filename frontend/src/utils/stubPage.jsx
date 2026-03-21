// Shared stub for pages not yet fully implemented
export const stubPage = (title, desc = '') => () => (
  <div className="min-h-[60vh] flex items-center justify-center text-center px-6">
    <div>
      <p className="text-xs tracking-[0.35em] uppercase text-gold mb-3">Sambhav Collection</p>
      <h1 className="font-serif text-4xl font-light text-ink mb-3">{title}</h1>
      {desc && <p className="text-muted font-light">{desc}</p>}
    </div>
  </div>
);

export default stubPage;
