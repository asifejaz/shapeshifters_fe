import { useEffect, useMemo, useState } from 'react';
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

export default function OrdersReport() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ start_date: '', end_date: '' });

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/reports/orders', { params });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!data?.filters) return;
    setFilters((prev) => ({
      ...prev,
      start_date: prev.start_date || data.filters.start_date,
      end_date: prev.end_date || data.filters.end_date,
    }));
  }, [data]);

  const applyFilters = () => fetchData({ start_date: filters.start_date || undefined, end_date: filters.end_date || undefined });

  const summary = data?.summary || {};
  const statusRows = useMemo(() => data?.orders_by_status || [], [data]);
  const monthlyRows = useMemo(() => data?.monthly || [], [data]);
  const weeklyRows = useMemo(() => data?.weekly || [], [data]);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" /></div>;
  }

  const prefix = `orders_${filters.start_date || 'start'}_${filters.end_date || 'end'}`;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Orders Report</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Start Date</label>
          <input type="date" autoComplete="off" value={filters.start_date} onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">End Date</label>
          <input type="date" autoComplete="off" value={filters.end_date} onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="flex items-end">
          <button onClick={applyFilters} className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Apply Filters</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard label="Total Orders" value={summary.total_orders || 0} />
        <StatCard label="Order Revenue" value={money(summary.total_revenue)} />
        <StatCard label="Avg Order Value" value={money(summary.avg_order_value)} />
        <StatCard label="Discounts" value={money(summary.discount_amount)} />
        <StatCard label="Delivery Fees" value={money(summary.delivery_fees)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TableCard title="Orders by Status" columns={['Status', 'Count', 'Revenue']} onExport={() => exportCsv(`${prefix}_by_status.csv`, ['Status', 'Count', 'Revenue'], statusRows.map((r) => [r.status, r.count, r.revenue]))}>
          {statusRows.map((row) => <tr key={row.status} className="border-t"><td className="px-4 py-2 capitalize">{row.status}</td><td className="px-4 py-2">{row.count}</td><td className="px-4 py-2">{money(row.revenue)}</td></tr>)}
        </TableCard>
        <TableCard title="Monthly Orders" columns={['Month', 'Orders', 'Revenue']} onExport={() => exportCsv(`${prefix}_monthly.csv`, ['Month', 'Orders', 'Revenue'], monthlyRows.map((r) => [r.period, r.orders_count, r.revenue]))}>
          {monthlyRows.map((row) => <tr key={row.period} className="border-t"><td className="px-4 py-2">{formatDisplayMonth(row.period)}</td><td className="px-4 py-2">{row.orders_count}</td><td className="px-4 py-2">{money(row.revenue)}</td></tr>)}
        </TableCard>
        <TableCard title="Weekly Orders" columns={['Week Start', 'Orders', 'Revenue']} onExport={() => exportCsv(`${prefix}_weekly.csv`, ['Week Start', 'Orders', 'Revenue'], weeklyRows.map((r) => [r.period, r.orders_count, r.revenue]))}>
          {weeklyRows.map((row) => <tr key={row.period} className="border-t"><td className="px-4 py-2">{formatDisplayDate(row.period)}</td><td className="px-4 py-2">{row.orders_count}</td><td className="px-4 py-2">{money(row.revenue)}</td></tr>)}
        </TableCard>
      </div>
    </div>
  );
}

function StatCard({ label, value }) { return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"><p className="text-xs text-gray-500 uppercase font-semibold">{label}</p><p className="mt-2 text-xl font-bold text-gray-900">{value}</p></div>; }

function TableCard({ title, columns, children, onExport }) {
  return <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-800">{title}</h3>{onExport && <button onClick={onExport} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 font-medium">Export CSV</button>}</div><div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left">{columns.map((col) => <th key={col} className="px-4 py-2 text-xs uppercase text-gray-500">{col}</th>)}</tr></thead><tbody>{children}</tbody></table></div></div>;
}
