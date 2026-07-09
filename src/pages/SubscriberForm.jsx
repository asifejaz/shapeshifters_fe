import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';

const toDateInputValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.split('T')[0].split(' ')[0];
  return '';
};

const calculatePlanEndDate = (startDate, plan) => {
  if (!plan || !startDate) return '';

  const end = new Date(startDate);
  end.setDate(end.getDate() + Math.max(Number(plan.duration_days || 1) - 1, 0));
  return end.toISOString().split('T')[0];
};

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

export default function SubscriberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [branches, setBranches] = useState([]);
  const [feePlans, setFeePlans] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    name: '',
    father_husband_name: '',
    email: '',
    phone: '',
    cnic: '',
    gender: 'male',
    session: 'morning',
    date_of_birth: '',
    address: '',
    branch_id: '',
    fee_plan_id: '',
    fee_amount: 0,
    registration_fee: 0,
    security_deposit: 0,
    joining_date: new Date().toISOString().split('T')[0],
    subscription_start: new Date().toISOString().split('T')[0],
    subscription_end: '',
    notes: '',
    biometric_id: '',
    services: [],
    emergency_contacts: [{ name: '', phone: '', relationship: '' }],
  });

  useEffect(() => {
    Promise.all([
      api.get('/branches'),
      api.get('/fee-plans'),
    ]).then(([branchRes, planRes]) => {
      const plans = planRes.data;
      setBranches(branchRes.data);
      setFeePlans(plans);

      if (!isEdit) {
        const defaultPlan = plans.find((plan) => plan.is_active && plan.billing_cycle === 'monthly')
          || plans.find((plan) => plan.is_active);

        if (defaultPlan) {
          setForm((prev) => {
            if (prev.fee_plan_id) return prev;

            return {
              ...prev,
              fee_plan_id: String(defaultPlan.id),
              fee_amount: defaultPlan.amount || prev.fee_amount,
              subscription_start: prev.joining_date,
              subscription_end: calculatePlanEndDate(prev.joining_date, defaultPlan),
            };
          });
        }
      }
    });
  }, [isEdit]);

  // Fetch services when gender changes
  useEffect(() => {
    if (form.gender) {
      api.get('/services', { params: { gender: form.gender } }).then((res) => {
        setServices(res.data);
      });
    }
  }, [form.gender]);

  // Load existing subscriber for edit
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/subscribers/${id}`).then((res) => {
        const sub = res.data;
        setForm({
          name: sub.name || '',
          father_husband_name: sub.father_husband_name || '',
          email: sub.email || '',
          phone: sub.phone || '',
          cnic: sub.cnic || '',
          gender: sub.gender || 'male',
          session: sub.session || 'morning',
          date_of_birth: toDateInputValue(sub.date_of_birth),
          address: sub.address || '',
          branch_id: sub.branch_id || '',
          fee_plan_id: sub.fee_plan_id || '',
          fee_amount: sub.fee_amount || 0,
          registration_fee: sub.registration_fee || 0,
          security_deposit: sub.security_deposit || 0,
          joining_date: toDateInputValue(sub.joining_date),
          subscription_start: toDateInputValue(sub.subscription_start),
          subscription_end: toDateInputValue(sub.subscription_end),
          notes: sub.notes || '',
          biometric_id: sub.biometric_id || '',
          services: sub.services?.map((s) => ({ id: s.id })) || [],
          emergency_contacts: sub.emergency_contacts?.length > 0
            ? sub.emergency_contacts.map((c) => ({ name: c.name, phone: c.phone, relationship: c.relationship || '' }))
            : [{ name: '', phone: '', relationship: '' }],
        });
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  // Auto-calculate subscription end when fee plan changes
  const calculateSubscriptionEndDate = (startDate, planId) => {
    const plan = feePlans.find((p) => p.id === Number(planId));
    return calculatePlanEndDate(startDate, plan);
  };

  const handlePlanChange = (planId) => {
    setForm((prev) => {
      const plan = feePlans.find((p) => p.id === Number(planId));
      if (plan) {
        return {
          ...prev,
          fee_plan_id: planId,
          fee_amount: plan.amount || prev.fee_amount,
          subscription_start: prev.joining_date,
          subscription_end: calculateSubscriptionEndDate(prev.joining_date, planId),
        };
      }
      return { ...prev, fee_plan_id: planId };
    });
  };

  const handleJoiningDateChange = (joiningDate) => {
    setForm((prev) => ({
      ...prev,
      joining_date: joiningDate,
      subscription_start: joiningDate,
      subscription_end: prev.fee_plan_id
        ? calculateSubscriptionEndDate(joiningDate, prev.fee_plan_id)
        : prev.subscription_end,
    }));
  };

  const handleServiceToggle = (serviceId) => {
    setForm((prev) => {
      const exists = prev.services.find((s) => s.id === serviceId);
      if (exists) {
        return { ...prev, services: prev.services.filter((s) => s.id !== serviceId) };
      }
      return { ...prev, services: [...prev.services, { id: serviceId }] };
    });
  };

  const addEmergencyContact = () => {
    setForm((prev) => ({
      ...prev,
      emergency_contacts: [...prev.emergency_contacts, { name: '', phone: '', relationship: '' }],
    }));
  };

  const removeEmergencyContact = (index) => {
    setForm((prev) => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts.filter((_, i) => i !== index),
    }));
  };

  const updateEmergencyContact = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError('');

    try {
      const payload = {
        ...form,
        emergency_contacts: form.emergency_contacts.filter((c) => c.name && c.phone),
        services: form.services.map((s) => ({
          id: s.id,
        })),
      };

      if (isEdit) {
        await api.put(`/subscribers/${id}`, payload);
      } else {
        await api.post('/subscribers', payload);
      }
      navigate('/admin/subscribers');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        setFormError(err.response.data.message || 'Please fix the highlighted fields and try again.');
      } else {
        setFormError(err.response?.data?.message || 'Subscriber could not be saved. Please try again.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      </div>
    );
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'text-xs text-red-500 mt-1';
  const validationMessages = Object.entries(errors).flatMap(([field, messages]) =>
    (Array.isArray(messages) ? messages : [messages]).map((message) => `${field.replaceAll('_', ' ')}: ${message}`)
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={() => navigate('/admin/subscribers')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? 'Edit Subscriber' : 'New Membership Application'}
        </h2>
      </div>

      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">{formError}</p>
          {validationMessages.length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1">
              {validationMessages.slice(0, 6).map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Personal Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
            {errors.name && <p className={errorClass}>{errors.name[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Father/Husband Name</label>
            <input type="text" value={form.father_husband_name} onChange={(e) => setForm({ ...form, father_husband_name: e.target.value })} className={inputClass} />
            {errors.father_husband_name && <p className={errorClass}>{errors.father_husband_name[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>CNIC #</label>
            <input type="text" value={form.cnic} onChange={(e) => setForm({ ...form, cnic: e.target.value })} className={inputClass} />
            {errors.cnic && <p className={errorClass}>{errors.cnic[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Contact # *</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} required />
            {errors.phone && <p className={errorClass}>{errors.phone[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Gender *</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value, services: [] })} className={inputClass} required>
              <option value="male">Male (Boys)</option>
              <option value="female">Female (Girls)</option>
            </select>
            {errors.gender && <p className={errorClass}>{errors.gender[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Session *</label>
            <select value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} className={inputClass} required>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>
            {errors.session && <p className={errorClass}>{errors.session[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Email (Optional)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            {errors.email && <p className={errorClass}>{errors.email[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <DateField value={form.date_of_birth} onChange={(value) => setForm({ ...form, date_of_birth: value })} className={inputClass} />
            {errors.date_of_birth && <p className={errorClass}>{errors.date_of_birth[0]}</p>}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} rows="2" />
            {errors.address && <p className={errorClass}>{errors.address[0]}</p>}
          </div>
        </div>
      </div>

      {/* Branch Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Branch Selection
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.filter((b) => b.is_active).map((branch) => (
            <label
              key={branch.id}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                Number(form.branch_id) === branch.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="branch_id"
                value={branch.id}
                checked={Number(form.branch_id) === branch.id}
                onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                className="accent-orange-600"
              />
              <div>
                <p className="font-medium text-gray-800">{branch.name}</p>
                {branch.address && <p className="text-xs text-gray-500">{branch.address}</p>}
              </div>
            </label>
          ))}
        </div>
        {errors.branch_id && <p className={errorClass}>{errors.branch_id[0]}</p>}
      </div>

      {/* Packages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Packages for {form.gender === 'female' ? 'Girls' : 'Boys'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.filter((s) => s.is_active).map((service) => {
            const isSelected = form.services.some((s) => s.id === service.id);
            return (
              <div
                key={service.id}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleServiceToggle(service.id)}
                    className="accent-orange-600"
                  />
                  <span className="font-medium text-gray-800 text-sm">{service.name}</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fee Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Fee Details & Subscription
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Fee Plan</label>
            <select value={form.fee_plan_id} onChange={(e) => handlePlanChange(e.target.value)} className={inputClass}>
              <option value="">Custom / Manual</option>
              {feePlans.filter((p) => p.is_active).map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.duration_days} days) - Rs. {plan.amount}
                </option>
              ))}
            </select>
            {errors.fee_plan_id && <p className={errorClass}>{errors.fee_plan_id[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Fee Amount (Rs.) *</label>
            <input type="number" step="0.01" value={form.fee_amount} onChange={(e) => setForm({ ...form, fee_amount: e.target.value })} className={inputClass} />
            {errors.fee_amount && <p className={errorClass}>{errors.fee_amount[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Registration Fee (Rs.)</label>
            <input type="number" step="0.01" value={form.registration_fee} onChange={(e) => setForm({ ...form, registration_fee: e.target.value })} className={inputClass} />
            {errors.registration_fee && <p className={errorClass}>{errors.registration_fee[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Security Deposit (Rs.)</label>
            <input type="number" step="0.01" value={form.security_deposit} onChange={(e) => setForm({ ...form, security_deposit: e.target.value })} className={inputClass} />
            {errors.security_deposit && <p className={errorClass}>{errors.security_deposit[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Joining Date *</label>
            <DateField value={form.joining_date} onChange={handleJoiningDateChange} className={inputClass} required />
            {errors.joining_date && <p className={errorClass}>{errors.joining_date[0]}</p>}
            {errors.subscription_end && <p className={errorClass}>{errors.subscription_end[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Biometric ID *</label>
            <input type="text" value={form.biometric_id} onChange={(e) => setForm({ ...form, biometric_id: e.target.value })} className={inputClass} required />
            {errors.biometric_id && <p className={errorClass}>{errors.biometric_id[0]}</p>}
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Emergency Contact Details</h3>
          <button type="button" onClick={addEmergencyContact} className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
        {form.emergency_contacts.map((contact, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className={labelClass}>Name</label>
              <input type="text" value={contact.name} onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)} className={inputClass} />
              {errors[`emergency_contacts.${index}.name`] && <p className={errorClass}>{errors[`emergency_contacts.${index}.name`][0]}</p>}
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="text" value={contact.phone} onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)} className={inputClass} />
              {errors[`emergency_contacts.${index}.phone`] && <p className={errorClass}>{errors[`emergency_contacts.${index}.phone`][0]}</p>}
            </div>
            <div>
              <label className={labelClass}>Relationship</label>
              <input type="text" value={contact.relationship} onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)} className={inputClass} />
              {errors[`emergency_contacts.${index}.relationship`] && <p className={errorClass}>{errors[`emergency_contacts.${index}.relationship`][0]}</p>}
            </div>
            <div className="flex items-end">
              {form.emergency_contacts.length > 1 && (
                <button type="button" onClick={() => removeEmergencyContact(index)} className="p-2 text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Additional Notes
        </h3>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} rows="3" placeholder="Any additional notes..." />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pb-6">
        <button type="button" onClick={() => navigate('/admin/subscribers')} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : isEdit ? 'Update Subscriber' : 'Register Subscriber'}
        </button>
      </div>
    </form>
  );
}
