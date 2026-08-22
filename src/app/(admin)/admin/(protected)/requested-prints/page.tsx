'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { RefreshCw, Download, Trash2, Loader2, Calendar, User, ShieldAlert, Wand2, Eye, EyeOff } from 'lucide-react';
import { saveCmsSectionAction } from '@/app/actions/cms';
import { toast } from 'sonner';

// Map color names to hex codes for the 3D Preview
const COLOR_HEX_MAP: Record<string, string> = {
  'Pure White': '#ffffff',
  'Ink Black': '#111111',
  'Crimson Red': '#b31a1a',
  'Light Pink': '#ffc0cb',
  'Light Green': '#90ee90'
};

// Dynamic import for R3F CustomPrintCanvas to prevent SSR crashes
const CustomPrintCanvas = dynamic(
  () => import('@/components/storefront/CustomPrintCanvas'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center text-[var(--text-dim)] font-mono text-[10px] uppercase tracking-widest gap-2 bg-black/25">
        <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Loading 3D Preview...
      </div>
    )
  }
);

export default function AdminRequestedPrints() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<Record<string, any>>({});
  const [updatingSetting, setUpdatingSetting] = useState(false);

  const supabase = createClient();

  const fetchRequestsAndSettings = async () => {
    setLoading(true);
    
    // Fetch requests
    const { data, error } = await (supabase.from('cms_sections') as any)
      .select('*')
      .like('section_key', 'custom_print_request_%')
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to load requested prints.');
    } else {
      const parsed = (data || []).map((row: any) => {
        return {
          dbId: row.id,
          sectionKey: row.section_key,
          ...row.json_content
        };
      });
      setRequests(parsed);
    }

    // Fetch store settings for Print Lab controls
    const { data: settingsData } = await (supabase.from('cms_sections') as any)
      .select('*')
      .eq('section_key', 'store_settings')
      .single();

    if (settingsData?.json_content) {
      setStoreSettings(settingsData.json_content);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRequestsAndSettings();
  }, []);

  const handleToggleSetting = async (key: 'print_lab_enabled' | 'print_lab_show_in_header', newValue: boolean) => {
    setUpdatingSetting(true);
    const updated = { ...storeSettings, [key]: newValue };
    setStoreSettings(updated);

    const res = await saveCmsSectionAction('store_settings', updated);
    if (res.success) {
      toast.success(
        key === 'print_lab_enabled' 
          ? (newValue ? 'Print Lab is now LIVE!' : 'Print Lab is set to UNDER CONSTRUCTION!')
          : (newValue ? 'Print Lab link shown in Header navigation.' : 'Print Lab link hidden from Header navigation.')
      );
    } else {
      toast.error('Failed to update setting: ' + res.error);
      fetchRequestsAndSettings();
    }
    setUpdatingSetting(false);
  };

  const handleDownload = (base64Data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  const handleDelete = async (dbId: string, sectionKey: string) => {
    if (!confirm('Are you sure you want to delete this custom print request?')) return;
    
    setDeletingId(dbId);
    const { error } = await (supabase.from('cms_sections') as any)
      .delete()
      .eq('id', dbId);

    if (error) {
      toast.error('Failed to delete request.');
    } else {
      toast.success('Custom print request deleted.');
      setRequests(prev => prev.filter(r => r.dbId !== dbId));
    }
    setDeletingId(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8 border-b border-[var(--line)] pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter" style={{ color: 'var(--text)' }}>User Requested Prints</h1>
          <p style={{ color: 'var(--text-dim)' }}>View real-time design submissions and manage 3D Print Lab studio availability.</p>
        </div>
        <button onClick={fetchRequestsAndSettings} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold border transition-all text-xs uppercase tracking-wider bg-[var(--bg-card)] border-[var(--line)] text-[var(--text)] hover:opacity-85 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Lists
        </button>
      </div>

      {/* ─── QUICK PRINT LAB STOREFRONT CONTROLS ─── */}
      <div className="mb-8 p-6 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl">
        
        {/* Toggle 1: Print Lab ON/OFF (Under Construction Mode) */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--line)]">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1">
              <Wand2 className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
                Print Lab Status
              </h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {storeSettings.print_lab_enabled === false
                ? '🔴 Feature is OFF (Under Construction Mode)'
                : '🟢 Feature is LIVE & Active'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={storeSettings.print_lab_enabled !== false}
              disabled={updatingSetting}
              onChange={(e) => handleToggleSetting('print_lab_enabled', e.target.checked)}
            />
            <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
          </label>
        </div>

        {/* Toggle 2: Show/Hide Link in Header Navigation */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--line)]">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1">
              {storeSettings.print_lab_show_in_header === false ? (
                <EyeOff className="w-4 h-4 text-amber-400" />
              ) : (
                <Eye className="w-4 h-4 text-[var(--accent)]" />
              )}
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
                Header & Nav Link
              </h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {storeSettings.print_lab_show_in_header === false
                ? '🚫 Hidden from navbar, drawer & dock'
                : '👁️ Visible in navbar, drawer & dock'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={storeSettings.print_lab_show_in_header !== false}
              disabled={updatingSetting}
              onChange={(e) => handleToggleSetting('print_lab_show_in_header', e.target.checked)}
            />
            <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
          </label>
        </div>

      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 text-[var(--text-dim)] font-mono text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" /> Loading Custom Requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 text-center border border-dashed border-[var(--line)] bg-[var(--bg-card)] text-[var(--text-dim)]">
          <ShieldAlert className="w-8 h-8 mb-3 opacity-40 text-[var(--text-dim)]" />
          <p className="font-bold uppercase tracking-wider text-xs">No print requests submitted yet</p>
          <p className="text-[10px] mt-1">Users can submit custom print requests from the storefront print studio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {requests.map((req) => {
            const presetHex = COLOR_HEX_MAP[req.color] || '#ffffff';
            const dateStr = req.created_at ? new Date(req.created_at).toLocaleString() : 'N/A';
            
            return (
              <div key={req.dbId} className="bg-[var(--bg-card)] border border-[var(--line)] flex flex-col justify-between overflow-hidden">
                
                {/* 1. 3D Model Interactive View */}
                <div className="border-b border-[var(--line)] relative aspect-square bg-black/10 flex items-center justify-center overflow-hidden">
                  <CustomPrintCanvas 
                    colorHex={presetHex}
                    textureUrl={req.uploaded_design || null}
                    scaleValue={req.scale || 40}
                    rotateValue={req.rotate || 0}
                    xPosition={req.left || 0}
                    yPosition={req.top || 38}
                    printSide={req.side || 'front'}
                  />
                  <div className="absolute top-4 left-4 bg-black/60 border border-white/10 px-2.5 py-1 text-[8px] font-mono tracking-widest text-white uppercase font-bold">
                    Locked 3D Preview Model
                  </div>
                </div>

                {/* 2. Parameters list */}
                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]">
                          <User className="w-3.5 h-3.5 text-[var(--accent)]" /> {req.user_name || 'Customer Guest'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-dim)] font-mono mt-1">
                          <Calendar className="w-3 h-3" /> {dateStr}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono border border-[var(--line)] px-2 py-0.5 text-[var(--text-dim)] uppercase font-semibold">
                        ID: {req.id ? req.id.toUpperCase() : 'N/A'}
                      </span>
                    </div>

                    <div className="border-t border-[var(--line)] pt-4 space-y-2">
                      <div className="text-[9px] uppercase font-mono tracking-wider text-[var(--text-dim)]">Design Coordinates</div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                        <div className="bg-[var(--bg)] p-2 border border-[var(--line)] text-center">
                          Color<div className="font-bold text-[var(--text)] mt-0.5">{req.color || 'White'}</div>
                        </div>
                        <div className="bg-[var(--bg)] p-2 border border-[var(--line)] text-center">
                          Size<div className="font-bold text-[var(--text)] mt-0.5">{req.size || 'M'}</div>
                        </div>
                        <div className="bg-[var(--bg)] p-2 border border-[var(--line)] text-center">
                          Side<div className="font-bold text-[var(--text)] uppercase mt-0.5">{req.side || 'front'}</div>
                        </div>
                        <div className="bg-[var(--bg)] p-2 border border-[var(--line)] text-center">
                          Scale<div className="font-bold text-[var(--text)] mt-0.5">{req.scale || 40}%</div>
                        </div>
                        <div className="bg-[var(--bg)] p-2 border border-[var(--line)] text-center">
                          X-Pos<div className="font-bold text-[var(--text)] mt-0.5">{req.left || 0}%</div>
                        </div>
                        <div className="bg-[var(--bg)] p-2 border border-[var(--line)] text-center">
                          Y-Pos<div className="font-bold text-[var(--text)] mt-0.5">{req.top || 38}%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions console */}
                  <div className="flex gap-3 pt-4 border-t border-[var(--line)]">
                    <button
                      onClick={() => {
                        const ext = req.uploaded_design?.startsWith('data:image/svg') ? 'svg' : 
                                   req.uploaded_design?.startsWith('data:image/jpeg') ? 'jpg' : 'png';
                        handleDownload(req.uploaded_design, `requested-print-${req.id || req.dbId}.${ext}`);
                      }}
                      disabled={!req.uploaded_design}
                      className="flex-1 bg-[var(--text)] hover:bg-[var(--accent)] text-[var(--bg)] hover:text-black py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Design
                    </button>
                    <button
                      onClick={() => handleDelete(req.dbId, req.sectionKey)}
                      disabled={deletingId === req.dbId}
                      className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent p-2.5 transition-colors"
                      title="Delete Request"
                    >
                      {deletingId === req.dbId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
