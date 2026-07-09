import { useState } from 'react';
import api from '../api';
import { Loader2, CheckCircle } from 'lucide-react';
import { useSiteData } from '../pages/public/PublicLayout';

export default function ContactForm({ inline = false, onSuccess }) {
  const siteData = useSiteData();
  const settings = siteData?.settings || {};
  const recaptchaSiteKey = settings.recaptcha_site_key;

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      let recaptchaToken = null;
      if (recaptchaSiteKey && window.grecaptcha) {
        recaptchaToken = await new Promise((resolve, reject) => {
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute(recaptchaSiteKey, { action: 'submit' }).then(resolve).catch(reject);
          });
        });
      }

      await api.post('/contact', { ...form, recaptcha_token: recaptchaToken });
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
      else alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'mt-2 w-full border-0 border-b border-ink/20 bg-transparent py-2 text-sm text-ink outline-none transition-colors focus:border-ember';
  const labelClass = 'block font-mono text-[10px] uppercase tracking-[0.3em] text-ink/60';
  const errorClass = 'mt-2 text-xs font-semibold text-red-700';

  return (
    <form onSubmit={handleSubmit} className={`ss-contact-form ${inline ? '' : 'mx-auto max-w-xl bg-paper-dim p-8 md:p-10'}`}>
      {success && (
        <div className="mb-6 flex items-center gap-3 border border-emerald-700/25 bg-emerald-700/10 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle className="h-5 w-5" />
          <span>Message sent successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Name *" value={form.name} onChange={(value) => setForm({ ...form, name: value })} error={errors.name?.[0]} inputClass={inputClass} labelClass={labelClass} errorClass={errorClass} required />
        <Field label="Email *" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} error={errors.email?.[0]} inputClass={inputClass} labelClass={labelClass} errorClass={errorClass} required />
        <Field label="Phone" type="tel" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} error={errors.phone?.[0]} inputClass={inputClass} labelClass={labelClass} errorClass={errorClass} />
        <Field label="Subject *" value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} error={errors.subject?.[0]} inputClass={inputClass} labelClass={labelClass} errorClass={errorClass} required />
        <div className="md:col-span-2">
          <label className={labelClass}>Message *</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={`${inputClass} resize-y`}
            rows="5"
            required
          />
          {errors.message && <p className={errorClass}>{errors.message[0]}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-10 inline-flex items-center gap-3 bg-ink px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-paper transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending</> : <>Send message →</>}
      </button>
    </form>
  );
}

function Field({ label, type = 'text', value, onChange, error, inputClass, labelClass, errorClass, required = false }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        required={required}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
