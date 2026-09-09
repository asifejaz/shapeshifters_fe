import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Edit, RotateCcw, ScanLine, CreditCard, User, UserX, Phone, Mail, MapPin, Calendar, History, Trash2, Save, X, MessageCircle, MessageSquare } from 'lucide-react';
import { formatDisplayDate, formatDisplayDateTime } from '../utils/dateFormat';
import { toTitleCaseDisplay } from '../utils/textFormat';
import { hasPendingFee, memberSmsUrl, memberWhatsappUrl } from '../utils/memberMessaging';
import { useAuth } from '../context/AuthContext';

function DateField({ value, onChange, className, required }) {
  return (
    <input
      type="date" autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      required={required}
    />
  );
}

const toDateInputString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addCalendarMonthEndDate = (startDate) => {
  const [year, month, day] = startDate.split('-').map(Number);
  const end = new Date(year, month - 1, day);
  end.setMonth(end.getMonth() + 1);
  end.setDate(end.getDate() - 1);
  return toDateInputString(end);
};

const calculatePlanEndDate = (startDate, plan) => {
  if (!plan || !startDate) return '';

  const isMonthly = plan.billing_cycle === 'monthly' || plan.name?.toLowerCase() === 'monthly';
  if (isMonthly) {
    return addCalendarMonthEndDate(startDate);
  }

  const end = new Date(startDate);
  end.setDate(end.getDate() + Math.max(Number(plan.duration_days || 1) - 1, 0));
  return toDateInputString(end);
};

const calculateNextDueDate = (subscriptionEnd, fallbackDate) => {
  if (!subscriptionEnd) return fallbackDate;

  const [year, month, day] = String(subscriptionEnd).split('T')[0].split('-').map(Number);
  if (!year || !month || !day) return fallbackDate;

  const due = new Date(year, month - 1, day);
  due.setDate(due.getDate() + 1);
  return toDateInputString(due);
};

const activityFieldLabels = {
  member_id: 'Member ID',
  name: 'Name',
  father_husband_name: 'Father/Husband Name',
  email: 'Email',
  phone: 'Phone',
  cnic: 'CNIC',
  gender: 'Gender',
  session: 'Session',
  date_of_birth: 'Date of Birth',
  address: 'Address',
  branch_id: 'Branch ID',
  notes: 'Notes',
  biometric_id: 'Biometric ID',
  fee_plan_id: 'Fee Plan',
  fee_amount: 'Fee Amount',
  registration_fee: 'Registration Fee',
  security_deposit: 'Security Deposit',
  joining_date: 'Joining Date',
  subscription_start: 'Subscription Start',
  subscription_end: 'Subscription End',
  status: 'Status',
  amount: 'Amount',
  type: 'Payment Type',
  payment_method: 'Payment Method',
  reference_number: 'Reference Number',
  payment_date: 'Payment Date',
  period_start: 'Period Start',
  period_end: 'Period End',
};

const dateActivityFields = new Set([
  'date_of_birth',
  'joining_date',
  'subscription_start',
  'subscription_end',
  'payment_date',
  'period_start',
  'period_end',
]);

const moneyActivityFields = new Set(['fee_amount', 'registration_fee', 'security_deposit', 'amount']);

