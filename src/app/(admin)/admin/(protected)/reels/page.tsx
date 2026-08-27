'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Save, Video, Link as LinkIcon, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaUploader from '@/components/admin/MediaUploader';
import { toast } from 'sonner';
import { saveCmsSectionAction } from '@/app/actions/cms';

interface Reel {
  id: string;
  videoUrl: string;
  productSlug: string;
  title: string;
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('cms_sections') as any)
      .select('*')
      .eq('section_key', 'reels_config')
      .single();

    if (data && data.json_content) {
      setReels(data.json_content as Reel[]);
    }
    setLoading(false);
  };

  const saveReels = async () => {
    setSaving(true);
    const res = await saveCmsSectionAction('reels_config', reels);
    setSaving(false);
    if (res.success) {
      toast.success('Reels updated successfully!');
    } else {
      toast.error('Failed to update Reels: ' + res.error);
    }
  };

  const addReel = () => {
    setReels([...reels, { id: crypto.randomUUID(), videoUrl: '', productSlug: '', title: '' }]);
  };

  const removeReel = (id: string) => {
    setReels(reels.filter((r) => r.id !== id));
  };

  const updateReel = (id: string, field: keyof Reel, value: string) => {
    setReels(reels.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  if (loading) {
    return <div className="p-8 text-[var(--text-dim)]">Loading configuration...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tighter" style={{ color: 'var(--text)' }}>
            Manage Reels
          </h1>
          <p className="text-[var(--text-dim)] mt-2">
            Configure the shoppable short-form videos displayed on the storefront homepage.
          </p>
        </div>
        <Button onClick={saveReels} disabled={saving} className="gap-2 px-6">
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-6">
        {reels.length === 0 && (
          <div className="text-center py-16 border border-dashed border-[var(--line)] rounded-2xl">
            <Video size={48} className="mx-auto text-[var(--text-dim)] mb-4 opacity-50" />
            <p className="text-[var(--text)] font-semibold mb-2">No reels configured yet</p>
            <p className="text-[var(--text-dim)] text-sm mb-6">Add your first shoppable video reel.</p>
            <Button onClick={addReel} variant="outline" className="gap-2">
              <Plus size={16} /> Add Reel
            </Button>
          </div>
        )}

        {reels.map((reel, index) => (
          <div key={reel.id} className="bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl p-6 relative group">
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => removeReel(reel.id)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <h3 className="font-semibold text-lg text-[var(--text)]">Reel Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-dim)]">
                  <Video size={16} /> Video
                </label>
                <div className="flex gap-4 items-center">
                  {reel.videoUrl && (
                    <video src={reel.videoUrl} className="w-24 h-16 object-cover rounded-lg border border-[var(--line)]" muted />
                  )}
                  <div className="flex-1">
                    <MediaUploader onUploadSuccess={(url) => updateReel(reel.id, 'videoUrl', url)} label={reel.videoUrl ? "Change Video" : "Upload Video (MP4)"} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-dim)]">
                  <Type size={16} /> Display Title
                </label>
                <input
                  type="text"
                  value={reel.title}
                  onChange={(e) => updateReel(reel.id, 'title', e.target.value)}
                  placeholder="e.g., The Heavyweight Process"
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-[var(--text)] focus:border-[var(--accent)] outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-dim)]">
                  <LinkIcon size={16} /> Linked Product Slug
                </label>
                <input
                  type="text"
                  value={reel.productSlug}
                  onChange={(e) => updateReel(reel.id, 'productSlug', e.target.value)}
                  placeholder="e.g., heavyweight-hoodie-black"
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-[var(--text)] focus:border-[var(--accent)] outline-none transition-colors"
                />
                <p className="text-xs text-[var(--text-dim)] mt-1">Users will be routed to /product/[slug] when clicking "Shop".</p>
              </div>
            </div>
          </div>
        ))}

        {reels.length > 0 && (
          <Button onClick={addReel} variant="outline" className="w-full py-8 border-dashed border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text-dim)] gap-2">
            <Plus size={18} /> Add Another Reel
          </Button>
        )}
      </div>
    </div>
  );
}
