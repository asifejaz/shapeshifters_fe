import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail } from 'lucide-react';
import logo from '../assets/logo.webp';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forge-theme flex items-center justify-center px-4 py-20">
      <div className="mx-auto max-w-md w-full">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-[var(--forge-primary)] opacity-40 blur-2xl animate-pulse-ember" />
            <img src={logo} alt="" className="relative h-20 w-20 mx-auto rounded-full ring-2 ring-[var(--forge-primary)]" style={{ ringColor: 'oklch(0.68 0.22 38 / 0.6)' }} />
          </div>
          <h1 className="mt-6 text-3xl font-black uppercase tracking-wider" style={{ fontFamily: 'Orbitron, system-ui' }}>
            Admin <span className="text-gradient-forge">Login</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--forge-muted)]">
            Restricted access. Authorized administrators only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 rounded-xl border border-[var(--forge-border)] p-8 shadow-ember backdrop-blur" style={{ background: 'oklch(0.17 0.025 30 / 0.8)' }}>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium" style={{ background: 'oklch(0.55 0.24 25 / 0.15)', color: 'oklch(0.75 0.2 25)', border: '1px solid oklch(0.55 0.24 25 / 0.3)' }}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--forge-fg)] mb-2" style={{ fontFamily: 'Orbitron, system-ui' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--forge-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--forge-border)] outline-none text-[var(--forge-fg)] placeholder-[var(--forge-muted)] focus:border-[var(--forge-primary)] transition-colors"
                  style={{ background: 'oklch(0.22 0.02 30 / 0.4)' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--forge-fg)] mb-2" style={{ fontFamily: 'Orbitron, system-ui' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--forge-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--forge-border)] outline-none text-[var(--forge-fg)] placeholder-[var(--forge-muted)] focus:border-[var(--forge-primary)] transition-colors"
                  style={{ background: 'oklch(0.22 0.02 30 / 0.4)' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forge text-[var(--forge-primary-fg)] shadow-ember py-3 rounded-lg font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              style={{ fontFamily: 'Orbitron, system-ui' }}
            >
              <Shield className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Enter Console'}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-[var(--forge-muted)]">
            Interested in joining?{' '}
            <Link to="/page/contact" className="text-[var(--forge-primary)] hover:underline">Contact us</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