const formatActivityValue = (field, value, feePlans) => {
  if (value === null || value === undefined || value === '') return '—';
  if (field === 'fee_plan_id') {
    return feePlans.find((plan) => plan.id === Number(value))?.name || `Plan #${value}`;
  }
  if (dateActivityFields.has(field)) return formatDisplayDate(value);
  if (moneyActivityFields.has(field)) return `Rs. ${Number(value).toLocaleString()}`;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (['status', 'gender', 'session', 'type', 'payment_method'].includes(field)) {
    return String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  return String(value);
};

const activityChanges = (activity) => {
  const oldValues = activity.old_values || {};
  const newValues = activity.new_values || {};
  return [...new Set([...Object.keys(oldValues), ...Object.keys(newValues)])]
    .filter((field) => field !== 'updated_at')
    .map((field) => ({ field, oldValue: oldValues[field], newValue: newValues[field] }));
};

export default function SubscriberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';
  const today = new Date().toISOString().split('T')[0];
  const [subscriber, setSubscriber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [editingPayment, setEditingPayment] = useState(null);
  const [endingMembership, setEndingMembership] = useState(false);
  const [membershipActionError, setMembershipActionError] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    fee_plan_id: '',
    payment_method: 'cash',
    reference_number: '',
    payment_date: today,
    period_start: '',
    period_end: '',
    notes: '',
  });
  const [feePlans, setFeePlans] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/subscribers/${id}`),
      api.get('/fee-plans'),
    ]).then(([subRes, planRes]) => {
      setSubscriber(subRes.data);
      setFeePlans(planRes.data);
      const defaultPlan = planRes.data.find((plan) => plan.id === Number(subRes.data.fee_plan_id));
      const dueDate = calculateNextDueDate(subRes.data.subscription_end, today);
      setPaymentForm((current) => ({
        ...current,
        amount: current.amount || subRes.data.fee_amount || defaultPlan?.amount || '',
        fee_plan_id: current.fee_plan_id || (defaultPlan ? String(defaultPlan.id) : ''),
        period_start: current.period_start || dueDate,
        period_end: current.period_end || calculatePlanEndDate(dueDate, defaultPlan),
      }));
      setLoading(false);
    });
  }, [id]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    setPaymentError('');

    try {
      const { fee_plan_id, ...payload } = paymentForm;
      const request = {
        ...payload,
        type: 'subscription',
        subscriber_id: id,
        period_start: paymentForm.period_start,
        period_end: paymentForm.period_end,
      };

      if (editingPayment) {
        await api.put(`/payments/${editingPayment.id}`, request);
      } else {
        await api.post('/payments', request);
      }

      const freshSub = await api.get(`/subscribers/${id}`);
      const defaultPlan = feePlans.find((plan) => plan.id === Number(freshSub.data.fee_plan_id));
      const dueDate = calculateNextDueDate(freshSub.data.subscription_end, today);
      setPaymentForm({
        amount: '',
        fee_plan_id: freshSub.data.fee_plan_id ? String(freshSub.data.fee_plan_id) : '',
        payment_method: 'cash',
        reference_number: '',
        payment_date: today,
        period_start: dueDate,
        period_end: calculatePlanEndDate(dueDate, defaultPlan),
        notes: '',
      });
      setEditingPayment(null);
      setShowPaymentForm(false);
      setSubscriber(freshSub.data);
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Unable to record payment');
    } finally {
      setSavingPayment(false);
    }
  };

  const refreshSubscriber = async () => {
    const res = await api.get(`/subscribers/${id}`);
    setSubscriber(res.data);
  };

  const handleDeletePayment = async (payment) => {
    if (!window.confirm('Soft delete this payment? It will remain visible as deleted.')) return;
    await api.delete(`/payments/${payment.id}`);
    await refreshSubscriber();
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentError('');
    setPaymentForm({
      amount: payment.amount || '',
      fee_plan_id: subscriber.fee_plan_id ? String(subscriber.fee_plan_id) : '',
      payment_method: payment.payment_method || 'cash',
      reference_number: payment.reference_number || '',
      payment_date: payment.payment_date || today,
      period_start: payment.period_start || '',
      period_end: payment.period_end || '',
      notes: payment.notes || '',
    });
    setShowPaymentForm(true);
  };

  const updatePaymentForm = (changes) => {
    setPaymentForm((current) => {
      const next = { ...current, ...changes };

      if ('fee_plan_id' in changes) {
        const plan = feePlans.find((p) => p.id === Number(changes.fee_plan_id));
        next.amount = plan?.amount || sub.fee_amount || current.amount;
        next.period_end = calculatePlanEndDate(next.period_start, plan) || current.period_end;
      }

      if ('period_start' in changes && next.fee_plan_id) {
        const plan = feePlans.find((p) => p.id === Number(next.fee_plan_id));
        next.period_end = calculatePlanEndDate(changes.period_start, plan) || next.period_end;
      }

      return next;
    });
  };

  const togglePaymentForm = () => {
    if (!showPaymentForm && subscriber) {
      const defaultPlan = feePlans.find((plan) => plan.id === Number(subscriber.fee_plan_id));
      const dueDate = calculateNextDueDate(subscriber.subscription_end, today);
      setEditingPayment(null);
      setPaymentError('');
      setPaymentForm((current) => ({
        ...current,
        amount: current.amount || subscriber.fee_amount || defaultPlan?.amount || '',
        fee_plan_id: current.fee_plan_id || (defaultPlan ? String(defaultPlan.id) : ''),
        period_start: dueDate,
        period_end: calculatePlanEndDate(dueDate, defaultPlan),
      }));
    }

    if (showPaymentForm) {
      setEditingPayment(null);
    }

    setShowPaymentForm(!showPaymentForm);
  };

  const handleEndMembership = async () => {
    const confirmed = window.confirm(
      `End ${subscriber.name}'s membership? Their history will be preserved, biometric access will be disabled, and biometric ID ${subscriber.biometric_id} can be assigned to another member.`
    );
    if (!confirmed) return;

    setEndingMembership(true);
    setMembershipActionError('');

    try {
      await api.patch(`/subscribers/${id}/end-membership`);
      await refreshSubscriber();
      setShowPaymentForm(false);
    } catch (err) {
      setMembershipActionError(err.response?.data?.message || 'Unable to end membership');
    } finally {
      setEndingMembership(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      </div>
    );
  }

  const sub = subscriber;
  const isExpired = new Date(sub.subscription_end) < new Date();
  const isInactive = sub.status === 'inactive';
  const canSendFeeReminder = hasPendingFee(sub);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/subscribers')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{toTitleCaseDisplay(sub.name)}</h2>
            <p className="text-sm text-gray-500 font-mono">{sub.member_id}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {canSendFeeReminder && (
            <>
              <a
                href={memberWhatsappUrl(sub)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-green-200 bg-white hover:bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2"
                title="Open WhatsApp with a fee reminder"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a
                href={memberSmsUrl(sub)}
                className="px-4 py-2 border border-sky-200 bg-white hover:bg-sky-50 text-sky-700 rounded-lg text-sm font-medium flex items-center gap-2"
                title="Open SMS with a fee reminder"
              >
                <MessageSquare className="w-4 h-4" /> SMS
              </a>
            </>
          )}
          {!isInactive && (
            <>
              <button
                onClick={handleEndMembership}
                disabled={endingMembership}
                className="px-4 py-2 border border-red-200 bg-white hover:bg-red-50 disabled:opacity-60 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <UserX className="w-4 h-4" /> {endingMembership ? 'Ending...' : 'End Membership'}
              </button>
              <button
                onClick={togglePaymentForm}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Renew
              </button>
            </>
          )}
          <Link
            to={`/admin/subscribers/${id}/edit`}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Edit
          </Link>
        </div>
      </div>

      {membershipActionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {membershipActionError}
        </div>
      )}

      {/* Record payment form */}
      {showPaymentForm && (
        <form onSubmit={handlePaymentSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{editingPayment ? 'Edit Payment' : 'Renew Subscription'}</h3>
            <button type="button" onClick={() => { setShowPaymentForm(false); setEditingPayment(null); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {paymentError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {paymentError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.) *</label>
              <input type="number" step="0.01" min="0" value={paymentForm.amount} onChange={(e) => updatePaymentForm({ amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
              <select value={paymentForm.fee_plan_id} onChange={(e) => updatePaymentForm({ fee_plan_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="">Custom</option>
                {feePlans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} - Rs. {p.amount}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select value={paymentForm.payment_method} onChange={(e) => updatePaymentForm({ payment_method: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <DateField value={paymentForm.payment_date} onChange={(value) => updatePaymentForm({ payment_date: value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Start *</label>
              <DateField value={paymentForm.period_start} onChange={(value) => updatePaymentForm({ period_start: value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period End *</label>
              <DateField value={paymentForm.period_end} onChange={(value) => updatePaymentForm({ period_end: value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference #</label>
              <input type="text" value={paymentForm.reference_number} onChange={(e) => updatePaymentForm({ reference_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={paymentForm.notes} onChange={(e) => updatePaymentForm({ notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => { setShowPaymentForm(false); setEditingPayment(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
            <button type="submit" disabled={savingPayment} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" /> {savingPayment ? 'Saving...' : editingPayment ? 'Update Payment' : 'Renew'}
            </button>
          </div>
        </form>
      )}

      {/* Status banner */}
      <div className={`p-4 rounded-xl ${isInactive ? 'bg-gray-100 border border-gray-200' : isExpired ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isInactive ? 'bg-gray-200 text-gray-700' : isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {sub.status.toUpperCase()}
            </span>
            <span className="ml-3 text-sm text-gray-600">
              Subscription: {formatDisplayDate(sub.subscription_start)} → {formatDisplayDate(sub.subscription_end)}
            </span>
          </div>
          {isInactive ? <span className="text-gray-600 font-medium text-sm">MEMBERSHIP ENDED</span> : isExpired && <span className="text-red-600 font-medium text-sm">EXPIRED</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Details</h3>
          <div className="space-y-3">
            <InfoRow icon={User} label="Full Name" value={toTitleCaseDisplay(sub.name)} />
            <InfoRow icon={User} label="Father/Husband" value={toTitleCaseDisplay(sub.father_husband_name)} />
            <InfoRow icon={Phone} label="Contact" value={sub.phone} />
            <InfoRow icon={Mail} label="Email" value={sub.email || '—'} />
            <InfoRow icon={CreditCard} label="CNIC" value={sub.cnic || '—'} />
            <InfoRow icon={User} label="Gender" value={sub.gender === 'male' ? 'Male (Boys)' : 'Female (Girls)'} />
            <InfoRow icon={Calendar} label="Session" value={sub.session} />
            {sub.address && <InfoRow icon={MapPin} label="Address" value={sub.address} />}
          </div>
        </div>

        {/* Fee Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Details</h3>
          <div className="space-y-3">
            <InfoRow icon={CreditCard} label="Fee Plan" value={sub.fee_plan?.name || 'Custom'} />
            <InfoRow icon={CreditCard} label="Fee Amount" value={`Rs. ${sub.fee_amount}`} />
            <InfoRow icon={CreditCard} label="Registration Fee" value={`Rs. ${sub.registration_fee}`} />
            <InfoRow icon={CreditCard} label="Security Deposit" value={`Rs. ${sub.security_deposit}`} />
            <InfoRow icon={Calendar} label="Joining Date" value={formatDisplayDate(sub.joining_date)} />
            <InfoRow icon={Calendar} label="Branch" value={sub.branch?.name} />
            {sub.biometric_id && <InfoRow icon={ScanLine} label="Biometric ID" value={sub.biometric_id} />}
          </div>
        </div>
      </div>

      {/* Services */}
      {sub.services?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Packages</h3>
          <div className="flex flex-wrap gap-2">
            {sub.services.map((s) => (
              <span key={s.id} className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                {s.name}
                {s.pivot?.fee_override && ` (Rs. ${s.pivot.fee_override})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {sub.emergency_contacts?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contacts</h3>
          <div className="space-y-2">
            {sub.emergency_contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">{toTitleCaseDisplay(c.name)}</p>
                  {c.relationship && <p className="text-xs text-gray-500">{c.relationship}</p>}
                </div>
                <a href={`tel:${c.phone}`} className="text-orange-600 font-medium text-sm">{c.phone}</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      {sub.checkins?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Check-ins</h3>
          <div className="space-y-2">
            {sub.checkins.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <span className="text-gray-700">{formatDisplayDateTime(c.checked_in_at)}</span>
                <span className="capitalize px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{c.method}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments */}
      {sub.payments?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Amount</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Type</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Method</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Period</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                  {!isStaff && <th className="text-right py-2 px-3 font-medium text-gray-500">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sub.payments.map((p) => (
                  <tr key={p.id} className={`border-b border-gray-100 ${p.deleted_at ? 'bg-red-50/50 text-gray-400' : ''}`}>
                    <td className="py-2 px-3">{formatDisplayDate(p.payment_date)}</td>
                    <td className="py-2 px-3 font-medium">Rs. {p.amount}</td>
                    <td className="py-2 px-3 capitalize">{p.type.replace('_', ' ')}</td>
                    <td className="py-2 px-3 capitalize">{p.payment_method.replace('_', ' ')}</td>
                    <td className="py-2 px-3 text-gray-500">{p.period_start && `${formatDisplayDate(p.period_start)} → ${formatDisplayDate(p.period_end)}`}</td>
                    <td className="py-2 px-3">
                      {p.deleted_at ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Deleted</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                      )}
                    </td>
                    {!isStaff && <td className="py-2 px-3 text-right">
                      {!p.deleted_at && (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEditPayment(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit payment">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeletePayment(p)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete payment">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change history */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-orange-500" /> Change History
        </h3>
        {sub.activity_logs?.length > 0 ? (
          <div className="space-y-3">
            {sub.activity_logs.map((activity) => {
              const changes = activityChanges(activity);
              const categoryClass = activity.category === 'payment'
                ? 'bg-green-100 text-green-700'
                : activity.category === 'fee'
                  ? 'bg-blue-100 text-blue-700'
                  : activity.category === 'membership'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700';

              return (
                <div key={activity.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-gray-800">{activity.description}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${categoryClass}`}>
                          {activity.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        By {activity.user?.name || 'System'}
                        {activity.user?.email && ` (${activity.user.email})`}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-gray-500">{formatDisplayDateTime(activity.created_at)}</p>
                  </div>

                  {changes.length > 0 && (
                    <details className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
                      <summary className="cursor-pointer text-xs font-medium text-gray-600">
                        View details ({changes.length} {changes.length === 1 ? 'field' : 'fields'})
                      </summary>
                      <div className="mt-3 space-y-2">
                        {changes.map(({ field, oldValue, newValue }) => (
                          <div key={field} className="grid gap-1 border-t border-gray-200 pt-2 text-xs sm:grid-cols-[150px_1fr]">
                            <span className="font-medium text-gray-600">{activityFieldLabels[field] || field.replaceAll('_', ' ')}</span>
                            <span className="text-gray-700">
                              {oldValue !== undefined && newValue !== undefined ? (
                                <>
                                  <span className="text-gray-400 line-through">{formatActivityValue(field, oldValue, feePlans)}</span>
                                  <span className="mx-2 text-gray-400">→</span>
                                  <span className="font-medium">{formatActivityValue(field, newValue, feePlans)}</span>
                                </>
                              ) : newValue !== undefined ? (
                                <span className="font-medium">{formatActivityValue(field, newValue, feePlans)}</span>
                              ) : (
                                <span className="text-gray-400 line-through">{formatActivityValue(field, oldValue, feePlans)}</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            No activity has been recorded for this subscriber yet.
          </p>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 capitalize">{value}</p>
      </div>
    </div>
  );
}
