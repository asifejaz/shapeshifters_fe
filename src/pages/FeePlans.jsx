import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

export default function FeePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', amount: 0, duration_days: 30, billing_cycle: 'monthly', is_active: true });

  const fetchPlans = () => {
    api.get('/fee-plans').then((res) => { setPlans(res.data); setLoading(false); });
  };

  useEffect(() => { fetchPlans(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', amount: 0, duration_days: 30, billing_cycle: 'monthly', is_active: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (plan) => {
    setForm({ name: plan.name, description: plan.description || '', amount: plan.amount, duration_days: plan.duration_days, billing_cycle: plan.billing_cycle, is_active: plan.is_active });
    setEditing(plan.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/fee-plans/${editing}`, form);
    } else {
      await api.post('/fee-plans', form);
    }
    resetForm();
    fetchPlans();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee plan?')) return;
    await api.delete(`/fee-plans/${id}`);
    fetchPlans();
  };

  const cycleLabel = { monthly: 'Monthly', quarterly: 'Quarterly', semi_annual: 'Semi-Annual', annual: 'Annual', custom: 'Custom' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Manage Fee Plans</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{editing ? 'Edit Plan' : 'New Fee Plan'}</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.) *</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days) *</label>
              <input type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
              <select value={form.billing_cycle} onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi_annual">Semi-Annual</option>
                <option value="annual">Annual</option>
                <option value="custom">Custom</option>
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
              <th className="text-left py-3 px-4 font-medium text-gray-500">Plan Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Duration</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Cycle</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : plans.map((plan) => (
              <tr key={plan.id} className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-800">{plan.name}</td>
                <td className="py-3 px-4 text-gray-600">Rs. {plan.amount}</td>
                <td className="py-3 px-4 text-gray-600">{plan.duration_days} days</td>
                <td className="py-3 px-4 text-gray-600">{cycleLabel[plan.billing_cycle] || plan.billing_cycle}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(plan)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(plan.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
