import { useState, useContext } from 'react';
import api from '../api';
import { Send, Loader2, CheckCircle } from 'lucide-react';
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
            window.grecaptcha.execute(recaptchaSiteKey, { action: 'submit' })
              .then(resolve)
              .catch(reject);
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

  const inputClass = 'w-full px-4 py-3 bg-[oklch(0.13_0.02_30/0.6)] border border-[var(--forge-border)] rounded-lg text-[var(--forge-fg)] placeholder-[var(--forge-muted)] focus:border-[var(--forge-primary)] focus:ring-1 focus:ring-[var(--forge-primary)] outline-none transition-all';
  const labelClass = 'block text-sm font-semibold uppercase tracking-wider text-[var(--forge-fg)] mb-2';
  const errorClass = 'text-xs text-red-400 mt-1';

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${inline ? '' : 'max-w-xl mx-auto'}`}>
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Message sent successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="Your name"
            required
          />
          {errors.name && <p className={errorClass}>{errors.name[0]}</p>}
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            placeholder="your@email.com"
            required
          />
          {errors.email && <p className={errorClass}>{errors.email[0]}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputClass}
          placeholder="+1 234 567 890"
        />
        {errors.phone && <p className={errorClass}>{errors.phone[0]}</p>}
      </div>

      <div>
        <label className={labelClass}>Subject *</label>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className={inputClass}
          placeholder="How can we help?"
          required
        />
        {errors.subject && <p className={errorClass}>{errors.subject[0]}</p>}
      </div>

      <div>
        <label className={labelClass}>Message *</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputClass}
          rows="5"
          placeholder="Tell us more..."
          required
        />
        {errors.message && <p className={errorClass}>{errors.message[0]}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-forge text-[var(--forge-primary-fg)] shadow-ember px-6 py-3.5 rounded-lg font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
      </button>
    </form>
  );
}
