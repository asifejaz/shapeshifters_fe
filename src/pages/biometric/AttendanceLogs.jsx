import { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { ClipboardList, ChevronLeft, ChevronRight, Upload, FileSpreadsheet, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import SubscriberNewTabLink from '../../components/SubscriberNewTabLink';

const statusLabels = { check_in: 'Check In', check_out: 'Check Out', break_in: 'Break In', break_out: 'Break Out', overtime_in: 'OT In', overtime_out: 'OT Out' };
const statusColors = {
  check_in: 'bg-green-100 text-green-700',
  check_out: 'bg-blue-100 text-blue-700',
  break_in: 'bg-yellow-100 text-yellow-700',
  break_out: 'bg-yellow-100 text-yellow-700',
  overtime_in: 'bg-purple-100 text-purple-700',
  overtime_out: 'bg-purple-100 text-purple-700',
};

export default function AttendanceLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date: new Date().toISOString().split('T')[0], branch_id: '', status: '' });
  const [branches, setBranches] = useState([]);
  const [devices, setDevices] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [importBranch, setImportBranch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef(null);

  const fetchData = (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, per_page: 30 });
    if (filters.date) params.set('date', filters.date);
    if (filters.branch_id) params.set('branch_id', filters.branch_id);
    if (filters.status) params.set('status', filters.status);

    Promise.all([
      api.get(`/attendance-logs?${params}`),
      api.get(`/attendance-logs/stats?date=${filters.date || new Date().toISOString().split('T')[0]}`),
    ]).then(([logRes, statsRes]) => {
      setLogs(logRes.data.data);
      setPagination({ current_page: logRes.data.current_page, last_page: logRes.data.last_page });
      setStats(statsRes.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    Promise.all([api.get('/branches'), api.get('/biometric-devices')]).then(([b, d]) => {
      setBranches(b.data);
      setDevices(d.data);
    });
    fetchData();
  }, []);

  useEffect(() => { fetchData(); }, [filters]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-orange-500" /> Attendance Logs
        </h2>
        <button onClick={() => { setShowImport(!showImport); setImportResult(null); }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Upload className="w-4 h-4" /> Import CSV
        </button>
      </div>

      {/* CSV Import Panel */}
      {showImport && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-orange-500" /> Import Attendance from CSV</h3>
            <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CSV File *</label>
              <input ref={fileRef} type="file" accept=".csv,.txt" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch (Location)</label>
              <select value={importBranch} onChange={(e) => setImportBranch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Auto (your branch)</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">Supported CSV columns:</p>
            <p><strong>Required:</strong> user_id (or pin/no/id) + datetime (or date + time / timestamp / punched_at)</p>
            <p><strong>Optional:</strong> status (check_in/check_out), verify_type (fingerprint/face/card)</p>
            <p className="mt-1">Duplicates (same user + same timestamp) are automatically skipped.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const file = fileRef.current?.files?.[0];
                if (!file) return alert('Please select a CSV file');
                setImporting(true);
                setImportResult(null);
                const formData = new FormData();
                formData.append('file', file);
                if (importBranch) formData.append('branch_id', importBranch);
                try {
                  const res = await api.post('/attendance-logs/import-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                  setImportResult(res.data);
                  fetchData();
                } catch (err) {
                  setImportResult({ message: err.response?.data?.message || 'Import failed', imported: 0, skipped: 0, errors: [] });
                } finally {
                  setImporting(false);
                }
              }}
              disabled={importing}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {importing ? 'Importing...' : 'Upload & Import'}
            </button>
          </div>

          {importResult && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${importResult.imported > 0 ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'}`}>
              {importResult.imported > 0 ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
              <div>
                <p className="font-medium">{importResult.message}</p>
                {importResult.errors?.length > 0 && (
                  <ul className="mt-1 text-xs list-disc list-inside">
                    {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Punches', value: stats.total_punches, color: 'text-gray-800' },
            { label: 'Check-Ins', value: stats.check_ins, color: 'text-green-600' },
            { label: 'Check-Outs', value: stats.check_outs, color: 'text-blue-600' },
            { label: 'Unresolved', value: stats.unresolved, color: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input type="date" autoComplete="off" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
        <select value={filters.branch_id} onChange={(e) => setFilters({ ...filters, branch_id: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
          <option value="">All Branches</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
          <option value="">All Statuses</option>
          <option value="check_in">Check In</option>
          <option value="check_out">Check Out</option>
          <option value="break_in">Break In</option>
          <option value="break_out">Break Out</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Subscriber</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Device PIN</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Device</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Method</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Synced</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-500">No attendance records for this date</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700 font-mono text-xs">{new Date(log.punched_at).toLocaleTimeString()}</td>
                <td className="py-3 px-4">
                  {log.subscriber ? (
                    <div>
                      <SubscriberNewTabLink subscriber={log.subscriber} className="font-medium text-gray-800" />
                      <p className="text-xs text-gray-400">{log.subscriber.member_id}</p>
                    </div>
                  ) : (
                    <span className="text-red-500 text-xs font-medium">Unresolved</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-gray-600">{log.device_user_id}</td>
                <td className="py-3 px-4 text-gray-500 text-xs">{log.device?.name || log.device_serial || '—'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[log.status] || 'bg-gray-100 text-gray-500'}`}>
                    {statusLabels[log.status] || log.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-gray-500">{log.verify_method}</td>
                <td className="py-3 px-4">
                  {log.synced_to_checkin ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Yes</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={pagination.current_page <= 1} onClick={() => fetchData(pagination.current_page - 1)}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">Page {pagination.current_page} of {pagination.last_page}</span>
          <button disabled={pagination.current_page >= pagination.last_page} onClick={() => fetchData(pagination.current_page + 1)}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
