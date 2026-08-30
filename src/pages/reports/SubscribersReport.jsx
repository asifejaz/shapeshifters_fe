import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { formatDisplayDate, formatDisplayMonth } from '../../utils/dateFormat';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;
const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const exportCsv = (filename, headers, rows) => {
  const content = [headers.map(csvEscape).join(','), ...rows.map((row) => row.map(csvEscape).join(','))].join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function SubscribersReport() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ branch_id: '', start_date: '', end_date: '' });
  const navigate = useNavigate();

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/reports/subscriptions', { params });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!data?.filters) return;
    setFilters((prev) => ({ ...prev, start_date: prev.start_date || data.filters.start_date, end_date: prev.end_date || data.filters.end_date, branch_id: prev.branch_id || data.filters.branch_id || '' }));
  }, [data]);

  const applyFilters = () => fetchData({ branch_id: filters.branch_id || undefined, start_date: filters.start_date || undefined, end_date: filters.end_date || undefined });

  const summary = data?.summary || {};
  const branchRows = useMemo(() => data?.branch_summary || [], [data]);
  const monthlyRows = useMemo(() => data?.monthly || [], [data]);
  const weeklyRows = useMemo(() => data?.weekly || [], [data]);

  const openDetails = (periodType, period) => {
    const q = new URLSearchParams({ period_type: periodType, period, branch_id: filters.branch_id || '', start_date: filters.start_date || '', end_date: filters.end_date || '' });
    navigate(`/admin/reports/subscribers/details?${q.toString()}`);
  };

  const downloadSubscriberList = async () => {
    const res = await api.get('/reports/subscriptions/subscribers-list', { params: { branch_id: filters.branch_id || undefined, start_date: filters.start_date || undefined, end_date: filters.end_date || undefined } });
    const rows = (res.data?.subscribers || []).map((s) => [s.member_id, s.name, s.phone, s.email, s.status, s.joining_date, s.subscription_start, s.subscription_end, s.branch?.name || '']);
    exportCsv(`subscribers_list_${filters.start_date || 'start'}_${filters.end_date || 'end'}.csv`, ['Member ID', 'Name', 'Phone', 'Email', 'Status', 'Joining Date', 'Subscription Start', 'Subscription End', 'Branch'], rows);
  };

  if (loading && !data) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" /></div>;

  const prefix = `subscribers_${filters.start_date || 'start'}_${filters.end_date || 'end'}_${filters.branch_id || 'all'}`;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Subscribers Report</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Branch</label>
          <select value={filters.branch_id} onChange={(e) => setFilters((prev) => ({ ...prev, branch_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Branches</option>
            {data?.branches?.options?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Start Date</label>
          <input type="date" autoComplete="off" value={filters.start_date} onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">End Date</label>
          <input type="date" autoComplete="off" value={filters.end_date} onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="flex items-end gap-2">
          <button onClick={applyFilters} className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Apply</button>
          <button onClick={downloadSubscriberList} className="w-full border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">Download List</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="Overall Subscribers" value={summary.total_subscribers || 0} />
        <StatCard label="Overall Active Subscribers" value={summary.active_subscribers || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TableCard title="Branch-wise Summary" columns={['Branch', 'New (Month)', 'New (Week)', 'Revenue (Month)', 'Revenue (Week)']} onExport={() => exportCsv(`${prefix}_branch_summary.csv`, ['Branch', 'New (Month)', 'New (Week)', 'Revenue (Month)', 'Revenue (Week)', 'Total Subscribers', 'Active Subscribers'], branchRows.map((r) => [r.branch_name, r.new_subscribers_this_month, r.new_subscribers_this_week, r.revenue_this_month, r.revenue_this_week, r.total_subscribers, r.active_subscribers]))}>
          {branchRows.map((row) => <tr key={row.branch_id} className="border-t"><td className="px-4 py-2">{row.branch_name}</td><td className="px-4 py-2">{row.new_subscribers_this_month}</td><td className="px-4 py-2">{row.new_subscribers_this_week}</td><td className="px-4 py-2">{money(row.revenue_this_month)}</td><td className="px-4 py-2">{money(row.revenue_this_week)}</td></tr>)}
        </TableCard>

        <TableCard title="Monthly Subscribers" columns={['Month', 'New Subscribers', 'Revenue']} onExport={() => exportCsv(`${prefix}_monthly.csv`, ['Month', 'New Subscribers', 'Revenue'], monthlyRows.map((r) => [r.period, r.new_subscribers, r.revenue]))}>
          {monthlyRows.map((row) => <tr key={row.period} className="border-t cursor-pointer hover:bg-gray-50" onClick={() => openDetails('month', row.period)}><td className="px-4 py-2">{formatDisplayMonth(row.period)}</td><td className="px-4 py-2">{row.new_subscribers}</td><td className="px-4 py-2">{money(row.revenue)}</td></tr>)}
        </TableCard>

        <TableCard title="Weekly Subscribers" columns={['Week Start', 'New Subscribers', 'Revenue']} onExport={() => exportCsv(`${prefix}_weekly.csv`, ['Week Start', 'New Subscribers', 'Revenue'], weeklyRows.map((r) => [r.period, r.new_subscribers, r.revenue]))}>
          {weeklyRows.map((row) => <tr key={row.period} className="border-t cursor-pointer hover:bg-gray-50" onClick={() => openDetails('week', row.period)}><td className="px-4 py-2">{formatDisplayDate(row.period)}</td><td className="px-4 py-2">{row.new_subscribers}</td><td className="px-4 py-2">{money(row.revenue)}</td></tr>)}
        </TableCard>
      </div>
    </div>
  );
}

function StatCard({ label, value }) { return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"><p className="text-xs text-gray-500 uppercase font-semibold">{label}</p><p className="mt-2 text-xl font-bold text-gray-900">{value}</p></div>; }
function TableCard({ title, columns, children, onExport }) { return <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-800">{title}</h3>{onExport && <button onClick={onExport} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 font-medium">Export CSV</button>}</div><div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left">{columns.map((col) => <th key={col} className="px-4 py-2 text-xs uppercase text-gray-500">{col}</th>)}</tr></thead><tbody>{children}</tbody></table></div></div>; }
