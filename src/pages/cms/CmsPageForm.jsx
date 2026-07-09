import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Save, ArrowLeft, Code, Eye } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

export default function CmsPageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', featured_image: '',
    meta_title: '', meta_description: '', template: 'default',
    status: 'draft', sort_order: 0, is_homepage: false,
    show_in_header: false, show_in_footer: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [sourceMode, setSourceMode] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/cms-pages/${id}`).then((res) => {
        setForm(res.data);
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) {
        await api.put(`/cms-pages/${id}`, form);
      } else {
        await api.post('/cms-pages', form);
      }
      navigate('/cms/pages');
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/cms/pages')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">{isEdit ? 'Edit Page' : 'New Page'}</h2>
      </div>

      {/* Title & Slug */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Page Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} required />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} placeholder="auto-generated from title" />
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug[0]}</p>}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Excerpt</label>
            <textarea value={form.excerpt || ''} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={inputClass} rows="2" placeholder="Short summary..." />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Content</h3>
          <button
            type="button"
            onClick={() => setSourceMode(!sourceMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600"
          >
            {sourceMode ? <><Eye className="w-3.5 h-3.5" /> Visual</> : <><Code className="w-3.5 h-3.5" /> HTML Source</>}
          </button>
        </div>
        {sourceMode ? (
          <textarea
            value={form.content || ''}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className={`${inputClass} font-mono text-xs`}
            rows="20"
            placeholder="<h2>Your Content Here</h2><p>Write HTML content...</p>"
          />
        ) : (
          <RichTextEditor
            value={form.content || ''}
            onChange={(html) => setForm({ ...form, content: html })}
            placeholder="Start writing your page content..."
          />
        )}
      </div>

      {/* SEO & Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">SEO & Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Meta Title</label>
            <input type="text" value={form.meta_title || ''} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Featured Image URL</label>
            <input type="text" value={form.featured_image || ''} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Meta Description</label>
            <textarea value={form.meta_description || ''} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className={inputClass} rows="2" />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Template</label>
            <select value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className={inputClass}>
              <option value="default">Default</option>
              <option value="full_width">Full Width</option>
              <option value="sidebar">With Sidebar</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Sort Order</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className={inputClass} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_homepage} onChange={(e) => setForm({ ...form, is_homepage: e.target.checked })} className="accent-orange-600" />
            <span className="text-sm text-gray-700">Set as Homepage</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.show_in_header} onChange={(e) => setForm({ ...form, show_in_header: e.target.checked })} className="accent-orange-600" />
            <span className="text-sm text-gray-700">Show in Header Nav</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.show_in_footer} onChange={(e) => setForm({ ...form, show_in_footer: e.target.checked })} className="accent-orange-600" />
            <span className="text-sm text-gray-700">Show in Footer</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pb-6">
        <button type="button" onClick={() => navigate('/cms/pages')} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : isEdit ? 'Update Page' : 'Create Page'}
        </button>
      </div>
    </form>
  );
}
