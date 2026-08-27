'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveCmsSectionAction } from '@/app/actions/cms';

interface FooterLink {
  label: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export default function AdminFooterConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [columns, setColumns] = useState<FooterColumn[]>([
    {
      title: 'Help',
      links: [
        { label: 'Shipping & returns', url: '/pages/shipping' },
        { label: 'Size guide', url: '/pages/size-guide' },
        { label: 'Track order', url: '/pages/track-order' },
        { label: 'Contact', url: '/pages/contact' }
      ]
    },
    {
      title: 'Studio',
      links: [
        { label: 'About', url: '/pages/about' },
        { label: 'Lookbook', url: '/pages/lookbook' },
        { label: 'Journal', url: '/pages/journal' },
        { label: 'Careers', url: '/pages/careers' }
      ]
    },
    {
      title: 'Follow',
      links: [
        { label: 'Instagram', url: 'https://instagram.com' }
      ]
    }
  ]);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('cms_sections') as any)
      .select('json_content')
      .eq('section_key', 'footer_config')
      .single();

    if (data?.json_content?.columns) {
      setColumns(data.json_content.columns);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const payload = { columns };

    const res = await saveCmsSectionAction('footer_config', payload);

    setSaving(false);
    if (!res.success) {
      toast.error('Failed to save footer config: ' + res.error);
    } else {
      toast.success('Footer updated! Changes are live.');
    }
  };

  const addColumn = () => {
    if (columns.length >= 4) {
      toast.error("Maximum of 4 columns allowed in footer");
      return;
    }
    setColumns([...columns, { title: 'New Column', links: [] }]);
  };

  const updateColumnTitle = (index: number, title: string) => {
    const newCols = [...columns];
    newCols[index].title = title;
    setColumns(newCols);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const addLink = (colIndex: number) => {
    const newCols = [...columns];
    newCols[colIndex].links.push({ label: 'New Link', url: '/pages/new-page' });
    setColumns(newCols);
  };

  const updateLink = (colIndex: number, linkIndex: number, field: keyof FooterLink, value: string) => {
    const newCols = [...columns];
    newCols[colIndex].links[linkIndex][field] = value;
    setColumns(newCols);
  };

  const removeLink = (colIndex: number, linkIndex: number) => {
    const newCols = [...columns];
    newCols[colIndex].links = newCols[colIndex].links.filter((_, i) => i !== linkIndex);
    setColumns(newCols);
  };

  if (loading) {
    return <div className="p-8 text-[var(--text-dim)]">Loading configuration...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--text)]">Footer Navigation</h1>
          <p className="text-[var(--text-dim)] mt-1">Manage footer columns and links dynamically.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="bg-[var(--bg-card)] border border-[var(--line)] p-6 rounded-[24px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 w-full">
                <input 
                  type="text" 
                  value={col.title}
                  onChange={(e) => updateColumnTitle(colIndex, e.target.value)}
                  className="bg-transparent border-b border-[var(--line)] text-xl font-display font-bold text-[var(--text)] outline-none focus:border-[var(--accent)] flex-1 px-1 py-1"
                />
              </div>
              <button onClick={() => removeColumn(colIndex)} className="text-red-400 hover:text-red-300 ml-4">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              {col.links.length === 0 ? (
                <p className="text-[var(--text-dim)] text-sm">No links added.</p>
              ) : (
                col.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="flex gap-2 items-start bg-[var(--bg-alt)] border border-[var(--line)] p-3 rounded-xl relative group">
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={link.label}
                        onChange={(e) => updateLink(colIndex, linkIndex, 'label', e.target.value)}
                        placeholder="Link Label"
                        className="w-full bg-transparent text-sm text-[var(--text)] font-bold outline-none border-b border-transparent focus:border-[var(--line)]"
                      />
                      <input 
                        type="text" 
                        value={link.url}
                        onChange={(e) => updateLink(colIndex, linkIndex, 'url', e.target.value)}
                        placeholder="/pages/url"
                        className="w-full bg-transparent text-xs text-[var(--text-dim)] font-mono outline-none border-b border-transparent focus:border-[var(--line)]"
                      />
                    </div>
                    <button onClick={() => removeLink(colIndex, linkIndex)} className="text-[var(--text-dim)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => addLink(colIndex)}
              className="w-full border border-dashed border-[var(--line)] hover:border-[var(--text-dim)] text-[var(--text-dim)] hover:text-[var(--text)] rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Link
            </button>
          </div>
        ))}

        {columns.length < 4 && (
          <button 
            onClick={addColumn}
            className="border-2 border-dashed border-[var(--line)] hover:border-[var(--accent)] text-[var(--text-dim)] hover:text-[var(--accent)] rounded-[24px] p-6 flex flex-col items-center justify-center gap-3 min-h-[300px] transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--bg-alt)] flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold">Add New Column</span>
          </button>
        )}
      </div>
    </div>
  );
}
