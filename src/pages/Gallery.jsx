import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, Edit2, X, Upload, Image as ImageIcon } from 'lucide-react';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const [form, setForm] = useState({ branch_id: '', caption: '', sort_order: 0 });

  useEffect(() => {
    fetchPhotos();
    fetchBranches();
  }, []);

  const fetchPhotos = () => {
    api.get('/cms/gallery').then((res) => { setPhotos(res.data); setLoading(false); });
  };

  const fetchBranches = () => {
    api.get('/branches').then((res) => setBranches(res.data));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    if (form.image) {
      formData.append('image', form.image);
    }
    formData.append('branch_id', form.branch_id || '');
    formData.append('caption', form.caption);
    formData.append('sort_order', form.sort_order || 0);

    try {
      await api.post('/cms/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUpload(false);
      setForm({ branch_id: '', caption: '', sort_order: 0, image: null });
      fetchPhotos();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/cms/gallery/${editing.id}`, {
        branch_id: form.branch_id || null,
        caption: form.caption,
        sort_order: form.sort_order,
        is_active: form.is_active,
      });
      setEditing(null);
      setForm({ branch_id: '', caption: '', sort_order: 0 });
      fetchPhotos();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    await api.delete(`/cms/gallery/${id}`);
    fetchPhotos();
  };

  const startEdit = (photo) => {
    setEditing(photo);
    setForm({
      branch_id: photo.branch_id || '',
      caption: photo.caption || '',
      sort_order: photo.sort_order,
      is_active: photo.is_active,
    });
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-500" /> Photo Gallery
        </h2>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Upload Photo
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Photo</h3>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className={labelClass}>Image *</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Location (Branch)</label>
                <select
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">All Locations</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Caption</label>
                <input
                  type="text"
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className={inputClass}
                  placeholder="Optional caption"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Photo</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className={labelClass}>Location (Branch)</label>
                <select
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">All Locations</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Caption</label>
                <input
                  type="text"
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className={inputClass}
                />
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="accent-orange-600"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No photos uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.image_url}
                alt={photo.caption || ''}
                className="w-full aspect-square object-cover rounded-lg shadow-sm"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <button
                  onClick={() => startEdit(photo)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="p-2 bg-white rounded-full hover:bg-red-100"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
              {photo.branch && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {photo.branch.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
