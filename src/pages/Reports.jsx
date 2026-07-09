import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { BarChart3 } from 'lucide-react';
import { formatDisplayDate, formatDisplayMonth } from '../utils/dateFormat';

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

export default function Reports() {
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [subsLoading, setSubsLoading] = useState(true);
  const [ordersData, setOrdersData] = useState(null);
  const [subsData, setSubsData] = useState(null);

  const [ordersFilters, setOrdersFilters] = useState({ start_date: '', end_date: '' });
  const [subsFilters, setSubsFilters] = useState({ branch_id: '', start_date: '', end_date: '' });

  const fetchOrders = async (params = {}) => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/reports/orders', { params });
      setOrdersData(res.data);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchSubs = async (params = {}) => {
    setSubsLoading(true);
    try {
      const res = await api.get('/reports/subscriptions', { params });
      setSubsData(res.data);
    } finally {
      setSubsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSubs();
  }, []);

  useEffect(() => {
    if (!ordersData?.filters) return;
    setOrdersFilters((prev) => ({
      ...prev,
      start_date: prev.start_date || ordersData.filters.start_date,
      end_date: prev.end_date || ordersData.filters.end_date,
    }));
  }, [ordersData]);

  useEffect(() => {
    if (!subsData?.filters) return;
    setSubsFilters((prev) => ({
      ...prev,
      start_date: prev.start_date || subsData.filters.start_date,
      end_date: prev.end_date || subsData.filters.end_date,
      branch_id: prev.branch_id || subsData.filters.branch_id || '',
    }));
  }, [subsData]);

  const applyOrdersFilters = () => {
    fetchOrders({ start_date: ordersFilters.start_date || undefined, end_date: ordersFilters.end_date || undefined });
  };

  const applySubsFilters = () => {
    fetchSubs({
      branch_id: subsFilters.branch_id || undefined,
      start_date: subsFilters.start_date || undefined,
      end_date: subsFilters.end_date || undefined,
    });
  };

  const ordersSummary = ordersData?.summary || {};
  const statusRows = useMemo(() => ordersData?.orders_by_status || [], [ordersData]);
  const monthlyOrders = useMemo(() => ordersData?.monthly || [], [ordersData]);
  const weeklyOrders = useMemo(() => ordersData?.weekly || [], [ordersData]);

  const branchRows = useMemo(() => subsData?.branch_summary || [], [subsData]);
  const monthlySubs = useMemo(() => subsData?.monthly || [], [subsData]);
  const weeklySubs = useMemo(() => subsData?.weekly || [], [subsData]);

  if ((ordersLoading && !ordersData) || (subsLoading && !subsData)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      </div>
    );
  }

  const ordersPrefix = `orders_${ordersFilters.start_date || 'start'}_${ordersFilters.end_date || 'end'}`;
  const subsPrefix = `subscribers_${subsFilters.start_date || 'start'}_${subsFilters.end_date || 'end'}_${subsFilters.branch_id || 'all'}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-500" /> Reports
        </h2>
      </div>

      <section className="space-y-4">
        <h3 className="text-md font-semibold text-gray-800">Orders Report (No Branch Mapping)</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Start Date</label>
            <input type="date" autoComplete="off" value={ordersFilters.start_date} onChange={(e) => setOrdersFilters((prev) => ({ ...prev, start_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">End Date</label>
            <input type="date" autoComplete="off" value={ordersFilters.end_date} onChange={(e) => setOrdersFilters((prev) => ({ ...prev, end_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={applyOrdersFilters} className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Apply Filters</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard label="Total Orders" value={ordersSummary.total_orders || 0} />
          <StatCard label="Order Revenue" value={money(ordersSummary.total_revenue)} />
          <StatCard label="Avg Order Value" value={money(ordersSummary.avg_order_value)} />
          <StatCard label="Discounts" value={money(ordersSummary.discount_amount)} />
          <StatCard label="Delivery Fees" value={money(ordersSummary.delivery_fees)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TableCard title="Orders by Status" columns={['Status', 'Count', 'Revenue']} onExport={() => exportCsv(`${ordersPrefix}_by_status.csv`, ['Status', 'Count', 'Revenue'], statusRows.map((r) => [r.status, r.count, r.revenue]))}>
            {statusRows.map((row) => <tr key={row.status} className="border-t"><td className="px-4 py-2 capitalize">{row.status}</td><td className="px-4 py-2">{row.count}</td><td className="px-4 py-2">{money(row.revenue)}</td></tr>)}
          </TableCard>
          <TableCard title="Monthly Orders" columns={['Month', 'Orders', 'Revenue']} onExport={() => exportCsv(`${ordersPrefix}_monthly.csv`, ['Month', 'Orders', 'Revenue'], monthlyOrders.map((r) => [r.period, r.orders_count, r.revenue]))}>
            {monthlyOrders.map((row) => <tr key={row.period} className="border-t"><td className="px-4 py-2">{formatDisplayMonth(row.period)}</td><td className="px-4 py-2">{row.orders_count}</td><td className="px-4 py-2">{money(row.revenue)}</td></tr>)}
          </TableCard>
          <TableCard title="Weekly Orders" columns={['Week Start', 'Orders', 'Revenue']} onExport={() => exportCsv(`${ordersPrefix}_weekly.csv`, ['Week Start', 'Orders', 'Revenue'], weeklyOrders.map((r) => [r.period, r.orders_count, r.revenue]))}>
            {weeklyOrders.map((row) => <tr key={row.period} className="border-t"><td className="px-4 py-2">{formatDisplayDate(row.period)}</td><td className="px-4 py-2">{row.orders_count}</td><td className="px-4 py-2">{money(row.revenue)}</td></tr>)}
          </TableCard>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-md font-semibold text-gray-800">Subscribers Report (Branch-wise)</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Branch</label>
            <select value={subsFilters.branch_id} onChange={(e) => setSubsFilters((prev) => ({ ...prev, branch_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Branches</option>
              {subsData?.branches?.options?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Start Date</label>
            <input type="date" autoComplete="off" value={subsFilters.start_date} onChange={(e) => setSubsFilters((prev) => ({ ...prev, start_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">End Date</label>
            <input type="date" autoComplete="off" value={subsFilters.end_date} onChange={(e) => setSubsFilters((prev) => ({ ...prev, end_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={applySubsFilters} className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Apply Filters</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TableCard title="Branch-wise Summary" columns={['Branch', 'New (Month)', 'New (Week)', 'Revenue (Month)', 'Revenue (Week)']} onExport={() => exportCsv(`${subsPrefix}_branch_summary.csv`, ['Branch', 'New (Month)', 'New (Week)', 'Revenue (Month)', 'Revenue (Week)', 'Total Subscribers', 'Active Subscribers', 'Revenue (Selected Period)'], branchRows.map((r) => [r.branch_name, r.new_subscribers_this_month, r.new_subscribers_this_week, r.revenue_this_month, r.revenue_this_week, r.total_subscribers, r.active_subscribers, r.revenue_in_selected_period]))}>
            {branchRows.map((row) => <tr key={row.branch_id} className="border-t"><td className="px-4 py-2">{row.branch_name}</td><td className="px-4 py-2">{row.new_subscribers_this_month}</td><td className="px-4 py-2">{row.new_subscribers_this_week}</td><td className="px-4 py-2">{money(row.revenue_this_month)}</td><td className="px-4 py-2">{money(row.revenue_this_week)}</td></tr>)}
          </TableCard>
          <TableCard title="Monthly Subscribers" columns={['Month', 'New Subscribers', 'Revenue']} onExport={() => exportCsv(`${subsPrefix}_monthly.csv`, ['Month', 'New Subscribers', 'Revenue'], monthlySubs.map((r) => [r.period, r.new_subscribers, r.revenue]))}>
            {monthlySubs.map((row) => <tr key={row.period} className="border-t"><td className="px-4 py-2">{formatDisplayMonth(row.period)}</td><td className="px-4 py-2">{row.new_subscribers}</td><td className="px-4 py-2">{money(row.revenue)}</td></tr>)}
          </TableCard>
          <TableCard title="Weekly Subscribers" columns={['Week Start', 'New Subscribers', 'Revenue']} onExport={() => exportCsv(`${subsPrefix}_weekly.csv`, ['Week Start', 'New Subscribers', 'Revenue'], weeklySubs.map((r) => [r.period, r.new_subscribers, r.revenue]))}>
            {weeklySubs.map((row) => <tr key={row.period} className="border-t"><td className="px-4 py-2">{formatDisplayDate(row.period)}</td><td className="px-4 py-2">{row.new_subscribers}</td><td className="px-4 py-2">{money(row.revenue)}</td></tr>)}
          </TableCard>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"><p className="text-xs text-gray-500 uppercase font-semibold">{label}</p><p className="mt-2 text-xl font-bold text-gray-900">{value}</p></div>;
}

function TableCard({ title, columns, children, onExport }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {onExport && <button onClick={onExport} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 font-medium">Export CSV</button>}
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left">{columns.map((col) => <th key={col} className="px-4 py-2 text-xs uppercase text-gray-500">{col}</th>)}</tr></thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
