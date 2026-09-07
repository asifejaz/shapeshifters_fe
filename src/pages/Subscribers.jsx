import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';
import { Plus, Search, Eye, Edit, CreditCard, X } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateFormat';
import { toTitleCaseDisplay } from '../utils/textFormat';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', subscription_status: '', branch_id: '', gender: '', session: '' });
  const [branches, setBranches] = useState([]);
  const [feePlans, setFeePlans] = useState([]);
  const [quickPaymentSubscriber, setQuickPaymentSubscriber] = useState(null);
  const [quickPaymentForm, setQuickPaymentForm] = useState({
    fee_plan_id: '',
    fee_amount: '',
    subscription_start: new Date().toISOString().split('T')[0],
    subscription_end: '',
    payment_method: 'cash',
  });
  const [quickPaymentError, setQuickPaymentError] = useState('');
  const [savingQuickPayment, setSavingQuickPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const location = useLocation();

  useEffect(() => {
    Promise.all([
      api.get('/branches'),
      api.get('/fee-plans'),
    ]).then(([branchRes, feePlanRes]) => {
      setBranches(branchRes.data);
      setFeePlans(feePlanRes.data);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subscriptionStatus = params.get('subscription_status') || '';

    setFilters((prev) => {
      if (prev.subscription_status === subscriptionStatus) {
        return prev;
      }

      return { ...prev, subscription_status: subscriptionStatus };
    });
    setPage(1);
  }, [location.search]);

  useEffect(() => {
    fetchSubscribers();
  }, [page, filters]);

  const fetchSubscribers = (targetPage = page) => {
    setLoading(true);
    const params = { page: targetPage, per_page: 100, search, ...filters };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    api.get('/subscribers', { params }).then((res) => {
      setSubscribers(res.data.data);
      setPagination(res.data);
      setLoading(false);
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubscribers(1);
  };

  const calculateEndDate = (startDate, planId) => {
    const plan = feePlans.find((p) => p.id === Number(planId));
    if (!plan || !startDate) return '';

    const end = new Date(startDate);
    end.setDate(end.getDate() + Math.max(Number(plan.duration_days || 1) - 1, 0));
    return end.toISOString().split('T')[0];
  };

  const openQuickPayment = (subscriber) => {
    const today = new Date().toISOString().split('T')[0];
    const feePlanId = subscriber.fee_plan_id || '';
    const nextEndDate = calculateEndDate(today, feePlanId);

    setQuickPaymentSubscriber(subscriber);
    setQuickPaymentError('');
    setQuickPaymentForm({
      fee_plan_id: feePlanId,
      fee_amount: subscriber.feePlan?.amount || subscriber.fee_amount || '',
      subscription_start: today,
      subscription_end: nextEndDate || subscriber.subscription_end || '',
      payment_method: 'cash',
    });
  };

  const updateQuickPaymentForm = (changes) => {
    setQuickPaymentForm((current) => {
      const next = { ...current, ...changes };

      if ('fee_plan_id' in changes) {
        const plan = feePlans.find((p) => p.id === Number(changes.fee_plan_id));
        next.fee_amount = plan?.amount || current.fee_amount;
        next.subscription_end = calculateEndDate(next.subscription_start, changes.fee_plan_id) || current.subscription_end;
      }

      if ('subscription_start' in changes && next.fee_plan_id) {
        next.subscription_end = calculateEndDate(changes.subscription_start, next.fee_plan_id) || next.subscription_end;
      }

      return next;
    });
  };

  const handleQuickPayment = async (e) => {
    e.preventDefault();
    if (!quickPaymentSubscriber) return;

    setSavingQuickPayment(true);
    setQuickPaymentError('');

    try {
      await api.post(`/subscribers/${quickPaymentSubscriber.id}/renew`, quickPaymentForm);
      setQuickPaymentSubscriber(null);
      fetchSubscribers();
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to add payment. Please check the form and try again.';
      setQuickPaymentError(message);
    } finally {
      setSavingQuickPayment(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, biometric ID, phone, CNIC..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          <button type="submit" className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Search
          </button>
        </form>
        <Link
          to="/admin/subscribers/new"
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Subscriber
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={filters.subscription_status}
          onChange={(e) => { setFilters({ ...filters, subscription_status: e.target.value }); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Subscription Dates</option>
          <option value="expired">Expired by Date</option>
          <option value="expiring_soon">Expiring Soon (7d)</option>
        </select>
        <select
          value={filters.branch_id}
          onChange={(e) => { setFilters({ ...filters, branch_id: e.target.value }); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={filters.gender}
          onChange={(e) => { setFilters({ ...filters, gender: e.target.value }); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Gender</option>
          <option value="male">Boys</option>
          <option value="female">Girls</option>
        </select>
        <select
          value={filters.session}
          onChange={(e) => { setFilters({ ...filters, session: e.target.value }); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Sessions</option>
          <option value="morning">Morning</option>
          <option value="evening">Evening</option>
        </select>
      </div>

      {quickPaymentSubscriber && (
        <form onSubmit={handleQuickPayment} className="bg-white rounded-xl shadow-sm border border-green-200 p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Add Payment / Renew</h3>
              <p className="text-sm text-gray-500">
                {toTitleCaseDisplay(quickPaymentSubscriber.name)} · {quickPaymentSubscriber.member_id}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuickPaymentSubscriber(null)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {quickPaymentError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {quickPaymentError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Plan</label>
              <select
                value={quickPaymentForm.fee_plan_id}
                onChange={(e) => updateQuickPaymentForm({ fee_plan_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">Custom</option>
                {feePlans.filter((plan) => plan.is_active).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - Rs. {plan.amount}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={quickPaymentForm.fee_amount}
                onChange={(e) => updateQuickPaymentForm({ fee_amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>
            <DateField
              label="Start Date"
              value={quickPaymentForm.subscription_start}
              onChange={(value) => updateQuickPaymentForm({ subscription_start: value })}
            />
            <DateField
              label="End Date"
              value={quickPaymentForm.subscription_end}
              onChange={(value) => updateQuickPaymentForm({ subscription_end: value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={quickPaymentForm.payment_method}
                onChange={(e) => updateQuickPaymentForm({ payment_method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setQuickPaymentSubscriber(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingQuickPayment}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg text-sm font-medium"
            >
              {savingQuickPayment ? 'Saving...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Biometric ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Branch</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Session</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Joining Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Expires</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">No subscribers found</td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">
                      <Link
                        to={`/admin/subscribers/${sub.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 hover:underline"
                      >
                        {sub.biometric_id || '-'}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <Link
                          to={`/admin/subscribers/${sub.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-800 hover:text-blue-600 hover:underline"
                        >
                          {toTitleCaseDisplay(sub.name)}
                        </Link>
                        <p className="text-xs text-gray-400 capitalize">{sub.gender}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{sub.phone}</td>
                    <td className="py-3 px-4 text-gray-600">{sub.branch?.name}</td>
                    <td className="py-3 px-4 capitalize text-gray-600">{sub.session}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDisplayDate(sub.joining_date)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDisplayDate(sub.subscription_end)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : sub.status === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : sub.status === 'suspended'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/subscribers/${sub.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View in new tab"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/subscribers/${sub.id}/edit`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit in new tab"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openQuickPayment(sub)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Add payment"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {pagination.from}–{pagination.to} of {pagination.total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-sm ${
                    p === pagination.current_page
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="date" autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        required
      />
    </div>
  );
}
