import { useEffect, useState } from 'react';
import { CalendarDays, Download, Mail, Save, Send } from 'lucide-react';
import api from '../../api';
import { formatDisplayDateTime } from '../../utils/dateFormat';

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function DailyEmailReports() {
  const [settings, setSettings] = useState([]);
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/daily-report-settings')
      .then((response) => setSettings(response.data.map((item) => ({
        ...item,
        recipientText: (item.recipients || []).join(', '),
      }))))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load daily report settings.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateLocal = (branchId, changes) => {
    setSettings((current) => current.map((item) => item.branch_id === branchId ? { ...item, ...changes } : item));
  };

  const recipients = (text) => text.split(/[\s,;]+/).map((email) => email.trim()).filter(Boolean);

  const save = async (item) => {
    setBusy((current) => ({ ...current, [item.branch_id]: 'save' }));
    setError(''); setMessage('');
    try {
      await api.put(`/daily-report-settings/${item.branch_id}`, {
        enabled: item.enabled,
        recipients: recipients(item.recipientText),
      });
      setMessage(`${item.branch_name} report settings saved.`);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || Object.values(requestError.response?.data?.errors || {})[0]?.[0] || 'Unable to save settings.');
    } finally {
      setBusy((current) => ({ ...current, [item.branch_id]: null }));
    }
  };

  const preview = async (item) => {
    setBusy((current) => ({ ...current, [item.branch_id]: 'preview' }));
    setError('');
    try {
      const response = await api.get(`/daily-report-settings/${item.branch_id}/pdf`, { params: { date }, responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setError('Unable to generate the PDF preview.');
    } finally {
      setBusy((current) => ({ ...current, [item.branch_id]: null }));
    }
  };

  const send = async (item) => {
    setBusy((current) => ({ ...current, [item.branch_id]: 'send' }));
    setError(''); setMessage('');
    try {
      await api.put(`/daily-report-settings/${item.branch_id}`, {
        enabled: item.enabled,
        recipients: recipients(item.recipientText),
      });
      await api.post(`/daily-report-settings/${item.branch_id}/send`, { date });
      setMessage(`${item.branch_name} report sent successfully.`);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send the report. Check the mail configuration.');
    } finally {
      setBusy((current) => ({ ...current, [item.branch_id]: null }));
    }
  };

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-2xl bg-gray-900 p-6 text-white sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-400"><Mail className="h-4 w-4" /> Automated Reporting</div>
        <h2 className="text-2xl font-bold">Daily Email Reports</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-300">Send each gym's daily signups, new and renewal fees, expenses, and check-in details as a PDF.</p>
      </div>
      <label className="block min-w-48"><span className="mb-1 block text-xs font-semibold uppercase text-gray-400">Preview / send date</span><div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3"><CalendarDays className="h-4 w-4 text-orange-400" /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full bg-transparent py-2 text-sm text-white outline-none" /></div></label>
    </div>

    {message && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

    {loading ? <div className="rounded-xl border bg-white p-10 text-center text-gray-500">Loading report settings...</div> : <div className="grid gap-4 xl:grid-cols-2">
      {settings.map((item) => <section key={item.branch_id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div><h3 className="font-semibold text-gray-900">{item.branch_name}</h3><p className="mt-1 text-xs text-gray-500">Last sent: {item.last_sent_at ? formatDisplayDateTime(item.last_sent_at) : 'Never'}</p></div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" checked={item.enabled} onChange={(event) => updateLocal(item.branch_id, { enabled: event.target.checked })} className="h-4 w-4 accent-orange-600" /> Enabled</label>
        </div>
        <label className="mt-5 block"><span className="mb-1 block text-xs font-semibold uppercase text-gray-600">Recipient emails</span><textarea rows="3" value={item.recipientText} onChange={(event) => updateLocal(item.branch_id, { recipientText: event.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" /><span className="mt-1 block text-xs text-gray-400">Separate multiple addresses with commas, spaces, or semicolons.</span></label>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button onClick={() => preview(item)} disabled={Boolean(busy[item.branch_id])} className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"><Download className="h-4 w-4" /> Preview PDF</button>
          <button onClick={() => save(item)} disabled={Boolean(busy[item.branch_id])} className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"><Save className="h-4 w-4" /> Save</button>
          <button onClick={() => send(item)} disabled={Boolean(busy[item.branch_id]) || !item.recipientText.trim()} className="flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"><Send className="h-4 w-4" /> Send Now</button>
        </div>
      </section>)}
    </div>}
  </div>;
}
