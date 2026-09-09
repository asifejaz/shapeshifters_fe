import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Trash2, X, Save, Fingerprint, Edit } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateFormat';
import SubscriberNewTabLink from '../../components/SubscriberNewTabLink';

export default function BiometricEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [devices, setDevices] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ subscriber_id: '', device_id: '', device_user_id: '', enroll_number: '', is_active: true });
  const [errors, setErrors] = useState({});
  const [filterDevice, setFilterDevice] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/biometric-enrollments'),
      api.get('/biometric-devices'),
      api.get('/subscribers'),
    ]).then(([e, d, s]) => {
      setEnrollments(e.data);
      setDevices(d.data);
      setSubscribers(Array.isArray(s.data) ? s.data : s.data.data || []);
      setLoading(false);
    });
  }, []);

  const fetchEnrollments = () => {
    const params = filterDevice ? `?device_id=${filterDevice}` : '';
    api.get(`/biometric-enrollments${params}`).then((r) => setEnrollments(r.data));
  };

  useEffect(() => { if (!loading) fetchEnrollments(); }, [filterDevice]);

  const resetForm = () => {
    setForm({ subscriber_id: '', device_id: '', device_user_id: '', enroll_number: '', is_active: true });
    setEditing(null); setShowForm(false); setErrors({});
  };

  const handleEdit = (en) => {
    setForm({ subscriber_id: en.subscriber_id, device_id: en.device_id, device_user_id: en.device_user_id, enroll_number: en.enroll_number || '', is_active: en.is_active });
    setEditing(en.id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrors({});
    try {
      if (editing) { await api.put(`/biometric-enrollments/${editing}`, form); }
      else { await api.post('/biometric-enrollments', form); }
      resetForm(); fetchEnrollments();
    } catch (err) {
      if (err.response?.status === 422) {
        const msg = err.response.data.message;
        if (msg) setErrors({ general: [msg] });
        else setErrors(err.response.data.errors || {});
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this enrollment?')) return;
    await api.delete(`/biometric-enrollments/${id}`); fetchEnrollments();
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-orange-500" /> Biometric Enrollments
        </h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Enroll Member
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">How Enrollment Works</p>
        <p>Map each subscriber's <strong>Device User ID</strong> (the PIN/ID enrolled on the ZKTeco device) to their gym account. When the device pushes attendance data, the system will automatically match it to the subscriber.</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{editing ? 'Edit Enrollment' : 'New Enrollment'}</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          {errors.general && <p className="text-sm text-red-500 mb-3">{errors.general[0]}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscriber *</label>
              <select value={form.subscriber_id} onChange={(e) => setForm({ ...form, subscriber_id: e.target.value })} className={inputClass} required>
                <option value="">Select subscriber</option>
                {subscribers.map((s) => <option key={s.id} value={s.id}>{s.member_id} — {s.name}</option>)}
              </select>
              {errors.subscriber_id && <p className="text-xs text-red-500 mt-1">{errors.subscriber_id[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device *</label>
              <select value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })} className={inputClass} required disabled={!!editing}>
                <option value="">Select device</option>
                {devices.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.serial_number})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device User ID (PIN) *</label>
              <input type="text" value={form.device_user_id} onChange={(e) => setForm({ ...form, device_user_id: e.target.value })} className={inputClass} required placeholder="The user ID/PIN on the device" />
              {errors.device_user_id && <p className="text-xs text-red-500 mt-1">{errors.device_user_id[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enroll Number</label>
              <input type="text" value={form.enroll_number} onChange={(e) => setForm({ ...form, enroll_number: e.target.value })} className={inputClass} placeholder="Optional" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" /> {editing ? 'Update' : 'Enroll'}
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <select value={filterDevice} onChange={(e) => setFilterDevice(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
          <option value="">All Devices</option>
          {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Subscriber</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Device</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Device User ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Enrolled</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : enrollments.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">No enrollments yet</td></tr>
            ) : enrollments.map((en) => (
              <tr key={en.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <SubscriberNewTabLink subscriber={en.subscriber} className="font-medium text-gray-800" />
                    <p className="text-xs text-gray-400">{en.subscriber?.member_id}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{en.device?.name || '—'}</td>
                <td className="py-3 px-4 font-mono text-gray-700">{en.device_user_id}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${en.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {en.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{formatDisplayDate(en.enrolled_at, '—')}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(en)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(en.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
