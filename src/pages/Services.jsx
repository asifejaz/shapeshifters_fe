import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', default_fee: 0, fee_type: 'manual', applicable_gender: 'all', is_active: true });

  const fetchServices = () => {
    api.get('/services').then((res) => {
      setServices(res.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchServices(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', default_fee: 0, fee_type: 'manual', applicable_gender: 'all', is_active: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setForm({
      name: service.name,
      description: service.description || '',
      default_fee: service.default_fee,
      fee_type: service.fee_type,
      applicable_gender: service.applicable_gender,
      is_active: service.is_active,
    });
    setEditing(service.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/services/${editing}`, form);
    } else {
      await api.post('/services', form);
    }
    resetForm();
    fetchServices();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    await api.delete(`/services/${id}`);
    fetchServices();
  };

  const genderLabel = (g) => g === 'male' ? 'Boys' : g === 'female' ? 'Girls' : 'All';
  const genderColor = (g) => g === 'male' ? 'bg-blue-100 text-blue-700' : g === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Manage Packages / Services</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{editing ? 'Edit Package' : 'New Package'}</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Fee (Rs.)</label>
              <input type="number" step="0.01" value={form.default_fee} onChange={(e) => setForm({ ...form, default_fee: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
              <select value={form.fee_type} onChange={(e) => setForm({ ...form, fee_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="fixed">Fixed</option>
                <option value="manual">Manual Entry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Gender</label>
              <select value={form.applicable_gender} onChange={(e) => setForm({ ...form, applicable_gender: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="all">All</option>
                <option value="male">Boys Only</option>
                <option value="female">Girls Only</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" rows="2" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-orange-600" />
              <label className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" /> {editing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Package Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Default Fee</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Fee Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Gender</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : services.map((service) => (
              <tr key={service.id} className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-800">{service.name}</td>
                <td className="py-3 px-4 text-gray-600">Rs. {service.default_fee}</td>
                <td className="py-3 px-4 capitalize text-gray-600">{service.fee_type}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${genderColor(service.applicable_gender)}`}>
                    {genderLabel(service.applicable_gender)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(service)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(service.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
