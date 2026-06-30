import { useState } from 'react';
import { X, User, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ open, onClose, initialMode = 'login' }) {
  const { signIn, signUp, isSupabaseConfigured } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      }

      if (mode === 'login') {
        await signIn(email, password);
        onClose();
      } else {
        await signUp(email, password, fullName);
        setMessage('Check your email to verify your account before accessing the portal.');
      }
    } catch (err) {
      setError(err.message ?? 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer auth-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="drawer__header">
          <h3 className="drawer__title">
            <User size={18} className="drawer__title-icon" />
            {mode === 'login' ? 'Client Login' : 'Create Account'}
          </h3>
          <button className="icon-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form className="auth-modal__body" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="auth-modal__field">
              <span>Full Name</span>
              <div className="auth-modal__input-wrap">
                <User size={16} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            </label>
          )}

          <label className="auth-modal__field">
            <span>Email</span>
            <div className="auth-modal__input-wrap">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          <label className="auth-modal__field">
            <span>Password</span>
            <div className="auth-modal__input-wrap">
              <Lock size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>
          </label>

          {error && <div className="auth-modal__error">{error}</div>}
          {message && <div className="auth-modal__success">{message}</div>}

          <button className="btn btn--primary btn--lg" style={{ width: '100%' }} disabled={submitting} type="submit">
            {submitting ? <Loader2 size={16} className="spin" /> : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <button
            type="button"
            className="auth-modal__switch"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage(''); }}
          >
            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
