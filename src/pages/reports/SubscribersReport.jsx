import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { formatDisplayDate, formatDisplayMonth } from '../../utils/dateFormat';
import { toTitleCaseDisplay } from '../../utils/textFormat';

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
  const [paymentCategory, setPaymentCategory] = useState('missing');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);
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
  const paymentStatus = data?.payment_status;
  const paymentRows = useMemo(() => {
    const search = paymentSearch.trim().toLowerCase();
    return (paymentStatus?.subscribers || []).filter((subscriber) => {
      if (subscriber.category !== paymentCategory) return false;
      if (!search) return true;
      return [subscriber.name, subscriber.member_id, subscriber.biometric_id, subscriber.phone, subscriber.branch_name]
        .some((value) => String(value || '').toLowerCase().includes(search));
    });
  }, [paymentCategory, paymentSearch, paymentStatus]);
  const paymentPageSize = 50;
  const paymentPageCount = Math.max(1, Math.ceil(paymentRows.length / paymentPageSize));
  const visiblePaymentRows = paymentRows.slice((paymentPage - 1) * paymentPageSize, paymentPage * paymentPageSize);

  const openDetails = (periodType, period) => {
    const q = new URLSearchParams({ period_type: periodType, period, branch_id: filters.branch_id || '', start_date: filters.start_date || '', end_date: filters.end_date || '' });
    navigate(`/admin/reports/subscribers/details?${q.toString()}`);
  };

  const downloadSubscriberList = async () => {
    const res = await api.get('/reports/subscriptions/subscribers-list', { params: { branch_id: filters.branch_id || undefined, start_date: filters.start_date || undefined, end_date: filters.end_date || undefined } });
    const rows = (res.data?.subscribers || []).map((s) => [s.member_id, s.name, s.phone, s.email, s.status, s.joining_date, s.subscription_start, s.subscription_end, s.branch?.name || '']);
    exportCsv(`subscribers_list_${filters.start_date || 'start'}_${filters.end_date || 'end'}.csv`, ['Member ID', 'Name', 'Phone', 'Email', 'Status', 'Joining Date', 'Subscription Start', 'Subscription End', 'Branch'], rows);
  };

  const downloadPaymentStatus = () => {
    const label = PAYMENT_CATEGORIES[paymentCategory].label.toLowerCase().replace(/[^a-z]+/g, '_');
    exportCsv(
      `subscriber_payment_status_${label}_${paymentStatus?.as_of || 'current'}.csv`,
      ['Category', 'Member ID', 'Biometric ID', 'Name', 'Phone', 'Branch', 'Joining Date', 'Paid Through', 'Days Overdue', 'Last Payment Date', 'Last Payment Amount', 'Payment Method', 'Membership Status'],
      paymentRows.map((subscriber) => [
        PAYMENT_CATEGORIES[subscriber.category].label,
        subscriber.member_id,
        subscriber.biometric_id,
        toTitleCaseDisplay(subscriber.name),
        subscriber.phone,
        subscriber.branch_name,
        subscriber.joining_date,
        subscriber.subscription_end,
        subscriber.days_overdue,
        subscriber.latest_payment?.payment_date,
        subscriber.latest_payment?.amount,
        subscriber.latest_payment?.payment_method,
        subscriber.membership_status,
      ]),
    );
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

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Subscriber Payment Status</h3>
            <p className="mt-1 text-xs text-gray-500">
              Current snapshot as of {formatDisplayDate(paymentStatus?.as_of)}. Date-range filters above only affect the trend reports below.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="search"
              value={paymentSearch}
              onChange={(event) => { setPaymentSearch(event.target.value); setPaymentPage(1); }}
              placeholder="Search name, biometric ID or phone"
              className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button onClick={downloadPaymentStatus} className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">Export Current List</button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50/70">
          {Object.entries(PAYMENT_CATEGORIES).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => { setPaymentCategory(key); setPaymentPage(1); }}
              className={`text-left rounded-xl border p-4 transition ${paymentCategory === key ? config.activeClass : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <p className="text-xs uppercase font-semibold tracking-wide text-gray-500">{config.label}</p>
              <p className={`mt-1 text-2xl font-bold ${config.valueClass}`}>{paymentStatus?.summary?.[key] || 0}</p>
              <p className="mt-1 text-xs text-gray-500">{paymentStatus?.definitions?.[key]}</p>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr className="text-left">
                {['Subscriber', 'Biometric ID', 'Branch', 'Phone', 'Joining Date', 'Paid Through', 'Latest Payment', paymentCategory === 'missing' ? 'Overdue' : 'Status'].map((column) => (
                  <th key={column} className="px-4 py-2.5 text-xs uppercase text-gray-500 whitespace-nowrap">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiblePaymentRows.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-gray-100 hover:bg-orange-50/40">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {subscriber.is_deleted
                      ? <span className="font-medium text-gray-500">{toTitleCaseDisplay(subscriber.name)}</span>
                      : <button onClick={() => navigate(`/admin/subscribers/${subscriber.id}`)} className="text-left font-medium text-gray-900 hover:text-orange-600 hover:underline">{toTitleCaseDisplay(subscriber.name)}</button>}
                    <p className="text-xs text-gray-400">{subscriber.member_id}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{subscriber.biometric_id || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{subscriber.branch_name || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{subscriber.phone || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDisplayDate(subscriber.joining_date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDisplayDate(subscriber.subscription_end)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {subscriber.latest_payment ? (
                      <><span className="font-medium">{money(subscriber.latest_payment.amount)}</span><p className="text-xs text-gray-400">{formatDisplayDate(subscriber.latest_payment.payment_date)}</p></>
                    ) : <span className="text-gray-400">No payment</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {paymentCategory === 'missing'
                      ? <span className="font-semibold text-red-600">{subscriber.days_overdue ?? '-'} days</span>
                      : <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_CATEGORIES[subscriber.category].badgeClass}`}>{PAYMENT_CATEGORIES[subscriber.category].label}</span>}
                  </td>
                </tr>
              ))}
              {!visiblePaymentRows.length && <tr><td colSpan="8" className="px-4 py-10 text-center text-gray-500">No subscribers found in this category.</td></tr>}
            </tbody>
          </table>
        </div>

        {paymentPageCount > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
            <p className="text-gray-500">Showing {(paymentPage - 1) * paymentPageSize + 1}-{Math.min(paymentPage * paymentPageSize, paymentRows.length)} of {paymentRows.length}</p>
            <div className="flex gap-2">
              <button disabled={paymentPage === 1} onClick={() => setPaymentPage((page) => page - 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Previous</button>
              <button disabled={paymentPage === paymentPageCount} onClick={() => setPaymentPage((page) => page + 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </section>

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

const PAYMENT_CATEGORIES = {
  paid: { label: 'Paid / Current', activeClass: 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200', valueClass: 'text-emerald-700', badgeClass: 'bg-emerald-100 text-emerald-700' },
  missing: { label: 'Missing Payment', activeClass: 'border-red-400 bg-red-50 ring-1 ring-red-200', valueClass: 'text-red-700', badgeClass: 'bg-red-100 text-red-700' },
  left: { label: 'Left', activeClass: 'border-gray-500 bg-gray-100 ring-1 ring-gray-200', valueClass: 'text-gray-700', badgeClass: 'bg-gray-200 text-gray-700' },
  suspended: { label: 'Suspended', activeClass: 'border-amber-400 bg-amber-50 ring-1 ring-amber-200', valueClass: 'text-amber-700', badgeClass: 'bg-amber-100 text-amber-700' },
};

function StatCard({ label, value }) { return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"><p className="text-xs text-gray-500 uppercase font-semibold">{label}</p><p className="mt-2 text-xl font-bold text-gray-900">{value}</p></div>; }
function TableCard({ title, columns, children, onExport }) { return <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-800">{title}</h3>{onExport && <button onClick={onExport} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 font-medium">Export CSV</button>}</div><div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left">{columns.map((col) => <th key={col} className="px-4 py-2 text-xs uppercase text-gray-500">{col}</th>)}</tr></thead><tbody>{children}</tbody></table></div></div>; }
