import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, miscAPI } from '@/services/api';
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => productAPI.getAll({ limit: 100, all: true }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries(['admin', 'products']);
    },
    onError: (err) => toast.error(err.message),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingProduct 
      ? productAPI.update(editingProduct._id, data)
      : productAPI.create(data),
    onSuccess: () => {
      toast.success(`Product ${editingProduct ? 'updated' : 'created'}`);
      setIsFormOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries(['admin', 'products']);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center italic text-muted">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-ink">Products Management</h2>
        <button 
          onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
          className="bg-gold text-ivory px-4 py-2 text-xs tracking-widest uppercase flex items-center gap-2 hover:bg-gold-light transition-colors"
        >
          <PlusIcon className="w-4 h-4" /> Add New Product
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-muted font-normal">Product</th>
              <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-muted font-normal">Category</th>
              <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-muted font-normal">Price</th>
              <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-muted font-normal">Stock</th>
              <th className="text-right px-6 py-4 text-xs tracking-widest uppercase text-muted font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {productsData?.products?.map(p => (
              <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name} className="w-10 h-10 object-cover bg-ivory-warm border border-gray-100" />
                    <div>
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-muted truncate max-w-[200px]">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted capitalize">{p.category?.replace(/-/g, ' ')}</td>
                <td className="px-6 py-4 font-serif text-ink">₹{p.price?.base?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {p.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleEdit(p)} className="text-gold hover:text-gold-dark transition-colors">
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-600 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <ProductForm 
          product={editingProduct} 
          onClose={() => setIsFormOpen(false)} 
          onSave={(data) => saveMutation.mutate(data)}
          isLoading={saveMutation.isLoading}
        />
      )}
    </div>
  );
}

function ProductForm({ product, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState(product || {
    name: '', category: '', sku: '',
    price: { base: 0, discounted: 0 },
    stock: 0, description: '', 
    isBespoke: true, isFeatured: false, isPublished: true,
    images: []
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      toast.loading('Uploading images...');
      const { data } = await miscAPI.uploadImages(files);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...data.images] }));
      toast.dismiss();
      toast.success('Images uploaded');
    } catch (err) {
      toast.dismiss();
      toast.error('Upload failed');
    }
  };

  const removeImage = (id) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(img => img.publicId !== id) }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
      <div className="bg-ivory w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gold/20 bg-ink text-ivory">
          <h3 className="font-serif text-xl">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="hover:text-gold transition-colors"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">Product Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gold/30 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold" required />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full border border-gold/30 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold" required>
                <option value="">Select Category</option>
                <option value="ethnic-fusion">Ethnic Fusion</option>
                <option value="shirt">Premium Shirt</option>
                <option value="blazer">Bespoke Blazer</option>
                <option value="kurta">Kurta</option>
                <option value="bandhgala">Bandhgala</option>
              </select>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">SKU</label>
              <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}
                className="w-full border border-gold/30 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">Base Price (₹)</label>
              <input type="number" value={formData.price.base} onChange={e => setFormData({...formData, price: {...formData.price, base: Number(e.target.value)}})}
                className="w-full border border-gold/30 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold" required />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">Discount Price (₹)</label>
              <input type="number" value={formData.price.discounted} onChange={e => setFormData({...formData, price: {...formData.price, discounted: Number(e.target.value)}})}
                className="w-full border border-gold/30 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold" />
            </div>
          </div>

          <div>
            <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              rows={4} className="w-full border border-gold/30 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>

          <div>
            <label className="text-xs tracking-widest uppercase text-muted block mb-3">Product Images</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {formData.images.map(img => (
                <div key={img.publicId} className="relative w-20 h-20 group">
                  <img src={img.url} className="w-full h-full object-cover border border-gold/20" alt="product" />
                  <button type="button" onClick={() => removeImage(img.publicId)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-gold/20 flex flex-col items-center justify-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                <PhotoIcon className="w-6 h-6 text-gold/40" />
                <span className="text-[10px] uppercase tracking-tighter mt-1 text-gold/60">Upload</span>
                <input type="file" multiple onChange={handleImageUpload} className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isBespoke} onChange={e => setFormData({...formData, isBespoke: e.target.checked})} className="accent-gold outline-none" />
              <span className="text-xs tracking-widest uppercase text-muted">Bespoke Fitting</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="accent-gold outline-none" />
              <span className="text-xs tracking-widest uppercase text-muted">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} className="accent-gold outline-none" />
              <span className="text-xs tracking-widest uppercase text-muted">Published</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gold/10">
            <button type="button" onClick={onClose} className="flex-1 border border-gold/30 py-3 text-xs tracking-widest uppercase hover:bg-gold/5 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading}
              className="flex-1 bg-ink text-ivory py-3 text-xs tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-60">
              {isLoading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
