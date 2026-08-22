'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');

  const [password, setPassword] = useState('');
  const [error, setError] = useState(authError || '');
  const [loading, setLoading] = useState(false);

  // Clear authError from URL on mount so it doesn't persist forever
  useEffect(() => {
    if (authError) {
      window.history.replaceState({}, '', '/admin/login');
    }
  }, [authError]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = '/admin'; // Force full reload to ensure layout picks up the new cookie
      } else {
        setError(data.message || 'Incorrect password');
      }
    } catch (err) {
      setError('An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
      data-theme="bubble"
    >
      {/* Ambient Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF9EBB 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #B8E1FF 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-black shadow-lg"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            IW
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tighter" style={{ color: 'var(--text)' }}>
            INKWAVE
          </h1>
          <p className="text-sm font-mono tracking-widest uppercase mt-1" style={{ color: 'var(--text-dim)' }}>
            Admin Portal Access
          </p>
        </div>

        <div className="bg-[var(--bg-card)] rounded-[40px] p-8 md:p-10 shadow-2xl border border-[var(--line)]">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-xl font-bold mb-1 text-[var(--text)]">Admin Verification</h2>
            <p className="text-sm text-[var(--text-dim)]">
              Authorized admin: <strong>deysushant23@gmail.com</strong><br/>
              Please enter the master admin password to enter the hub.
            </p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl px-4 py-4 text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors text-center text-lg tracking-widest font-mono"
                autoFocus
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center font-bold">{error}</div>}
            <button 
              type="submit"
              disabled={loading || !password}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-50 hover:opacity-90 cursor-pointer"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              {loading ? 'Verifying...' : 'Access Hub'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
