'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, Clock, Image as ImageIcon, Film } from 'lucide-react';
import { toast } from 'sonner';
import MediaUploader from '@/components/admin/MediaUploader';

export default function AdminUpcomingDropConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [targetDate, setTargetDate] = useState('');
  const [title, setTitle] = useState('THE ARCHIVE');
  const [description, setDescription] = useState('Very limited quantities. No restocks. Prepare for the drop.');
  const [buttonText, setButtonText] = useState('Get Notified');
  const [buttonLink, setButtonLink] = useState('#');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await (supabase.from('cms_sections') as any)
      .select('json_content')
      .eq('section_key', 'upcoming_drop_config')
      .single();

    if (data?.json_content) {
      const j = data.json_content;
      if (j.targetDate) setTargetDate(j.targetDate);
      if (j.title) setTitle(j.title);
      if (j.description) setDescription(j.description);
      if (j.buttonText) setButtonText(j.buttonText);
      if (j.buttonLink) setButtonLink(j.buttonLink);
      if (j.mediaType) setMediaType(j.mediaType);
      if (j.mediaUrl) setMediaUrl(j.mediaUrl);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const payload = {
      targetDate,
      title,
      description,
      buttonText,
      buttonLink,
      mediaType,
      mediaUrl,
    };

    const { data: existing } = await (supabase.from('cms_sections') as any)
      .select('id')
      .eq('section_key', 'upcoming_drop_config')
      .single();

    let error;
    if (existing) {
      const res = await (supabase.from('cms_sections') as any).update({ json_content: payload }).eq('id', existing.id);
      error = res.error;
    } else {
      const res = await (supabase.from('cms_sections') as any).insert([{ section_key: 'upcoming_drop_config', json_content: payload, is_published: true }]);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      toast.error('Failed to save config: ' + error.message);
    } else {
      toast.success('Upcoming Drop config updated!');
    }
  };

  if (loading) {
    return <div className="p-8 text-[var(--text-dim)]">Loading configuration...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[var(--accent)]" /> Upcoming Drop Hype Config
          </h1>
          <p className="text-xs text-[var(--text-dim)] mt-1">
            Configure the countdown timer, messaging, and background media for the next drop section.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--accent)] text-[var(--bg)] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-md shadow-[var(--accent)]/20 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Timer Configuration */}
      <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-4">
        <h2 className="font-display text-lg font-bold text-[var(--text)] uppercase">Countdown Target</h2>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Target Date & Time</label>
          <input 
            type="datetime-local" 
            value={targetDate} 
            onChange={e => setTargetDate(e.target.value)} 
            className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" 
          />
          <p className="text-[10px] text-[var(--text-dim)] mt-2">
            The countdown will calculate time relative to the user's local timezone.
          </p>
        </div>
      </div>

      {/* Media Configuration */}
      <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-4">
        <h2 className="font-display text-lg font-bold text-[var(--text)] uppercase">Background Media</h2>
        
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="mediaType" 
              value="image" 
              checked={mediaType === 'image'} 
              onChange={() => setMediaType('image')} 
              className="accent-[var(--accent)]"
            />
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[var(--text)]">
              <ImageIcon className="w-4 h-4" /> Image
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="mediaType" 
              value="video" 
              checked={mediaType === 'video'} 
              onChange={() => setMediaType('video')} 
              className="accent-[var(--accent)]"
            />
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[var(--text)]">
              <Film className="w-4 h-4" /> Video
            </span>
          </label>
        </div>

        <MediaUploader 
          onUploadSuccess={url => setMediaUrl(url)} 
          label={`Upload ${mediaType === 'image' ? 'Image' : 'Video (MP4)'}`}
        />
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Media URL</label>
          <input 
            type="text" 
            value={mediaUrl} 
            onChange={e => setMediaUrl(e.target.value)} 
            placeholder="https://..."
            className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" 
          />
        </div>
      </div>

      {/* Copy Configuration */}
      <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-2xl space-y-4">
        <h2 className="font-display text-lg font-bold text-[var(--text)] uppercase">Typography & CTA</h2>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" 
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Description</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={2}
            className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Button Text</label>
            <input 
              type="text" 
              value={buttonText} 
              onChange={e => setButtonText(e.target.value)} 
              className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Button Link</label>
            <input 
              type="text" 
              value={buttonLink} 
              onChange={e => setButtonLink(e.target.value)} 
              className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
