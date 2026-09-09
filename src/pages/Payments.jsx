import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, X, Save, Search, Trash2, Edit } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateFormat';
import SubscriberNewTabLink from '../components/SubscriberNewTabLink';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    subscriber_id: '', amount: '', payment_method: 'cash',
    reference_number: '', payment_date: new Date().toISOString().split('T')[0],
    period_start: '', period_end: '', notes: '',
  });
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberResults, setSubscriberResults] = useState([]);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);

  useEffect(() => { fetchPayments(); }, [page]);

  const fetchPayments = () => {
    setLoading(true);
    api.get('/payments', { params: { page } }).then((res) => {
      setPayments(res.data.data);
      setPagination(res.data);
      setLoading(false);
    });
  };

  const searchSubscriber = async (query) => {
    setSubscriberSearch(query);
    if (query.length < 2) { setSubscriberResults([]); return; }
    const res = await api.get('/subscribers', { params: { search: query, per_page: 5 } });
    setSubscriberResults(res.data.data);
  };

  const selectSubscriber = (sub) => {
    setSelectedSubscriber(sub);
    setForm({ ...form, subscriber_id: sub.id });
    setSubscriberSearch(sub.name);
    setSubscriberResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingPayment) {
      await api.put(`/payments/${editingPayment.id}`, form);
    } else {
      await api.post('/payments', { ...form, type: 'subscription' });
    }
    setShowForm(false);
    setEditingPayment(null);
    setForm({ subscriber_id: '', amount: '', payment_method: 'cash', reference_number: '', payment_date: new Date().toISOString().split('T')[0], period_start: '', period_end: '', notes: '' });
    setSelectedSubscriber(null);
    setSubscriberSearch('');
    fetchPayments();
  };

  const openCreateForm = () => {
    setEditingPayment(null);
    setSelectedSubscriber(null);
    setSubscriberSearch('');
    setForm({ subscriber_id: '', amount: '', payment_method: 'cash', reference_number: '', payment_date: new Date().toISOString().split('T')[0], period_start: '', period_end: '', notes: '' });
    setShowForm(true);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setSelectedSubscriber(payment.subscriber || null);
    setSubscriberSearch(payment.subscriber?.name || '');
    setForm({
      subscriber_id: payment.subscriber_id,
      amount: payment.amount || '',
      payment_method: payment.payment_method || 'cash',
      reference_number: payment.reference_number || '',
      payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
      period_start: payment.period_start || '',
      period_end: payment.period_end || '',
      notes: payment.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (payment) => {
    if (!window.confirm('Soft delete this payment? It will remain visible as deleted.')) return;
    await api.delete(`/payments/${payment.id}`);
    fetchPayments();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Payment Records</h2>
        <button onClick={openCreateForm} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{editingPayment ? 'Edit Payment' : 'Record Payment'}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditingPayment(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Subscriber *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={subscriberSearch} onChange={(e) => searchSubscriber(e.target.value)} disabled={Boolean(editingPayment)} placeholder="Search by name, ID, phone..." className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100" />
              </div>
              {subscriberResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {subscriberResults.map((sub) => (
                    <button key={sub.id} type="button" onClick={() => selectSubscriber(sub)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100">
                      <span className="font-medium">{sub.name}</span>
                      <span className="text-gray-400 ml-2">{sub.member_id}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedSubscriber && <p className="text-xs text-green-600 mt-1">Selected: {selectedSubscriber.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.) *</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <input type="date" autoComplete="off" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference #</label>
              <input type="text" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Start *</label>
              <input type="date" autoComplete="off" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period End *</label>
              <input type="date" autoComplete="off" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={!form.subscriber_id || !form.amount} className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" /> {editingPayment ? 'Update Payment' : 'Record Payment'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Member</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Method</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Period</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-8 text-gray-500">No payments found</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 ${p.deleted_at ? 'bg-red-50/50 text-gray-400' : ''}`}>
                <td className="py-3 px-4">
                  <SubscriberNewTabLink subscriber={p.subscriber} className="font-medium text-gray-800" />
                  <p className="text-xs text-gray-400 font-mono">{p.subscriber?.member_id}</p>
                </td>
                <td className="py-3 px-4 font-medium text-gray-800">Rs. {p.amount}</td>
                <td className="py-3 px-4 capitalize text-gray-600">{p.type.replace('_', ' ')}</td>
                <td className="py-3 px-4 capitalize text-gray-600">{p.payment_method.replace('_', ' ')}</td>
                <td className="py-3 px-4 text-gray-600">{formatDisplayDate(p.payment_date)}</td>
                <td className="py-3 px-4 text-gray-500 text-xs">{p.period_start ? `${formatDisplayDate(p.period_start)} → ${formatDisplayDate(p.period_end)}` : '—'}</td>
                <td className="py-3 px-4">
                  {p.deleted_at ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Deleted</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {!p.deleted_at && (
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit payment">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete payment">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Showing {pagination.from}–{pagination.to} of {pagination.total}</p>
            <div className="flex gap-1">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-sm ${p === pagination.current_page ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
