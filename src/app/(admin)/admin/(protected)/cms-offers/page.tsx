'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveCmsSectionAction } from '@/app/actions/cms';
import { OfferProps } from '@/components/storefront/OffersSectionClient';
import MediaUploader from '@/components/admin/MediaUploader';

export default function AdminOffers() {
  const [offers, setOffers] = useState<OfferProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    const { data } = await (supabase.from('cms_sections') as any)
      .select('json_content, id')
      .eq('section_key', 'offers_config')
      .single();

    if (data?.json_content?.offers) {
      setOffers(data.json_content.offers);
    } else {
      setOffers([]);
    }
    setLoading(false);
  };

  const handleUpdate = (index: number, field: keyof OfferProps, value: string) => {
    const newOffers = [...offers];
    newOffers[index] = { ...newOffers[index], [field]: value };
    setOffers(newOffers);
  };

  const handleAdd = () => {
    setOffers([...offers, { title: '', subtitle: '', discount: '', bgImage: '', link: '', accent: 'var(--accent)' }]);
  };

  const handleRemove = (index: number) => {
    setOffers(offers.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    
    const res = await saveCmsSectionAction('offers_config', { offers });

    if (res.success) {
      toast.success('Offers section updated successfully');
    } else {
      toast.error('Failed to update: ' + res.error);
    }
    setSaving(false);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--text)]">Offers Section</h1>
          <p className="text-[var(--text-dim)]">Manage the homepage offers cards.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-2 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-all"
        >
          <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <div className="text-[var(--text-dim)]">Loading...</div>
      ) : (
        <div className="space-y-6">
          {offers.map((offer, index) => (
            <div key={index} className="bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl p-6 relative">
              <button 
                onClick={() => handleRemove(index)}
                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Title</label>
                  <input type="text" value={offer.title} onChange={e => handleUpdate(index, 'title', e.target.value)} className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Subtitle</label>
                  <input type="text" value={offer.subtitle} onChange={e => handleUpdate(index, 'subtitle', e.target.value)} className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Discount Badge</label>
                  <input type="text" value={offer.discount} onChange={e => handleUpdate(index, 'discount', e.target.value)} className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Link</label>
                  <input type="text" value={offer.link} onChange={e => handleUpdate(index, 'link', e.target.value)} className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">End Time (Optional)</label>
                  <input type="datetime-local" value={offer.endTime || ''} onChange={e => handleUpdate(index, 'endTime', e.target.value)} className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 outline-none" style={{ colorScheme: 'dark' }} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Background Image</label>
                  <div className="flex gap-4 items-center">
                    {offer.bgImage && (
                      <img src={offer.bgImage} className="w-16 h-16 object-cover rounded-lg border border-[var(--line)]" alt="" />
                    )}
                    <div className="flex-1">
                      <MediaUploader onUploadSuccess={(url) => handleUpdate(index, 'bgImage', url)} label={offer.bgImage ? "Change Image" : "Upload Image"} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={handleAdd}
            className="w-full border-2 border-dashed border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text)] rounded-2xl p-4 font-bold transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Offer Card
          </button>
        </div>
      )}
    </div>
  );
}
