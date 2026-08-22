'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  Sliders,
  Image as ImageIcon,
  Tag,
  Link as LinkIcon,
  HelpCircle,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { CategoryCardProps } from '@/components/storefront/PremiumCategoriesBentoClient';
import MediaUploader from '@/components/admin/MediaUploader';
import { saveCmsSectionAction } from '@/app/actions/cms';
import Link from 'next/link';

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  is_active?: boolean;
}

export default function AdminCategoriesManagement() {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [sectionTag, setSectionTag] = useState<string>('Curated Aesthetics');
  const [sectionTitle, setSectionTitle] = useState<string>('Categories');
  const [categories, setCategories] = useState<CategoryCardProps[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hoveredPreview, setHoveredPreview] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch CMS config for categories
      const { data: cmsData } = await (supabase.from('cms_sections') as any)
        .select('json_content')
        .eq('section_key', 'categories_config')
        .single();

      // 2. Fetch active categories from database catalog
      const { data: dbCats } = await (supabase.from('categories') as any)
        .select('id, name, slug, image_url, is_active')
        .order('name');

      if (dbCats) {
        setDbCategories(dbCats);
      }

      if (cmsData?.json_content) {
        const config = cmsData.json_content;
        setIsEnabled(config.is_enabled !== false);
        setSectionTag(config.section_tag || 'Curated Aesthetics');
        setSectionTitle(config.section_title || 'Categories');
        if (Array.isArray(config.categories) && config.categories.length > 0) {
          setCategories(config.categories.map((c: any) => ({
            ...c,
            is_active: c.is_active !== false,
          })));
        } else {
          setDefaultPresetCategories(dbCats || []);
        }
      } else {
        setDefaultPresetCategories(dbCats || []);
      }
    } catch (err: any) {
      toast.error('Failed to load category CMS settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPresetCategories = (dbCats: DbCategory[]) => {
    if (dbCats && dbCats.length > 0) {
      const presets: CategoryCardProps[] = dbCats.slice(0, 4).map((c, i) => ({
        id: c.id,
        title: c.name,
        tag: i === 0 ? 'Shop Now' : i === 1 ? 'Explore' : i === 2 ? 'View Fits' : 'Drop Now',
        bgImage: c.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600&auto=format&fit=crop',
        link: `/category/${c.slug}`,
        is_active: true,
      }));
      setCategories(presets);
    } else {
      setCategories([
        {
          title: 'T-Shirts',
          tag: 'Shop Now',
          bgImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600&auto=format&fit=crop',
          link: '/category/t-shirts',
          is_active: true,
        },
        {
          title: 'Shirts',
          tag: 'Explore',
          bgImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1600&auto=format&fit=crop',
          link: '/category/shirts',
          is_active: true,
        },
        {
          title: 'Jeans',
          tag: 'View Fits',
          bgImage: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=1600&auto=format&fit=crop',
          link: '/category/jeans',
          is_active: true,
        },
        {
          title: 'Hoodies',
          tag: 'Drop Now',
          bgImage: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=1600&auto=format&fit=crop',
          link: '/category/hoodies',
          is_active: true,
        },
      ]);
    }
  };

  const handleUpdate = (index: number, field: keyof CategoryCardProps, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const handleToggleActive = (index: number) => {
    const updated = [...categories];
    const current = updated[index].is_active !== false;
    updated[index] = { ...updated[index], is_active: !current };
    setCategories(updated);
    toast.success(`${updated[index].title || 'Card'} is now ${!current ? 'Visible' : 'Hidden'}`);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setCategories(updated);
  };

  const handleAdd = () => {
    setCategories([
      ...categories,
      {
        id: `custom-${Date.now()}`,
        title: 'New Category',
        tag: 'Shop Now',
        bgImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1600&auto=format&fit=crop',
        link: '/catalog',
        is_active: true,
      },
    ]);
  };

  const handleDuplicate = (index: number) => {
    const target = categories[index];
    const clone: CategoryCardProps = {
      ...target,
      id: `clone-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    const updated = [...categories];
    updated.splice(index + 1, 0, clone);
    setCategories(updated);
    toast.success('Category tile duplicated');
  };

  const handleRemove = (index: number) => {
    if (window.confirm(`Are you sure you want to remove "${categories[index].title || 'this category'}"?`)) {
      setCategories(categories.filter((_, i) => i !== index));
      toast.success('Category tile removed');
    }
  };

  const handleSyncFromDatabase = () => {
    if (!dbCategories || dbCategories.length === 0) {
      toast.error('No categories found in the product database.');
      return;
    }

    const merged: CategoryCardProps[] = dbCategories.map((dbCat, index) => {
      // Find if already configured
      const existing = categories.find(c => c.link === `/category/${dbCat.slug}` || c.title.toLowerCase() === dbCat.name.toLowerCase());
      if (existing) {
        return existing;
      }
      return {
        id: dbCat.id,
        title: dbCat.name,
        tag: 'Shop Now',
        bgImage: dbCat.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600&auto=format&fit=crop',
        link: `/category/${dbCat.slug}`,
        is_active: true,
      };
    });

    setCategories(merged);
    toast.success(`Synced ${dbCategories.length} product categories from catalog!`);
  };

  const handleSelectDbCategory = (index: number, catId: string) => {
    const found = dbCategories.find(c => c.id === catId);
    if (!found) return;

    const updated = [...categories];
    updated[index] = {
      ...updated[index],
      title: found.name,
      link: `/category/${found.slug}`,
      bgImage: found.image_url || updated[index].bgImage,
    };
    setCategories(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      is_enabled: isEnabled,
      section_tag: sectionTag,
      section_title: sectionTitle,
      categories: categories,
    };

    const res = await saveCmsSectionAction('categories_config', payload);

    if (res.success) {
      toast.success('Categories storefront section updated successfully!');
    } else {
      toast.error('Failed to update: ' + res.error);
    }
    setSaving(false);
  };

  const activeCount = categories.filter(c => c.is_active !== false).length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-32">
      {/* ── TOP BAR / HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-[var(--text)] uppercase tracking-wide">
              Homepage Categories Strip
            </h1>
            <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
              isEnabled ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}>
              {isEnabled ? 'Live on Storefront' : 'Section Hidden'}
            </span>
          </div>
          <p className="text-sm text-[var(--text-dim)] mt-1">
            Control the full-width expanding accordion categories strip on your homepage. Hide, turn off, reorder, or customize titles and visuals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/categories"
            className="bg-[var(--bg-card)] border border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] font-mono text-xs font-bold px-4 py-2.5 rounded-xl hover:border-[var(--accent)] transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-[var(--accent)]" /> Catalog Categories
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="bg-[var(--bg-card)] border border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] font-mono text-xs font-bold px-4 py-2.5 rounded-xl hover:border-[var(--accent)] transition-all flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> View Storefront
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[var(--accent)]/20 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[var(--text-dim)] font-mono flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[var(--accent)]" />
          <span>Loading Categories Management System...</span>
        </div>
      ) : (
        <>
          {/* ── 1. SECTION MASTER SWITCH & HEADINGS ── */}
          <div className="bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[var(--accent)]" /> Section Visibility & Master Switch
                </h2>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  Turn this entire section on or off on the homepage with 1 click.
                </p>
              </div>

              {/* Master Toggle */}
              <button
                onClick={() => setIsEnabled(!isEnabled)}
                type="button"
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all cursor-pointer font-bold text-xs uppercase tracking-wider ${
                  isEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/40 text-red-400'
                }`}
              >
                {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{isEnabled ? 'Section Enabled (Showing on Home)' : 'Section Disabled (Hidden from Home)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--text-dim)] mb-2 font-bold flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[var(--accent)]" /> Section Tag / Eyebrow Text
                </label>
                <input
                  type="text"
                  value={sectionTag}
                  onChange={(e) => setSectionTag(e.target.value)}
                  placeholder="e.g. Curated Aesthetics, Fit Explorer, Ink Dynamics"
                  className="w-full bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] outline-none font-medium"
                />
                <span className="text-[11px] text-[var(--text-dim)] mt-1 block">
                  Replaces any old static tags (e.g. &ldquo;Explore the Archive&rdquo;).
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--text-dim)] mb-2 font-bold flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[var(--accent)]" /> Section Heading Title
                </label>
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="e.g. Categories, Shop By Fit, Collection Strips"
                  className="w-full bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] outline-none font-medium"
                />
                <span className="text-[11px] text-[var(--text-dim)] mt-1 block">
                  Main large heading displayed on the homepage.
                </span>
              </div>
            </div>
          </div>

          {/* ── 2. LIVE INTERACTIVE STOREFRONT PREVIEW ── */}
          <div className="bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Live Interactive Preview
                </h2>
                <p className="text-xs text-[var(--text-dim)]">
                  Hover over the cards below to preview how they expand on the storefront ({activeCount} active items).
                </p>
              </div>
              <span className="text-xs font-mono text-[var(--text-dim)]">
                {isEnabled ? '🟢 Section will render' : '🔴 Section is currently hidden'}
              </span>
            </div>

            {isEnabled && activeCount > 0 ? (
              <div className="border border-[var(--line)] rounded-xl overflow-hidden bg-black mt-4">
                <div className="p-4 bg-[var(--bg-alt)] border-b border-[var(--line)]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] font-bold block">
                    {sectionTag || 'Curated Aesthetics'}
                  </span>
                  <h3 className="font-display text-2xl font-bold uppercase text-[var(--text)]">
                    {sectionTitle || 'Categories'}
                  </h3>
                </div>

                {/* Preview Accordion Strip */}
                <div className="cat-strip" style={{ height: '320px' }}>
                  {categories
                    .filter(c => c.is_active !== false)
                    .map((cat, idx) => (
                      <div
                        key={cat.id || idx}
                        className="cat-panel cursor-pointer"
                        style={{
                          flex: hoveredPreview === idx ? 2.6 : hoveredPreview !== null ? 0.65 : 1,
                          transition: 'flex 0.4s ease',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={() => setHoveredPreview(idx)}
                        onMouseLeave={() => setHoveredPreview(null)}
                      >
                        <div
                          className="cat-panel-bg"
                          style={{
                            backgroundImage: `url(${cat.bgImage})`,
                            transform: hoveredPreview === idx ? 'scale(1.06)' : 'scale(1)',
                            transition: 'transform 0.4s ease',
                          }}
                        />
                        <div className="cat-panel-gradient" />
                        <span className="cat-panel-index">{String(idx + 1).padStart(2, '0')}</span>
                        <div className="cat-panel-content">
                          <h3 className="cat-panel-title" style={{ fontSize: '20px' }}>
                            {cat.title}
                          </h3>
                          {hoveredPreview === idx && (
                            <span className="cat-panel-cta" style={{ marginTop: '6px', padding: '4px 10px', fontSize: '9px' }}>
                              {cat.tag || 'Explore'} &rarr;
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-[var(--line)] rounded-xl text-center text-xs text-[var(--text-dim)] font-mono">
                {isEnabled
                  ? 'No active categories selected to display. Please enable at least 1 category below.'
                  : 'Section is turned OFF. Turn on the master switch above to preview and show on storefront.'}
              </div>
            )}
          </div>

          {/* ── 3. CATEGORY TILES MANAGER ── */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--text)] uppercase tracking-wide flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[var(--accent)]" /> Manage Category Tiles ({categories.length})
                </h2>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  Reorder, rename, change images, set custom links, and toggle individual categories.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSyncFromDatabase}
                  className="bg-[var(--bg-card)] border border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] font-mono text-xs font-bold px-4 py-2 rounded-xl hover:border-[var(--accent)] transition-all flex items-center gap-2 cursor-pointer"
                  title="Import categories from your Supabase catalog"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Auto-Sync from Catalog
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="bg-[var(--accent)] text-[var(--bg)] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Category Card
                </button>
              </div>
            </div>

            {/* List of Category Cards */}
            <div className="space-y-4">
              {categories.map((cat, index) => {
                const isActive = cat.is_active !== false;

                return (
                  <div
                    key={cat.id || index}
                    className={`bg-[var(--bg-card)] border transition-all rounded-2xl p-6 relative ${
                      isActive ? 'border-[var(--line)]' : 'border-red-500/20 opacity-75 bg-red-950/5'
                    }`}
                  >
                    {/* Top Row: Index, Status Pill, Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--line)]">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)]">
                          Position #{String(index + 1).padStart(2, '0')}
                        </span>

                        {/* Visibility Pill Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(index)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{isActive ? 'Visible on Store' : 'Hidden'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Reorder Buttons */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'up')}
                          className="p-2 rounded-lg bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === categories.length - 1}
                          onClick={() => handleMove(index, 'down')}
                          className="p-2 rounded-lg bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicate(index)}
                          className="p-2 rounded-lg bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer"
                          title="Duplicate Tile"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all cursor-pointer"
                          title="Delete Tile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Category Info & Links */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono uppercase tracking-widest text-[var(--text-dim)] mb-1.5 font-bold">
                              Category Title (Display Name)
                            </label>
                            <input
                              type="text"
                              value={cat.title}
                              onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                              placeholder="e.g. Oversized Tees"
                              className="w-full bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-[var(--accent)] outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono uppercase tracking-widest text-[var(--text-dim)] mb-1.5 font-bold">
                              Hover CTA Tag Text
                            </label>
                            <input
                              type="text"
                              value={cat.tag}
                              onChange={(e) => handleUpdate(index, 'tag', e.target.value)}
                              placeholder="e.g. Shop Now, Explore, View Fits"
                              className="w-full bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-[var(--accent)] outline-none"
                            />
                          </div>
                        </div>

                        {/* Link & Quick Database Category Selector */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-mono uppercase tracking-widest text-[var(--text-dim)] font-bold flex items-center gap-1.5">
                              <LinkIcon className="w-3.5 h-3.5 text-[var(--accent)]" /> Destination Link
                            </label>
                            {dbCategories.length > 0 && (
                              <span className="text-[10px] font-mono text-[var(--text-dim)]">
                                Select from catalog or type custom URL
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            {dbCategories.length > 0 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) handleSelectDbCategory(index, e.target.value);
                                }}
                                defaultValue=""
                                className="bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text-dim)] text-xs rounded-xl px-3 py-2.5 outline-none font-medium cursor-pointer"
                              >
                                <option value="" disabled>
                                  ⚡ Quick Link to Catalog Category...
                                </option>
                                {dbCategories.map((dbCat) => (
                                  <option key={dbCat.id} value={dbCat.id}>
                                    {dbCat.name} (/category/{dbCat.slug})
                                  </option>
                                ))}
                              </select>
                            )}

                            <input
                              type="text"
                              value={cat.link}
                              onChange={(e) => handleUpdate(index, 'link', e.target.value)}
                              placeholder="/category/oversized-tees"
                              className="flex-1 bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[var(--accent)] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Background Image Preview & Media Uploader */}
                      <div className="space-y-3">
                        <label className="block text-xs font-mono uppercase tracking-widest text-[var(--text-dim)] font-bold flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[var(--accent)]" /> Background Cover Image
                        </label>

                        <div className="flex gap-3 items-center">
                          <div className="w-24 h-24 rounded-xl border border-[var(--line)] overflow-hidden bg-black shrink-0 relative group">
                            {cat.bgImage ? (
                              <img
                                src={cat.bgImage}
                                alt={cat.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--text-dim)] text-[10px] font-mono">
                                No Image
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <MediaUploader
                              label={cat.bgImage ? 'Change Image' : 'Upload Image'}
                              onUploadSuccess={(url) => handleUpdate(index, 'bgImage', url)}
                            />
                            <input
                              type="text"
                              value={cat.bgImage}
                              onChange={(e) => handleUpdate(index, 'bgImage', e.target.value)}
                              placeholder="Or paste image URL"
                              className="w-full bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text-dim)] rounded-lg px-2.5 py-1.5 text-[11px] font-mono focus:border-[var(--accent)] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Tile Bar */}
            <button
              type="button"
              onClick={handleAdd}
              className="w-full border-2 border-dashed border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)] rounded-2xl p-6 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)]"
            >
              <Plus className="w-5 h-5" /> Add Another Category Tile to Storefront Strip
            </button>
          </div>

          {/* ── 4. STICKY SAVE BAR AT BOTTOM ── */}
          <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--line)] px-5 py-3.5 rounded-2xl shadow-2xl">
            <span className="text-xs font-mono text-[var(--text-dim)] hidden sm:inline">
              {activeCount} of {categories.length} Categories Active &bull; {isEnabled ? 'Section On' : 'Section Off'}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--accent)] text-[var(--bg)] font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[var(--accent)]/30 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save & Publish Live'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
