'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Send, Users, Loader2 } from 'lucide-react';
import { sendBroadcastAction } from '@/app/actions/newsletter';
import { toast } from 'sonner';

export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setSubscribers(data);
    }
    setLoading(false);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) {
      toast.error('Subject and content are required.');
      return;
    }
    if (!confirm('Are you sure you want to send this email to all active subscribers?')) return;

    setIsSending(true);
    const result = await sendBroadcastAction(subject, content);
    
    if (result.success) {
      toast.success(`Successfully sent to ${result.sentCount} subscribers!`);
      setSubject('');
      setContent('');
    } else {
      toast.error(`Failed to send: ${result.error}`);
    }
    setIsSending(false);
  };

  const activeCount = subscribers.filter(s => s.status === 'active').length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <h1 className="font-display text-4xl font-black text-[var(--text)] uppercase tracking-tighter">Community Newsletter</h1>
          <p className="text-[var(--text-dim)] mt-1">Manage subscribers and broadcast email updates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Broadcast Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-3xl shadow-sm">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-[var(--accent)]" /> Compose Broadcast</h2>
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Email Subject</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  required 
                  placeholder="e.g. Early Access: SS26 Denim Drop"
                  className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">HTML Content</label>
                <textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  required 
                  rows={12}
                  placeholder="<h1>New Drop Available</h1><p>Shop the look now...</p>"
                  className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors font-mono text-sm"
                />
                <p className="text-[10px] text-[var(--text-dim)] mt-2">You can use standard HTML tags for formatting. Keep it simple for better email client support.</p>
              </div>
              <button 
                type="submit" 
                disabled={isSending || activeCount === 0}
                className="w-full bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending Broadcast...</> : <><Send className="w-5 h-5" /> Send to {activeCount} Subscribers</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Subscribers List */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-3xl shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl flex items-center gap-2"><Users className="w-5 h-5 text-[var(--text-dim)]" /> Audience</h2>
              <span className="bg-[var(--text)] text-[var(--bg)] px-3 py-1 rounded-full text-xs font-bold">{subscribers.length} Total</span>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 -mr-2 space-y-3">
              {loading ? (
                <div className="text-center py-8 text-[var(--text-dim)]"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-dim)] text-sm border border-dashed border-[var(--line)] rounded-xl">No subscribers yet.</div>
              ) : (
                subscribers.map((sub: any) => (
                  <div key={sub.id} className="p-3 bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm text-[var(--text)]">{sub.email}</div>
                      <div className="text-[10px] text-[var(--text-dim)] font-mono mt-1">Joined: {new Date(sub.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${sub.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={sub.status}></span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
