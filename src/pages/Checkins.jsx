import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, X, Save, Search } from 'lucide-react';
import { formatDisplayDateTime } from '../utils/dateFormat';
import SubscriberNewTabLink from '../components/SubscriberNewTabLink';

export default function Checkins() {
  const [checkins, setCheckins] = useState([]);
  const [pagination, setPagination] = useState({});
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ date: new Date().toISOString().split('T')[0], branch_id: '' });

  const [form, setForm] = useState({ subscriber_id: '', branch_id: '', method: 'manual', notes: '' });
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberResults, setSubscriberResults] = useState([]);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);

  useEffect(() => {
    api.get('/branches').then((res) => setBranches(res.data));
  }, []);

  useEffect(() => { fetchCheckins(); }, [page, filters]);

  const fetchCheckins = () => {
    setLoading(true);
    const params = { page, ...filters };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    api.get('/checkins', { params }).then((res) => {
      setCheckins(res.data.data);
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
    setForm({ ...form, subscriber_id: sub.id, branch_id: sub.branch_id });
    setSubscriberSearch(sub.name);
    setSubscriberResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/checkins', form);
      setShowForm(false);
      setForm({ subscriber_id: '', branch_id: '', method: 'manual', notes: '' });
      setSelectedSubscriber(null);
      setSubscriberSearch('');
      fetchCheckins();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <input
            type="date" autoComplete="off"
            value={filters.date}
            onChange={(e) => { setFilters({ ...filters, date: e.target.value }); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
          <select
            value={filters.branch_id}
            onChange={(e) => { setFilters({ ...filters, branch_id: e.target.value }); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="">All Branches</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Manual Check-in
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Manual Check-in</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Subscriber *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={subscriberSearch}
                  onChange={(e) => searchSubscriber(e.target.value)}
                  placeholder="Search by name, ID, phone..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              {subscriberResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {subscriberResults.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => selectSubscriber(sub)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100"
                    >
                      <span className="font-medium">{sub.name}</span>
                      <span className="text-gray-400 ml-2">{sub.member_id}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedSubscriber && (
                <p className="text-xs text-green-600 mt-1">Selected: {selectedSubscriber.name} ({selectedSubscriber.member_id})</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" required>
                <option value="">Select Branch</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="manual">Manual</option>
                <option value="biometric">Biometric</option>
                <option value="qr_code">QR Code</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={!form.subscriber_id} className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" /> Check In
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Member</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Branch</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Method</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : checkins.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No check-ins found</td></tr>
            ) : checkins.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <SubscriberNewTabLink subscriber={c.subscriber} className="font-medium text-gray-800" />
                  <p className="text-xs text-gray-400 font-mono">{c.subscriber?.member_id}</p>
                </td>
                <td className="py-3 px-4 text-gray-600">{c.branch?.name}</td>
                <td className="py-3 px-4 text-gray-600">{formatDisplayDateTime(c.checked_in_at)}</td>
                <td className="py-3 px-4">
                  <span className="capitalize px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">{c.method}</span>
                </td>
                <td className="py-3 px-4 text-gray-500">{c.notes || '—'}</td>
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
