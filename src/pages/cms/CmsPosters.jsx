import { useEffect, useState } from 'react';
import api from '../../api';
import { Edit2, Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';

const emptyForm = {
  title: '',
  series: '',
  quote: '',
  sort_order: 0,
  is_active: true,
  image: null,
};

export default function CmsPosters() {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => { fetchPosters(); }, []);

  const fetchPosters = () => {
    api.get('/cms/posters').then((res) => setPosters(res.data || [])).finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (poster) => {
    setEditing(poster);
    setForm({
      title: poster.title || '',
      series: poster.series || '',
      quote: poster.quote || '',
      sort_order: poster.sort_order || 0,
      is_active: Boolean(poster.is_active),
      image: null,
    });
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
  };

  const buildFormData = () => {
    const data = new FormData();
    data.append('title', form.title);
    data.append('series', form.series || '');
    data.append('quote', form.quote || '');
    data.append('sort_order', form.sort_order || 0);
    data.append('is_active', form.is_active ? '1' : '0');
    if (form.image) data.append('image', form.image);
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      if (editing) {
        const data = buildFormData();
        data.append('_method', 'PUT');
        await api.post(`/cms/posters/${editing.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/cms/posters', buildFormData(), { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      closeForm();
      fetchPosters();
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
      else alert('Unable to save poster.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (poster) => {
    if (!window.confirm(`Delete poster "${poster.title}"?`)) return;
    await api.delete(`/cms/posters/${poster.id}`);
    fetchPosters();
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'text-xs text-red-600 mt-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-500" /> Posters
        </h2>
        <button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Poster
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editing ? 'Edit Poster' : 'Add Poster'}</h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Title *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} required />
                  {errors.title && <p className={errorClass}>{errors.title[0]}</p>}
                </div>
                <div>
                  <label className={labelClass}>Series</label>
                  <input value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })} className={inputClass} />
                  {errors.series && <p className={errorClass}>{errors.series[0]}</p>}
                </div>
              </div>

              <div>
                <label className={labelClass}>Quote</label>
                <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className={inputClass} rows="3" />
                {errors.quote && <p className={errorClass}>{errors.quote[0]}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Poster Image {editing ? '' : '*'}</label>
                  <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} className={inputClass} required={!editing} />
                  {errors.image && <p className={errorClass}>{errors.image[0]}</p>}
                  {editing?.image_url && <img src={editing.image_url} alt={editing.title} className="mt-3 h-32 w-24 object-cover rounded border" />}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Sort Order</label>
                    <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} className={inputClass} />
                    {errors.sort_order && <p className={errorClass}>{errors.sort_order[0]}</p>}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-orange-600" />
                    Active / visible on website
                  </label>
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Poster'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" /></div>
      ) : posters.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No posters added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {posters.map((poster) => (
            <div key={poster.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img src={poster.image_url} alt={poster.title} className="w-full aspect-[3/4] object-cover bg-gray-100" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{poster.title}</h3>
                    {poster.series && <p className="text-xs uppercase tracking-wider text-orange-600 mt-1">{poster.series}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${poster.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{poster.is_active ? 'Active' : 'Hidden'}</span>
                </div>
                {poster.quote && <p className="mt-3 text-sm text-gray-500 line-clamp-3">{poster.quote}</p>}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span>Sort: {poster.sort_order}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(poster)} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(poster)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
