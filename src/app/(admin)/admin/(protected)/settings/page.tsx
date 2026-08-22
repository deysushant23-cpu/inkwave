'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { saveCmsSectionAction } from '@/app/actions/cms';
import { toast } from 'sonner';

type SettingKey = 'store_name' | 'store_email' | 'store_phone' | 'store_address' | 'store_tagline' | 'shipping_policy' | 'return_policy';

const SETTINGS: { key: SettingKey; label: string; type: 'text' | 'email' | 'tel' | 'textarea'; placeholder: string }[] = [
  { key: 'store_name', label: 'Store Name', type: 'text', placeholder: 'INKWAVE' },
  { key: 'store_email', label: 'Contact Email', type: 'email', placeholder: 'deysushant23@gmail.com' },
  { key: 'store_phone', label: 'Contact Phone', type: 'tel', placeholder: '+91 98765 43210' },
  { key: 'store_address', label: 'Studio & Dispatch Address', type: 'text', placeholder: 'B/12 Sharmjivi Soc, Umra, Surat 395007, Gujarat, India' },
  { key: 'store_tagline', label: 'Store Tagline', type: 'text', placeholder: 'Small-batch, ink-dyed menswear.' },
  { key: 'shipping_policy', label: 'Shipping Policy', type: 'textarea', placeholder: 'Free express shipping across India on orders over ₹2000...' },
  { key: 'return_policy', label: 'Return Policy', type: 'textarea', placeholder: '7-day doorstep exchange and return policy...' },
];

export default function AdminSettings() {
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await (supabase.from('cms_sections') as any)
      .select('*')
      .eq('section_key', 'store_settings')
      .single();

    if (data) {
      setValues((data as any).json_content || {});
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    
    const result = await saveCmsSectionAction('store_settings', values);

    if (result.success) {
      setSaved(true);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSaved(false), 3000);
    } else {
      toast.error("Failed to save settings: " + result.error);
    }
    
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>Store Settings</h1>
          <p style={{ color: 'var(--text-dim)' }}>General configuration for your Inkwave store.</p>
        </div>
        <button onClick={fetchSettings} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border transition-all hover:opacity-80"
          style={{ borderColor: 'var(--line)', color: 'var(--text-dim)' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: 'var(--text-dim)' }}>Loading settings...</div>
      ) : (
        <div className="space-y-6">
          {/* Admin Password Info */}
          <div className="rounded-3xl p-6 border mb-2" style={{ background: 'rgba(255,158,187,0.08)', borderColor: 'var(--accent)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>🔐 Admin Password</p>
            <p className="text-xs text-[var(--text-dim)]">
              The admin panel password is set securely via environment variables. To change it, update the <code className="bg-[var(--bg-alt)] px-1 rounded font-mono">ADMIN_PASSWORD</code> variable in your server environment settings (or <code className="bg-[var(--bg-alt)] px-1 rounded font-mono">.env.local</code> for local development).
            </p>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="rounded-3xl border p-8 flex items-center justify-between" style={{ background: values.maintenance_mode ? 'rgba(255, 0, 0, 0.05)' : 'var(--bg-card)', borderColor: values.maintenance_mode ? 'rgba(255, 0, 0, 0.3)' : 'var(--line)' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={`w-5 h-5 ${values.maintenance_mode ? 'text-red-500' : 'text-[var(--text-dim)]'}`} />
                <h3 className={`font-bold text-lg ${values.maintenance_mode ? 'text-red-500' : 'text-[var(--text)]'}`}>Storewide Maintenance Mode</h3>
              </div>
              <p className="text-sm text-[var(--text-dim)] max-w-md">
                When enabled, the public storefront will be hidden behind a "We'll be right back" screen. As an admin, you will still be able to browse the site normally.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={values.maintenance_mode === true}
                onChange={(e) => setValues(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
              />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>

          {/* ─── 3D PRINT LAB CONTROLS (Live / Under Construction & Header Visibility) ─── */}
          <div className="rounded-3xl border p-8 space-y-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--line)' }}>
            <div className="border-b pb-4" style={{ borderColor: 'var(--line)' }}>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>🖨️ 3D Print Lab Feature Controls</h3>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Manage public availability and navigation presence of the 3D Custom Print Studio.</p>
            </div>

            {/* 1. Toggle Print Lab Feature ON/OFF (Under Construction Mode) */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base" style={{ color: 'var(--text)' }}>
                  Print Lab Active Status
                </h4>
                <p className="text-xs max-w-md mt-0.5" style={{ color: 'var(--text-dim)' }}>
                  {values.print_lab_enabled === false
                    ? '🔴 Print Lab is currently OFF (Under Construction page shown to customers).'
                    : '🟢 Print Lab is LIVE and active for shoppers.'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={values.print_lab_enabled !== false}
                  onChange={(e) => setValues(prev => ({ ...prev, print_lab_enabled: e.target.checked }))}
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>

            {/* 2. Toggle Header & Navigation Visibility */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
              <div>
                <h4 className="font-bold text-base" style={{ color: 'var(--text)' }}>
                  Show "Print Lab" in Header & Navigation
                </h4>
                <p className="text-xs max-w-md mt-0.5" style={{ color: 'var(--text-dim)' }}>
                  {values.print_lab_show_in_header === false
                    ? '🚫 "Print Lab" link is HIDDEN from header navbar, mobile drawer, and bottom dock.'
                    : '👁️ "Print Lab" link is VISIBLE in header navbar, mobile drawer, and bottom dock.'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={values.print_lab_show_in_header !== false}
                  onChange={(e) => setValues(prev => ({ ...prev, print_lab_show_in_header: e.target.checked }))}
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>
          </div>

          {/* Settings Form */}
          <div className="rounded-3xl border p-8 space-y-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--line)' }}>
            {SETTINGS.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
                  {label}
                </label>
                {type === 'textarea' ? (
                  <textarea
                    value={values[key] || ''}
                    onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    rows={3}
                    className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none"
                    style={{ background: 'var(--bg-alt)', color: 'var(--text)', border: '1.5px solid var(--line)' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--line)'; }}
                  />
                ) : (
                  <input
                    type={type}
                    value={values[key] || ''}
                    onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
                    style={{ background: 'var(--bg-alt)', color: 'var(--text)', border: '1.5px solid var(--line)' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--line)'; }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-base transition-all ${saved ? 'bg-green-500' : ''}`}
            style={saved ? { background: '#22c55e', color: '#fff' } : { background: 'var(--accent)', color: 'var(--bg)' }}
          >
            {saving ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check className="w-5 h-5" /> Settings Saved!</>
            ) : (
              <><Save className="w-5 h-5" /> Save Settings</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
