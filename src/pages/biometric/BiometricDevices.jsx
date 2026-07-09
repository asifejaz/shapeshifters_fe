import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Edit, Trash2, X, Save, Wifi, WifiOff, Router } from 'lucide-react';
import { formatDisplayDateTime } from '../../utils/dateFormat';

export default function BiometricDevices() {
  const [devices, setDevices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ serial_number: '', name: '', model: '', ip_address: '', port: 4370, branch_id: '', location: '', is_active: true, notes: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([api.get('/biometric-devices'), api.get('/branches')]).then(([d, b]) => {
      setDevices(d.data);
      setBranches(b.data);
      setLoading(false);
    });
  }, []);

  const fetchDevices = () => { api.get('/biometric-devices').then((r) => setDevices(r.data)); };

  const resetForm = () => {
    setForm({ serial_number: '', name: '', model: '', ip_address: '', port: 4370, branch_id: '', location: '', is_active: true, notes: '' });
    setEditing(null); setShowForm(false); setErrors({});
  };

  const handleEdit = (d) => {
    setForm({ serial_number: d.serial_number, name: d.name, model: d.model || '', ip_address: d.ip_address || '', port: d.port || 4370, branch_id: d.branch_id, location: d.location || '', is_active: d.is_active, notes: d.notes || '' });
    setEditing(d.id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrors({});
    try {
      if (editing) { await api.put(`/biometric-devices/${editing}`, form); }
      else { await api.post('/biometric-devices', form); }
      resetForm(); fetchDevices();
    } catch (err) { if (err.response?.status === 422) setErrors(err.response.data.errors || {}); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this device? Enrollments & logs linked to it will be affected.')) return;
    await api.delete(`/biometric-devices/${id}`); fetchDevices();
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Router className="w-5 h-5 text-orange-500" /> ZKTeco Devices
        </h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Device
        </button>
      </div>

      {/* Setup instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">ZKTeco Device Setup</p>
        <p>Configure your ZKTeco device PUSH server URL to: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono text-xs">http://YOUR_SERVER:8000/api/zkteco/iclock</code></p>
        <p className="mt-1 text-blue-600">The device will auto-push attendance records. Ensure the serial number matches the one registered here.</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{editing ? 'Edit Device' : 'Register New Device'}</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
              <input type="text" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} className={inputClass} required placeholder="e.g. BXKF204960101" />
              {errors.serial_number && <p className="text-xs text-red-500 mt-1">{errors.serial_number[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required placeholder="e.g. Main Entrance" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputClass} placeholder="e.g. K40, iClock 680" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
              <input type="text" value={form.ip_address} onChange={(e) => setForm({ ...form, ip_address: e.target.value })} className={inputClass} placeholder="192.168.1.201" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 4370 })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} className={inputClass} required>
                <option value="">Select branch</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Area</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="e.g. Main gate, Reception" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-orange-600" /><span className="text-sm">Active</span></label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" /> {editing ? 'Update' : 'Register'} Device
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-3 text-center py-8 text-gray-500">Loading...</p>
        ) : devices.length === 0 ? (
          <p className="col-span-3 text-center py-8 text-gray-500">No devices registered</p>
        ) : devices.map((d) => (
          <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {d.status === 'online' ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-gray-400" />}
                <h4 className="font-semibold text-gray-800">{d.name}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                d.status === 'online' ? 'bg-green-100 text-green-700' : d.status === 'offline' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
              }`}>{d.status}</span>
            </div>
            <div className="space-y-1 text-sm text-gray-500">
              <p><span className="font-medium text-gray-600">SN:</span> <span className="font-mono">{d.serial_number}</span></p>
              {d.model && <p><span className="font-medium text-gray-600">Model:</span> {d.model}</p>}
              {d.ip_address && <p><span className="font-medium text-gray-600">IP:</span> {d.ip_address}:{d.port}</p>}
              <p><span className="font-medium text-gray-600">Branch:</span> {d.branch?.name}</p>
              {d.location && <p><span className="font-medium text-gray-600">Location:</span> {d.location}</p>}
              {d.last_activity_at && <p><span className="font-medium text-gray-600">Last seen:</span> {formatDisplayDateTime(d.last_activity_at)}</p>}
            </div>
            <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
              <button onClick={() => handleEdit(d)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(d.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
