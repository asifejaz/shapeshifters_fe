import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail, Shield } from 'lucide-react';
import logo from '../assets/logo.webp';
import heroImage from '../assets/new-design/hero-athlete.jpg';

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
    <div className="ss-theme min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-ink text-paper lg:block">
          <img src={heroImage} alt="Shape Shifters training" className="absolute inset-0 h-full w-full object-cover opacity-65 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <Link to="/" className="inline-flex w-fit items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-paper/70 transition hover:text-ember">
              <span className="h-px w-10 bg-paper/40" /> Back to website
            </Link>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ember">Admin Console</span>
              <h1 className="mt-5 max-w-xl font-display text-7xl leading-[0.84] uppercase md:text-8xl">
                Built For<br />The Operators.
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/65">
                Restricted dashboard access for Shape Shifters staff. Manage members, payments, CMS, reports, and daily operations from one secure console.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 md:px-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ember/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-ink/10 blur-3xl" />

          <div className="relative w-full max-w-md">
            <div className="mb-10 flex items-center justify-between gap-4 border-b border-ink/10 pb-6">
              <Link to="/" aria-label="Shape Shifters home">
                <img src={logo} alt="Shape Shifters" className="h-14 w-auto object-contain" />
              </Link>
              <div className="grid h-11 w-11 place-items-center bg-ink text-paper">
                <Shield className="h-5 w-5" />
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ember">Secure Access</span>
              <h2 className="mt-3 font-display text-6xl leading-[0.85] uppercase md:text-7xl">Admin Login</h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted">
                Sign in with your authorized staff account to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 border border-ink/10 bg-paper-dim p-6 shadow-ember md:p-8">
              {error && (
                <div className="mb-6 border border-ember/40 bg-ember/10 p-4 text-sm font-semibold text-ink">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-ink/60">Email</label>
                  <div className="mt-3 flex items-center border-b border-ink/20 bg-transparent transition-colors focus-within:border-ember">
                    <Mail className="mr-3 h-4 w-4 text-ink/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="username"
                      className="w-full bg-transparent py-3 text-sm text-ink outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-ink/60">Password</label>
                  <div className="mt-3 flex items-center border-b border-ink/20 bg-transparent transition-colors focus-within:border-ember">
                    <Lock className="mr-3 h-4 w-4 text-ink/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full bg-transparent py-3 text-sm text-ink outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex w-full items-center justify-between bg-ink px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-paper transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{loading ? 'Authenticating' : 'Enter Console'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-ink/10 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                <span>Authorized Staff</span>
                <Link to="/contact" className="transition hover:text-ember">Contact</Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
