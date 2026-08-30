import { useEffect, useState } from 'react';
import { CalendarRange, Download } from 'lucide-react';
import api from '../../api';
import { formatDisplayDate, formatDisplayMonth } from '../../utils/dateFormat';
import { toTitleCaseDisplay } from '../../utils/textFormat';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;
const csvEscape = (value) => {
  const raw = String(value ?? '');
  const safe = typeof value === 'string' && /^[=+\-@]/.test(raw.trimStart()) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
};

const localMonth = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const shiftMonth = (value, amount) => {
  const [year, month] = value.split('-').map(Number);
  return localMonth(new Date(year, month - 1 + amount, 1));
};

const downloadCsv = (filename, rows) => {
  const content = `\uFEFF${rows.map((row) => row.map(csvEscape).join(',')).join('\r\n')}`;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const accountingTransactions = (report) => {
  const income = (report?.payments || []).map((payment) => ({
    id: `P-${payment.id}`,
    date: payment.payment_date,
    type: 'Income',
    particulars: `${payment.subscriber_name} - ${payment.category === 'new_member' ? 'New Member Fee' : 'Subscription'}`,
    branch: payment.branch_name,
    account: 'Membership Revenue',
    source: payment.payment_method?.replace('_', ' '),
    reference: payment.reference_number,
    debit: 0,
    credit: Number(payment.amount || 0),
  }));

  const expenses = (report?.expenses || []).map((expense) => ({
    id: `E-${expense.id}`,
    date: expense.expense_date,
    type: 'Expense',
    particulars: expense.description || expense.head_name,
    branch: expense.branch_name,
    account: expense.head_name,
    source: `${expense.paid_by}${expense.payment_method ? ` (${expense.payment_method.replace('_', ' ')})` : ''}`,
    reference: expense.reference_number,
    debit: Number(expense.amount || 0),
    credit: 0,
  }));

  return [...income, ...expenses].sort((a, b) => {
    const dateComparison = String(a.date).localeCompare(String(b.date));
    return dateComparison || a.id.localeCompare(b.id, undefined, { numeric: true });
  });
};

const exportRevenueReport = (filename, report) => {
  const summary = report?.summary || {};
  const selectedBranchId = report?.filters?.branch_id || report?.branches?.selected_branch_id;
  const selectedBranch = report?.branches?.options?.find((branch) => String(branch.id) === String(selectedBranchId));
  const transactions = accountingTransactions(report);
  const netBalance = Number(summary.net_balance || 0);
  let runningBalance = 0;

  const rows = [
    ['SHAPE SHIFTERS - ACCOUNTING DEBIT / CREDIT STATEMENT'],
    ['Period Start', report?.start_date],
    ['Period End', report?.end_date],
    ['Branch', selectedBranch?.name || 'All Branches'],
    [],
    ['ACCOUNT SUMMARY'],
    ['Description', 'Debit (Rs.)', 'Credit (Rs.)'],
    ['Membership Revenue', '', summary.total_revenue],
    ['Expenses', summary.total_expenses, ''],
    ['TOTAL', summary.total_expenses, summary.total_revenue],
    ['NET BALANCE (Credit - Debit)', netBalance < 0 ? Math.abs(netBalance) : '', netBalance >= 0 ? netBalance : ''],
    [],
    ['DEBIT / CREDIT DETAILS'],
    ['Date', 'Voucher', 'Type', 'Particulars', 'Category / Account', 'Branch', 'Paid By / Received Via', 'Reference', 'Debit (Rs.)', 'Credit (Rs.)', 'Running Balance (Rs.)'],
    ...transactions.map((transaction) => {
      runningBalance = Math.round((runningBalance + transaction.credit - transaction.debit) * 100) / 100;
      return [transaction.date, transaction.id, transaction.type, transaction.particulars, transaction.account, transaction.branch, transaction.source, transaction.reference, transaction.debit || '', transaction.credit || '', runningBalance];
    }),
    [],
    ['TOTAL', '', '', '', '', '', '', '', summary.total_expenses, summary.total_revenue, summary.net_balance],
  ];

  downloadCsv(filename, rows);
};

export default function MonthlyRevenueReport() {
  const currentMonth = localMonth();
  const [filters, setFilters] = useState({ month: currentMonth, branch_id: '' });
  const [exportRange, setExportRange] = useState({ start_month: shiftMonth(currentMonth, -5), end_month: currentMonth });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports/monthly-revenue', {
        params: { month: nextFilters.month, branch_id: nextFilters.branch_id || undefined },
      });
      setData(response.data);
      setFilters((current) => ({ ...current, branch_id: current.branch_id || response.data.filters?.branch_id || '' }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load the monthly report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const downloadSelectedMonth = () => {
    const reportMonth = data?.filters?.month || filters.month;
    const reportBranch = data?.filters?.branch_id || 'all-branches';
    exportRevenueReport(
      `monthly_report_${reportMonth}_${reportBranch}.csv`,
      data,
    );
  };

  const downloadMultipleMonths = async () => {
    if (exportRange.start_month > exportRange.end_month) {
      setError('Export start month must be before or equal to the end month.');
      return;
    }

    setExporting(true);
    setError('');
    try {
      const response = await api.get('/reports/monthly-revenue', {
        params: {
          start_month: exportRange.start_month,
          end_month: exportRange.end_month,
          branch_id: filters.branch_id || undefined,
        },
      });
      exportRevenueReport(
        `monthly_report_${exportRange.start_month}_to_${exportRange.end_month}_${filters.branch_id || 'all-branches'}.csv`,
        response.data,
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to download the multi-month report.');
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary || {};
  const dailyRows = data?.daily || [];
  const ledgerRows = data?.ledger || [];
  const displayedMonth = data?.filters?.month || filters.month;

  if (loading && !data) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Monthly Report</h2>
        <p className="mt-1 text-sm text-gray-500">Monthly income, categorized expenses, debit/credit entries, and net balance.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">View Complete Month</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Month</label>
              <input type="month" autoComplete="off" max={currentMonth} value={filters.month} onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Branch</label>
              <select value={filters.branch_id} onChange={(event) => setFilters((current) => ({ ...current, branch_id: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">All Branches</option>
                {data?.branches?.options?.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => fetchReport()} disabled={loading || !filters.month} className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:bg-orange-300">{loading ? 'Loading...' : 'View Report'}</button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800"><CalendarRange className="h-4 w-4 text-orange-500" /> Download Multiple Complete Months</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Start Month</label>
              <input type="month" autoComplete="off" max={currentMonth} value={exportRange.start_month} onChange={(event) => setExportRange((current) => ({ ...current, start_month: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">End Month</label>
              <input type="month" autoComplete="off" max={currentMonth} value={exportRange.end_month} onChange={(event) => setExportRange((current) => ({ ...current, end_month: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end">
              <button onClick={downloadMultipleMonths} disabled={exporting || !exportRange.start_month || !exportRange.end_month} className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"><Download className="h-4 w-4" /> {exporting ? 'Preparing...' : 'Download CSV'}</button>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{formatDisplayMonth(displayedMonth)}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{formatDisplayDate(data?.start_date)} to {formatDisplayDate(data?.end_date)}</p>
          </div>
          <button onClick={downloadSelectedMonth} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-100"><Download className="h-4 w-4" /> Download Accounting CSV</button>
        </div>

        <div className="grid grid-cols-1 gap-px bg-gray-200 sm:grid-cols-2 xl:grid-cols-5">
          <RevenueCard label="Total Revenue" value={money(summary.total_revenue)} detail={`${summary.total_payments || 0} payments`} tone="dark" />
          <RevenueCard label="Total Expenses" value={money(summary.total_expenses)} detail={`${summary.expense_entries || 0} expense entries`} tone="red" />
          <RevenueCard label="Net Balance" value={money(summary.net_balance)} detail="Revenue less expenses" tone={Number(summary.net_balance) >= 0 ? 'green' : 'red'} />
          <RevenueCard label="New Member Payments" value={money(summary.new_member_revenue)} detail={`${summary.new_member_payments || 0} payments from ${summary.new_members || 0} members`} tone="orange" />
          <RevenueCard label="Existing Member Subscriptions" value={money(summary.existing_member_revenue)} detail={`${summary.existing_member_payments || 0} payments from ${summary.existing_members || 0} members`} tone="green" />
        </div>

        <div className="grid grid-cols-1 border-t border-gray-200 xl:grid-cols-[0.9fr_2.1fr]">
          <div className="border-b border-gray-200 xl:border-b-0 xl:border-r">
            <div className="border-b bg-gray-50 px-4 py-3"><h4 className="text-sm font-semibold text-gray-800">Daily Breakdown</h4></div>
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white shadow-sm"><tr className="text-left text-[10px] uppercase tracking-wide text-gray-500"><th className="px-4 py-2">Date</th><th className="px-4 py-2 text-right">Revenue</th><th className="px-4 py-2 text-right">Expenses</th><th className="px-4 py-2 text-right">Net</th></tr></thead>
                <tbody>
                  {dailyRows.map((row) => <tr key={row.date} className="border-t border-gray-100"><td className="px-4 py-2.5 font-medium text-gray-700">{formatDisplayDate(row.date)}</td><td className="px-4 py-2.5 text-right text-green-700"><span className="block">{money(row.total_revenue)}</span><span className="text-[10px] text-gray-400">{row.total_payments} payments</span></td><td className="px-4 py-2.5 text-right text-red-700"><span className="block">{money(row.total_expenses)}</span><span className="text-[10px] text-gray-400">{row.expense_entries} entries</span></td><td className={`px-4 py-2.5 text-right font-semibold ${Number(row.net_balance) < 0 ? 'text-red-700' : 'text-gray-900'}`}>{money(row.net_balance)}</td></tr>)}
                  {dailyRows.length === 0 && <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No accounting entries in this month</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="border-b bg-gray-50 px-4 py-3"><h4 className="text-sm font-semibold text-gray-800">Monthly Debit / Credit Sheet</h4></div>
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 bg-white shadow-sm"><tr className="text-left text-[10px] uppercase tracking-wide text-gray-500"><th className="px-4 py-2">Date</th><th className="px-4 py-2">Description</th><th className="px-4 py-2">Category</th><th className="px-4 py-2">Debit Account</th><th className="px-4 py-2">Credit Account</th><th className="px-4 py-2 text-right">Debit</th><th className="px-4 py-2 text-right">Credit</th></tr></thead>
                <tbody>
                  {ledgerRows.map((entry) => <LedgerRow key={entry.id} entry={entry} />)}
                  {ledgerRows.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No ledger entries found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LedgerRow({ entry }) {
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="whitespace-nowrap px-4 py-2.5">{formatDisplayDate(entry.date)}</td>
      <td className="px-4 py-2.5"><p className="font-medium text-gray-900">{toTitleCaseDisplay(entry.description)}</p><p className="text-xs text-gray-400">{entry.branch_name}</p></td>
      <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${entry.entry_type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{entry.category?.replace('_', ' ')}</span></td>
      <td className="px-4 py-2.5">{entry.debit_account}</td>
      <td className="px-4 py-2.5">{entry.credit_account}</td>
      <td className="px-4 py-2.5 text-right font-semibold text-red-700">{entry.debit ? money(entry.debit) : '—'}</td>
      <td className="px-4 py-2.5 text-right font-semibold text-green-700">{entry.credit ? money(entry.credit) : '—'}</td>
    </tr>
  );
}

function RevenueCard({ label, value, detail, tone }) {
  const toneClasses = tone === 'orange' ? 'bg-orange-50 text-orange-950' : tone === 'green' ? 'bg-green-50 text-green-950' : tone === 'red' ? 'bg-red-50 text-red-950' : 'bg-gray-900 text-white';
  const detailClass = tone === 'dark' ? 'text-gray-300' : 'text-gray-500';
  return <div className={`p-5 ${toneClasses}`}><p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className={`mt-1 text-xs ${detailClass}`}>{detail}</p></div>;
}
