import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api';
import { formatDisplayDate } from '../../utils/dateFormat';

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

export default function SubscribersReportDetails() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          period_type: query.get('period_type') || undefined,
          period: query.get('period') || undefined,
          branch_id: query.get('branch_id') || undefined,
          start_date: query.get('start_date') || undefined,
          end_date: query.get('end_date') || undefined,
        };
        const res = await api.get('/reports/subscriptions/subscribers-list', { params });
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  const rows = data?.subscribers || [];

  const download = () => {
    exportCsv('subscribers_period_details.csv', ['Member ID', 'Name', 'Phone', 'Email', 'Status', 'Branch', 'Joining Date', 'Subscription Start', 'Subscription End'], rows.map((s) => [s.member_id, s.name, s.phone, s.email, s.status, s.branch?.name || '', s.joining_date, s.subscription_start, s.subscription_end]));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/reports/subscribers" className="text-sm text-orange-600 hover:underline">Back to Subscribers Report</Link>
          <h2 className="text-lg font-semibold text-gray-800 mt-1">Subscribers Details</h2>
          <p className="text-sm text-gray-500">Total: {data?.summary?.count || 0} | Active: {data?.summary?.active_count || 0}</p>
        </div>
        <button onClick={download} className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">Download CSV</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50 border-b">
              <th className="px-4 py-2 text-xs uppercase text-gray-500">Member ID</th>
              <th className="px-4 py-2 text-xs uppercase text-gray-500">Name</th>
              <th className="px-4 py-2 text-xs uppercase text-gray-500">Phone</th>
              <th className="px-4 py-2 text-xs uppercase text-gray-500">Status</th>
              <th className="px-4 py-2 text-xs uppercase text-gray-500">Branch</th>
              <th className="px-4 py-2 text-xs uppercase text-gray-500">Joined</th>
              <th className="px-4 py-2 text-xs uppercase text-gray-500">Sub Start</th>
              <th className="px-4 py-2 text-xs uppercase text-gray-500">Sub End</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2">{s.member_id}</td>
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2">{s.phone}</td>
                <td className="px-4 py-2 capitalize">{s.status}</td>
                <td className="px-4 py-2">{s.branch?.name || '-'}</td>
                <td className="px-4 py-2">{formatDisplayDate(s.joining_date)}</td>
                <td className="px-4 py-2">{formatDisplayDate(s.subscription_start)}</td>
                <td className="px-4 py-2">{formatDisplayDate(s.subscription_end)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
