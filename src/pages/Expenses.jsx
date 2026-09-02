import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Save, Trash2, X } from 'lucide-react';
import api from '../api';
import { formatDisplayDate } from '../utils/dateFormat';
import { toTitleCaseDisplay } from '../utils/textFormat';
import { useAuth } from '../context/AuthContext';

const today = () => new Date().toISOString().slice(0, 10);
const thisMonth = () => today().slice(0, 7);
const emptyForm = { expense_head_id: '', branch_id: '', amount: '', expense_date: today(), paid_by: '', payment_method: 'cash', reference_number: '', description: '' };
const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

export default function Expenses() {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';
  const [expenses, setExpenses] = useState([]);
  const [heads, setHeads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ month: thisMonth(), branch_id: '', expense_head_id: '' });
  const [form, setForm] = useState(emptyForm);
  const [headForm, setHeadForm] = useState({ name: '', category: 'expense' });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showHeadForm, setShowHeadForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadOptions = async () => {
    const [headResponse, branchResponse] = await Promise.all([api.get('/expense-heads'), api.get('/branches', { params: { per_page: 100 } })]);
    setHeads(headResponse.data.data || []);
    setCategories(headResponse.data.categories || []);
    setBranches(branchResponse.data.data || branchResponse.data || []);
  };

  const loadExpenses = async (page = 1) => {
    setLoading(true); setError('');
    try {
      const response = await api.get('/expenses', { params: { ...filters, page, per_page: 25, branch_id: filters.branch_id || undefined, expense_head_id: filters.expense_head_id || undefined } });
      setExpenses(response.data.data || []); setPagination(response.data);
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load expenses.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get('/expense-heads'), api.get('/branches', { params: { per_page: 100 } })])
      .then(([headResponse, branchResponse]) => {
        if (cancelled) return;
        setHeads(headResponse.data.data || []);
        setCategories(headResponse.data.categories || []);
        setBranches(branchResponse.data.data || branchResponse.data || []);
      })
      .catch(() => { if (!cancelled) setError('Unable to load expense options.'); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    let cancelled = false;
    api.get('/expenses', { params: { month: filters.month, page: 1, per_page: 25, branch_id: filters.branch_id || undefined, expense_head_id: filters.expense_head_id || undefined } })
      .then((response) => {
        if (cancelled) return;
        setExpenses(response.data.data || []); setPagination(response.data); setLoading(false);
      })
      .catch((requestError) => { if (!cancelled) { setError(requestError.response?.data?.message || 'Unable to load expenses.'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [filters.month, filters.branch_id, filters.expense_head_id]);
  const total = useMemo(() => expenses.reduce((sum, expense) => sum + Number(expense.amount), 0), [expenses]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, branch_id: filters.branch_id }); setShowForm(true); };
  const openEdit = (expense) => {
    setEditing(expense);
    setForm({ expense_head_id: expense.expense_head_id, branch_id: expense.branch_id, amount: expense.amount, expense_date: expense.expense_date, paid_by: expense.paid_by, payment_method: expense.payment_method, reference_number: expense.reference_number || '', description: expense.description || '' });
    setShowForm(true);
  };

  const submitExpense = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await api.put(`/expenses/${editing.id}`, form); else await api.post('/expenses', form);
      setShowForm(false); setEditing(null); setForm(emptyForm); await loadExpenses();
    } catch (requestError) { setError(requestError.response?.data?.message || Object.values(requestError.response?.data?.errors || {})[0]?.[0] || 'Unable to save expense.'); }
    finally { setSaving(false); }
  };

  const submitHead = async () => {
    setSaving(true); setError('');
    try {
      const response = await api.post('/expense-heads', headForm);
      await loadOptions(); setForm((current) => ({ ...current, expense_head_id: response.data.id }));
      setHeadForm({ name: '', category: 'expense' }); setShowHeadForm(false);
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to add expense head.'); }
    finally { setSaving(false); }
  };

  const removeExpense = async (expense) => {
    if (!window.confirm(`Delete ${expense.head?.name} expense of ${money(expense.amount)}?`)) return;
    await api.delete(`/expenses/${expense.id}`); await loadExpenses();
  };

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-lg font-semibold text-gray-800">Expenses</h2><p className="mt-1 text-sm text-gray-500">Record each expense against a head and the person or account that paid it.</p></div>
      <button onClick={openCreate} className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"><Plus className="h-4 w-4" /> Record Expense</button>
    </div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

    {showForm && <form onSubmit={submitExpense} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-gray-800">{editing ? 'Edit Expense' : 'Record Expense'}</h3><p className="text-xs text-gray-500">The expense head is debited and “paid by” is credited in the monthly sheet.</p></div><button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Expense Head *"><div className="flex gap-2"><select required value={form.expense_head_id} onChange={(e) => setForm({ ...form, expense_head_id: e.target.value })} className="input min-w-0 flex-1 bg-white"><option value="">Select a head</option>{heads.map((head) => <option key={head.id} value={head.id}>{toTitleCaseDisplay(head.category)} — {head.name}</option>)}</select>{!isStaff && <button type="button" onClick={() => setShowHeadForm(!showHeadForm)} className="rounded-lg border border-gray-300 px-3 text-gray-600" title="Add expense head"><Plus className="h-4 w-4" /></button>}</div></Field>
        <Field label="Amount (Rs.) *"><input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input" /></Field>
        <Field label="Expense Date *"><input required type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="input" /></Field>
        <Field label="Paid By *"><input required placeholder="e.g. Cash Account, Asif, Petty Cash" value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })} className="input" /></Field>
        <Field label="Payment Method *"><select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="input bg-white"><option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="card">Card</option><option value="personal">Personal Funds</option></select></Field>
        <Field label="Branch (required for super admin)"><select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} className="input bg-white"><option value="">My assigned branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></Field>
        <Field label="Reference"><input value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} className="input" /></Field>
        <div className="md:col-span-2"><Field label="Description"><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" placeholder="What was purchased or repaired?" /></Field></div>
      </div>
      {!isStaff && showHeadForm && <div className="mt-4 grid gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 sm:grid-cols-[1fr_180px_auto]"><input placeholder="New head name" value={headForm.name} onChange={(e) => setHeadForm({ ...headForm, name: e.target.value })} className="input" /><select value={headForm.category} onChange={(e) => setHeadForm({ ...headForm, category: e.target.value })} className="input bg-white">{categories.map((category) => <option key={category} value={category}>{toTitleCaseDisplay(category)}</option>)}</select><button type="button" onClick={submitHead} disabled={!headForm.name || saving} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50">Add Head</button></div>}
      <div className="mt-4 flex justify-end"><button disabled={saving} className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? 'Saving...' : editing ? 'Update Expense' : 'Save Expense'}</button></div>
    </form>}

    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="grid gap-3 border-b border-gray-200 p-4 sm:grid-cols-3"><Field label="Month"><input type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} className="input" /></Field><Field label="Branch"><select value={filters.branch_id} onChange={(e) => setFilters({ ...filters, branch_id: e.target.value })} className="input bg-white"><option value="">All accessible branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></Field><Field label="Expense Head"><select value={filters.expense_head_id} onChange={(e) => setFilters({ ...filters, expense_head_id: e.target.value })} className="input bg-white"><option value="">All heads</option>{heads.map((head) => <option key={head.id} value={head.id}>{head.name}</option>)}</select></Field></div>
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3 text-sm"><span className="font-medium text-gray-700">{pagination.total || 0} entries</span><span className="font-bold text-red-700">Page total: {money(total)}</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="text-left text-xs uppercase text-gray-500"><th className="px-4 py-3">Date / Branch</th><th className="px-4 py-3">Category / Head (Debit)</th><th className="px-4 py-3">Paid By (Credit)</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Description</th><th className="px-4 py-3 text-right">Amount</th>{!isStaff && <th className="px-4 py-3 text-right">Actions</th>}</tr></thead><tbody>
        {loading ? <tr><td colSpan={isStaff ? 6 : 7} className="py-10 text-center text-gray-500">Loading...</td></tr> : expenses.length === 0 ? <tr><td colSpan={isStaff ? 6 : 7} className="py-10 text-center text-gray-500">No expenses found for these filters.</td></tr> : expenses.map((expense) => <tr key={expense.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-4 py-3"><p>{formatDisplayDate(expense.expense_date)}</p><p className="text-xs text-gray-400">{expense.branch?.name}</p></td><td className="px-4 py-3"><span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700">{expense.head?.category}</span><p className="mt-1 font-medium">{expense.head?.name}</p></td><td className="px-4 py-3 font-medium">{expense.paid_by}</td><td className="px-4 py-3 capitalize">{expense.payment_method?.replace('_', ' ')}</td><td className="max-w-xs px-4 py-3 text-gray-500">{expense.description || expense.reference_number || '—'}</td><td className="px-4 py-3 text-right font-bold text-red-700">{money(expense.amount)}</td>{!isStaff && <td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => openEdit(expense)} className="rounded p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Edit className="h-4 w-4" /></button><button onClick={() => removeExpense(expense)} className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>}</tr>)}
      </tbody></table></div>
      {pagination.last_page > 1 && <div className="flex justify-end gap-2 border-t p-3"><button disabled={pagination.current_page <= 1} onClick={() => loadExpenses(pagination.current_page - 1)} className="rounded border px-3 py-1 text-sm disabled:opacity-40">Previous</button><span className="px-2 py-1 text-sm">Page {pagination.current_page} of {pagination.last_page}</span><button disabled={pagination.current_page >= pagination.last_page} onClick={() => loadExpenses(pagination.current_page + 1)} className="rounded border px-3 py-1 text-sm disabled:opacity-40">Next</button></div>}
    </div>
  </div>;
}

function Field({ label, children }) { return <label className="block"><span className="mb-1 block text-xs font-semibold uppercase text-gray-600">{label}</span>{children}</label>; }
