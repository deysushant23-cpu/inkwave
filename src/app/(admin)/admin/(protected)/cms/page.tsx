'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Category, CmsSection } from '@/types/database';
import { Image as ImageIcon, Video, Check, Save } from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';

type BannerConfig = {
  url: string;
  type: 'image' | 'video';
};

export default function AdminBanners() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Record<string, BannerConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState<Record<string, boolean>>({});

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all categories
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    
    // Fetch all banner configs
    const { data: cmsData } = await (supabase.from('cms_sections') as any)
      .select('*')
      .like('section_key', 'category_banner_%');

    if (catData) setCategories(catData);
    
    if (cmsData) {
      const bannerMap: Record<string, BannerConfig> = {};
      (cmsData as any[]).forEach(section => {
        // extract slug from 'category_banner_<slug>'
        const slug = section.section_key.replace('category_banner_', '');
        bannerMap[slug] = section.json_content as BannerConfig;
      });
      setBanners(bannerMap);
    }
    
    setLoading(false);
  };

  const handleUpdateBanner = (slug: string, field: keyof BannerConfig, value: string) => {
    setBanners(prev => ({
      ...prev,
      [slug]: {
        ...prev[slug] || { type: 'image', url: '' },
        [field]: value
      }
    }));
    // Reset success state if they start editing again
    setSuccess(prev => ({ ...prev, [slug]: false }));
  };

  const handleSave = async (slug: string) => {
    setSaving(prev => ({ ...prev, [slug]: true }));
    const sectionKey = `category_banner_${slug}`;
    const bannerData = banners[slug] || { type: 'image', url: '' };

    // Check if exists
    const { data: existing } = await (supabase.from('cms_sections') as any)
      .select('id')
      .eq('section_key', sectionKey)
      .single();

    let error;

    if (existing) {
      // Update
      // @ts-ignore - Supabase inference bug
      const res = await (supabase.from('cms_sections') as any).update({
        json_content: bannerData,
        updated_at: new Date().toISOString()
      }).eq('id', (existing as any).id);
      error = res.error;
    } else {
      // Insert
      const res = await (supabase.from('cms_sections') as any).insert(
        // @ts-ignore
        [{
          section_key: sectionKey,
          json_content: bannerData,
          is_published: true
        }]
      );
      error = res.error;
    }

    setSaving(prev => ({ ...prev, [slug]: false }));

    if (!error) {
      setSuccess(prev => ({ ...prev, [slug]: true }));
      setTimeout(() => setSuccess(prev => ({ ...prev, [slug]: false })), 3000);
    } else {
      alert("Failed to save banner: " + error.message);
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[var(--text)]">Hero Banners</h1>
        <p className="text-[var(--text-dim)]">Configure the hero media for each category page. Recommended aspect ratio is 16:9.</p>
      </div>

      {loading ? (
        <div className="text-[var(--text-dim)]">Loading configuration...</div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => {
            const config = banners[category.slug] || { type: 'image', url: '' };
            const isSaving = saving[category.slug];
            const isSuccess = success[category.slug];

            return (
              <div key={category.id} className="bg-[var(--bg-card)] border border-[var(--line)] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                
                {/* Preview Thumbnail */}
                <div className="w-full md:w-64 h-36 bg-[var(--bg-alt)] rounded-2xl overflow-hidden relative border border-[var(--line)] flex items-center justify-center shrink-0 group">
                  {config.url ? (
                    config.type === 'video' ? (
                      <video src={config.url} className="w-full h-full object-cover" muted loop playsInline />
                    ) : (
                      <img src={config.url} className="w-full h-full object-cover" alt="Preview" />
                    )
                  ) : (
                    <div className="text-[var(--text-dim)] flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-semibold uppercase tracking-widest">No Media</span>
                    </div>
                  )}
                  {config.type === 'video' && config.url && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg text-white">
                      <Video className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Form Controls */}
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-[var(--text)]">{category.name}</h3>
                    <p className="text-sm text-[var(--text-dim)] font-mono">/category/{category.slug}</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4 items-center">
                      <label className="text-sm font-bold uppercase tracking-widest text-[var(--text-dim)] w-16">Type</label>
                      <div className="flex bg-[var(--bg-alt)] rounded-xl overflow-hidden p-1">
                        <button 
                          onClick={() => handleUpdateBanner(category.slug, 'type', 'image')}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${config.type === 'image' ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                        >
                          Image
                        </button>
                        <button 
                          onClick={() => handleUpdateBanner(category.slug, 'type', 'video')}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${config.type === 'video' ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                        >
                          Video
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4 items-center">
                        <label className="text-sm font-bold uppercase tracking-widest text-[var(--text-dim)] w-16">URL</label>
                        <input 
                          type="url" 
                          value={config.url}
                          onChange={(e) => handleUpdateBanner(category.slug, 'url', e.target.value)}
                          placeholder={`https://example.com/media.${config.type === 'video' ? 'mp4' : 'jpg'}`}
                          className="flex-1 bg-[var(--bg-alt)] border-none rounded-xl px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono text-sm"
                        />
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="w-16 shrink-0"></div>
                        <div className="flex-1">
                           <MediaUploader 
                             onUploadSuccess={(url) => handleUpdateBanner(category.slug, 'url', url)} 
                             label={`Upload ${config.type === 'video' ? 'Video' : 'Image'}`} 
                           />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-end">
                  <button 
                    onClick={() => handleSave(category.slug)}
                    disabled={isSaving}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                      isSuccess 
                        ? 'bg-green-500 text-white' 
                        : 'bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 shadow-lg shadow-[var(--accent)]/20'
                    } disabled:opacity-50`}
                  >
                    {isSaving ? (
                      'Saving...'
                    ) : isSuccess ? (
                      <><Check className="w-5 h-5" /> Saved</>
                    ) : (
                      <><Save className="w-5 h-5" /> Save Changes</>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
