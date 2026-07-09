import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Edit, Trash2, X, Save, Image } from 'lucide-react';

export default function CmsSliders() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', button_text: '', button_url: '', sort_order: 0, is_active: true });

  const fetchSliders = () => {
    api.get('/cms-sliders').then((res) => { setSliders(res.data); setLoading(false); });
  };

  useEffect(() => { fetchSliders(); }, []);

  const resetForm = () => {
    setForm({ title: '', subtitle: '', image: '', button_text: '', button_url: '', sort_order: 0, is_active: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (slider) => {
    setForm({ title: slider.title, subtitle: slider.subtitle || '', image: slider.image || '', button_text: slider.button_text || '', button_url: slider.button_url || '', sort_order: slider.sort_order, is_active: slider.is_active });
    setEditing(slider.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/cms-sliders/${editing}`, form);
    } else {
      await api.post('/cms-sliders', form);
    }
    resetForm();
    fetchSliders();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slider?')) return;
    await api.delete(`/cms-sliders/${id}`);
    fetchSliders();
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Image className="w-5 h-5 text-orange-500" /> Hero Sliders
        </h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Slider
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{editing ? 'Edit Slider' : 'New Slider'}</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClass} rows="2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input type="text" value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
              <input type="text" value={form.button_url} onChange={(e) => setForm({ ...form, button_url: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className={inputClass} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-orange-600" /><span className="text-sm">Active</span></label>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" /> {editing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-gray-500 col-span-2 text-center py-8">Loading...</p>
        ) : sliders.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-8">No sliders yet</p>
        ) : sliders.map((slider) => (
          <div key={slider.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {slider.image && (
              <div className="h-32 bg-gray-900 flex items-center justify-center">
                <img src={slider.image} alt={slider.title} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{slider.title}</h4>
                  {slider.subtitle && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{slider.subtitle}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${slider.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {slider.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
              {slider.button_text && (
                <p className="text-xs text-gray-400 mt-2">Button: {slider.button_text} → {slider.button_url}</p>
              )}
              <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => handleEdit(slider)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(slider.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
