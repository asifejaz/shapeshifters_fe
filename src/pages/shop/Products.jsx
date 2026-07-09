import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Trash2, Edit2, X, Package, Upload } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    category_id: '',
    name: '',
    slug: '',
    description: '',
    attributes: [],
    images: [],
    price: '',
    discount_price: '',
    stock: 0,
    in_stock: true,
    is_featured: false,
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = () => {
    api.get('/products').then((res) => { setProducts(res.data); setLoading(false); });
  };

  const fetchCategories = () => {
    api.get('/product-categories').then((res) => setCategories(res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key !== 'images' && key !== 'attributes' && form[key] !== null && form[key] !== '') {
        formData.append(key, form[key]);
      }
    });
    formData.append('attributes', JSON.stringify(form.attributes.filter((attr) => attr.name && attr.values)));

    // Append multiple images
    if (form.images && form.images.length > 0) {
      form.images.forEach((image) => {
        formData.append('images[]', image);
      });
    }

    try {
      if (editing) {
        await api.post(`/products/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { _method: 'PUT' },
        });
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      fetchProducts();
    } catch (err) {
      alert('Operation failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const startEdit = (product) => {
    setEditing(product);
    setForm({
      category_id: product.category_id || '',
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      attributes: (product.attributes || []).map((attr) => ({
        name: attr.name || '',
        values: Array.isArray(attr.values) ? attr.values.join(', ') : '',
      })),
      images: [],
      price: product.price,
      discount_price: product.discount_price || '',
      stock: product.stock,
      in_stock: product.in_stock,
      is_featured: product.is_featured,
      sort_order: product.sort_order,
      is_active: product.is_active,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      category_id: '',
      name: '',
      slug: '',
      description: '',
      attributes: [],
      images: [],
      price: '',
      discount_price: '',
      stock: 0,
      in_stock: true,
      is_featured: false,
      sort_order: 0,
      is_active: true,
    });
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const addAttribute = () => {
    setForm((prev) => ({ ...prev, attributes: [...prev.attributes, { name: '', values: '' }] }));
  };

  const updateAttribute = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => (i === index ? { ...attr, [key]: value } : attr)),
    }));
  };

  const removeAttribute = (index) => {
    setForm((prev) => ({ ...prev, attributes: prev.attributes.filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-500" /> Products
        </h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                  rows="3"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Product Attributes</label>
                  <button type="button" onClick={addAttribute} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">
                    Add Attribute
                  </button>
                </div>
                <div className="space-y-2">
                  {form.attributes.map((attribute, index) => (
                    <div key={`attr-${index}`} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Attribute name (e.g. Size)"
                        value={attribute.name}
                        onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                        className={`${inputClass} col-span-4`}
                      />
                      <input
                        type="text"
                        placeholder="Options comma separated (e.g. S, M, L)"
                        value={attribute.values}
                        onChange={(e) => updateAttribute(index, 'values', e.target.value)}
                        className={`${inputClass} col-span-7`}
                      />
                      <button type="button" onClick={() => removeAttribute(index)} className="col-span-1 text-red-500 hover:text-red-700 flex justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Each attribute becomes a required selection on product details.</p>
              </div>
              <div>
                <label className={labelClass}>Images *</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setForm({ ...form, images: Array.from(e.target.files) })}
                  className={inputClass}
                  required={!editing}
                />
                {form.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20">
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover rounded border" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Price (Rs) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Discount Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.discount_price}
                    onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.in_stock}
                    onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                    className="accent-orange-600"
                  />
                  <label className="text-sm text-gray-700">In Stock</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="accent-orange-600"
                  />
                  <label className="text-sm text-gray-700">Featured</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="accent-orange-600"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>
              </div>
              <div>
                <label className={labelClass}>Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {uploading ? 'Saving...' : (editing ? 'Update' : 'Create')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.main_image ? (
                        <img src={product.main_image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        {product.is_featured && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Rs. {product.final_price}
                    {product.discount_price && (
                      <span className="text-xs text-gray-400 line-through ml-2">Rs. {product.price}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
