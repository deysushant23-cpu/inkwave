'use client';

import { useState } from 'react';
import { subscribeAction } from '@/app/actions/newsletter';
import { Loader2 } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    const result = await subscribeAction(email);
    
    if (result.success) {
      setStatus('success');
      setMessage((result as any).message || 'Please check your inbox to verify your subscription!');
      setEmail('');
    } else {
      setStatus('error');
      setMessage(result.error || 'Failed to subscribe');
    }
  };

  return (
    <div className="newsletter-form mt-8 max-w-sm">
      <h5 className="font-bold text-[var(--text)] uppercase tracking-widest text-[10px] mb-3">Join Our Community</h5>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="email" 
          required
          placeholder="your@email.com" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 bg-transparent border-b border-[var(--line)] text-sm px-2 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
          disabled={status === 'loading'}
        />
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-dim)] hover:text-[var(--text)] disabled:opacity-50 transition-colors"
        >
          {status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p className={`text-[10px] uppercase tracking-wider mt-3 font-mono ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
