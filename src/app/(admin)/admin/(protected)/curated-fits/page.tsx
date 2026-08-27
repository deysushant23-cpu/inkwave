'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, Plus, Trash2, Link as LinkIcon, Image as ImageIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { saveCmsSectionAction } from '@/app/actions/cms';

interface FitItem {
  name: string;
  price: number;
  slug: string;
  type: string;
}

interface CuratedFit {
  id: string;
  title: string;
  image: string;
  images?: string[];
  items: FitItem[];
}

export default function AdminCuratedFitsConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fits, setFits] = useState<CuratedFit[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [showFits, setShowFits] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch fits config
    const { data: fitRes } = await (supabase.from('cms_sections') as any)
      .select('json_content')
      .eq('section_key', 'curated_fits_config')
      .single();

    // Fetch actual products for selector
    const { data: prodRes } = await supabase
      .from('products')
      .select('title, slug, base_price')
      .order('title');

    if (prodRes) {
      setDbProducts(prodRes);
    }

    if (fitRes?.json_content) {
      if (fitRes.json_content.fits) {
        const sanitized = fitRes.json_content.fits.map((f: any) => ({
          ...f,
          images: f.images || (f.image ? [f.image] : [])
        }));
        setFits(sanitized);
      }
      if (typeof fitRes.json_content.show === 'boolean') {
        setShowFits(fitRes.json_content.show);
      }
    } else {
      // Default fallback
      setFits([
        {
          id: 'fit-01',
          title: 'NIGHT CRAWLER',
          image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop'],
          items: [
            { name: 'Oversized Cargo Jacket', price: 8900, slug: 'oversized-cargo-jacket', type: 'OUTERWEAR' },
            { name: 'Heavyweight Basic Tee', price: 2400, slug: 'heavyweight-basic-tee', type: 'TOP' },
            { name: 'Tactical Trousers', price: 6500, slug: 'tactical-trousers', type: 'BOTTOM' }
          ]
        }
      ]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Ensure f.image has a fallback value matching first image in f.images
    const sanitizedFits = fits.map(f => ({
      ...f,
      image: f.images?.[0] || f.image || ''
    }));

    const payload = { fits: sanitizedFits, show: showFits };

    const res = await saveCmsSectionAction('curated_fits_config', payload);

    setSaving(false);
    if (!res.success) {
      toast.error('Failed to save Curated Fits: ' + res.error);
    } else {
      toast.success('Curated Fits updated! Changes are live.');
    }
  };

  const addFit = () => {
    setFits([...fits, { id: `fit-${Date.now()}`, title: 'NEW LOOK', image: '', images: [''], items: [] }]);
  };

  const updateFit = (index: number, field: keyof CuratedFit, value: string) => {
    const newFits = [...fits];
    newFits[index] = { ...newFits[index], [field]: value };
    setFits(newFits);
  };

  const addImageToFit = (fitIndex: number) => {
    const newFits = [...fits];
    const imgs = newFits[fitIndex].images || [];
    newFits[fitIndex].images = [...imgs, ''];
    setFits(newFits);
  };

  const updateFitImage = (fitIndex: number, imgIndex: number, value: string) => {
    const newFits = [...fits];
    const imgs = [...(newFits[fitIndex].images || [])];
    imgs[imgIndex] = value;
    newFits[fitIndex].images = imgs;
    // Keep legacy single-image property in sync with first image
    if (imgIndex === 0) {
      newFits[fitIndex].image = value;
    }
    setFits(newFits);
  };

  const removeFitImage = (fitIndex: number, imgIndex: number) => {
    const newFits = [...fits];
    const imgs = (newFits[fitIndex].images || []).filter((_, i) => i !== imgIndex);
    newFits[fitIndex].images = imgs;
    newFits[fitIndex].image = imgs[0] || '';
    setFits(newFits);
  };

  const removeFit = (index: number) => {
    setFits(fits.filter((_, i) => i !== index));
  };

  const addItemToFit = (fitIndex: number) => {
    const newFits = [...fits];
    newFits[fitIndex].items.push({ name: 'New Item', price: 0, slug: 'new-item', type: 'TOP' });
    setFits(newFits);
  };

  const updateItem = (fitIndex: number, itemIndex: number, field: keyof FitItem, value: any) => {
    const newFits = [...fits];
    const val = field === 'price' ? Number(value) : value;
    newFits[fitIndex].items[itemIndex] = { ...newFits[fitIndex].items[itemIndex], [field]: val };
    setFits(newFits);
  };

  const selectPresetProduct = (fitIndex: number, itemIndex: number, productSlug: string) => {
    const found = dbProducts.find(p => p.slug === productSlug);
    if (!found) return;

    const newFits = [...fits];
    newFits[fitIndex].items[itemIndex] = {
      ...newFits[fitIndex].items[itemIndex],
      name: found.title,
      slug: found.slug,
      price: found.base_price || 0
    };
    setFits(newFits);
    toast.success(`Assigned "${found.title}"`);
  };

  const removeItem = (fitIndex: number, itemIndex: number) => {
    const newFits = [...fits];
    newFits[fitIndex].items = newFits[fitIndex].items.filter((_, i) => i !== itemIndex);
    setFits(newFits);
  };

  if (loading) {
    return <div className="p-8 text-[var(--text-dim)]">Loading configuration...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--text)]">Curated Fits (Shop The Look)</h1>
          <p className="text-[var(--text-dim)] mt-1">Manage the styled looks and attach real catalog products to them.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--accent)] text-[var(--bg)] px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[var(--accent)]/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-12">
        {fits.map((fit, fitIndex) => (
          <div key={fit.id} className="bg-[var(--bg-card)] border border-[var(--line)] rounded-[24px] overflow-hidden">
            {/* Header / Meta */}
            <div className="p-6 border-b border-[var(--line)] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-black/20">
              <div className="flex items-center gap-4 flex-1 w-full">
                <div className="w-20 h-20 rounded-xl bg-[var(--bg-alt)] border border-[var(--line)] flex-shrink-0 overflow-hidden">
                  {(fit.images?.[0] || fit.image) ? (
                    <img src={fit.images?.[0] || fit.image} alt={fit.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-dim)]">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input 
                    type="text" 
                    value={fit.title}
                    onChange={(e) => updateFit(fitIndex, 'title', e.target.value)}
                    placeholder="Fit Title (e.g. NIGHT CRAWLER)"
                    className="w-full bg-transparent font-display text-2xl font-bold text-[var(--text)] outline-none border-b border-transparent focus:border-[var(--accent)]"
                  />
                  <div className="space-y-1">
                    <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest">Styled Images List</label>
                    <div className="space-y-2">
                      {(fit.images || []).map((imgUrl, imgIndex) => (
                        <div key={imgIndex} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={imgUrl}
                            onChange={(e) => updateFitImage(fitIndex, imgIndex, e.target.value)}
                            placeholder={`Image URL #${imgIndex + 1} (https://...)`}
                            className="flex-1 bg-[var(--bg)] border border-[var(--line)] rounded text-xs p-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                          />
                          <button 
                            onClick={() => removeFitImage(fitIndex, imgIndex)}
                            className="text-red-400 hover:text-red-300 text-xs px-2 py-1.5 border border-red-500/10 hover:border-red-500/30 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => addImageToFit(fitIndex)}
                        className="text-xs bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] px-3 py-1.5 rounded hover:bg-[var(--line)] transition-colors"
                      >
                        + Add Image to Slideshow
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => removeFit(fitIndex)} className="text-red-400 hover:text-red-300 font-bold text-sm px-4 py-2 border border-red-500/20 hover:border-red-500/50 rounded-lg self-start md:self-center">
                Delete Fit
              </button>
            </div>

            {/* Products List */}
            <div className="p-6 bg-[var(--bg-card)]">
              <h3 className="font-bold text-[var(--text-dim)] mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Attached Products
              </h3>
              
              <div className="space-y-4 mb-6">
                {fit.items.length === 0 ? (
                  <p className="text-[var(--text-dim)] text-sm">No products attached to this look.</p>
                ) : (
                  fit.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[var(--bg-alt)] border border-[var(--line)] p-4 rounded-xl relative group">
                      
                      {/* Database Product Picker */}
                      <div className="md:col-span-4">
                        <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Search className="w-2.5 h-2.5" /> Assign Catalog Product
                        </label>
                        <select
                          value={item.slug}
                          onChange={(e) => selectPresetProduct(fitIndex, itemIndex, e.target.value)}
                          className="w-full bg-[var(--bg)] text-sm text-[var(--text)] border border-[var(--line)] rounded p-1.5 outline-none focus:border-[var(--accent)]"
                        >
                          <option value="">-- Choose real product --</option>
                          {dbProducts.map(p => (
                            <option key={p.slug} value={p.slug}>
                              {p.title} (₹{p.base_price})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1">Display Name</label>
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => updateItem(fitIndex, itemIndex, 'name', e.target.value)}
                          className="w-full bg-transparent text-sm text-[var(--text)] font-bold outline-none border-b border-[var(--line)] focus:border-[var(--accent)] pb-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1">Type Label</label>
                        <input 
                          type="text" 
                          value={item.type}
                          onChange={(e) => updateItem(fitIndex, itemIndex, 'type', e.target.value)}
                          placeholder="e.g. OUTERWEAR"
                          className="w-full bg-transparent text-sm text-[var(--text)] font-bold outline-none border-b border-[var(--line)] focus:border-[var(--accent)] pb-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1">Price (₹)</label>
                        <input 
                          type="number" 
                          value={item.price}
                          onChange={(e) => updateItem(fitIndex, itemIndex, 'price', e.target.value)}
                          className="w-full bg-transparent text-sm text-[var(--text)] font-bold outline-none border-b border-[var(--line)] focus:border-[var(--accent)] pb-1"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <button onClick={() => removeItem(fitIndex, itemIndex)} className="text-[var(--text-dim)] hover:text-red-400 p-2 border border-transparent hover:border-red-500/20 rounded-lg">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => addItemToFit(fitIndex)}
                className="w-full border border-dashed border-[var(--line)] hover:border-[var(--text-dim)] text-[var(--text-dim)] hover:text-[var(--text)] rounded-xl p-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Product to this Look
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={addFit}
          className="w-full border-2 border-dashed border-[var(--line)] hover:border-[var(--accent)] text-[var(--text-dim)] hover:text-[var(--accent)] rounded-[24px] p-8 flex flex-col items-center justify-center gap-3 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--bg-alt)] flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg">Create New Curated Fit</span>
        </button>
      </div>
    </div>
  );
}

