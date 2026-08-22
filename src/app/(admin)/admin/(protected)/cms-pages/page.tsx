'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CmsSection } from '@/types/database';
import { FileText, Save, Plus, X, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function CmsPagesAdmin() {
  const [pages, setPages] = useState<CmsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('cms_sections') as any)
      .select('*')
      .like('section_key', 'page_%')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setPages(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setSlug('');
    setTitle('');
    setContent('');
  };

  const openEditModal = (page: CmsSection) => {
    setEditingId(page.id);
    const pageSlug = page.section_key.replace('page_', '');
    setSlug(pageSlug);
    setTitle(page.json_content?.title || '');
    setContent(page.json_content?.content || '');
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !title) return;
    
    setIsSubmitting(true);
    
    // Sanitize slug
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const sectionKey = `page_${cleanSlug}`;
    
    const payload = {
      section_key: sectionKey,
      json_content: {
        title,
        content
      },
      is_published: true
    };

    if (editingId) {
      const { error } = await (supabase.from('cms_sections') as any).update(payload).eq('id', editingId);
      if (!error) {
        toast.success("Page updated successfully!");
        setPages(pages.map(p => p.id === editingId ? { ...p, ...payload, updated_at: new Date().toISOString() } : p));
        setIsModalOpen(false);
      } else {
        toast.error("Failed to update: " + error.message);
      }
    } else {
      const { data, error } = await (supabase.from('cms_sections') as any).insert([payload]).select();
      if (!error && data) {
        toast.success("Page created successfully!");
        setPages([data[0], ...pages]);
        setIsModalOpen(false);
      } else {
        toast.error("Failed to create: " + (error?.message || "Unknown error"));
      }
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, pageTitle: string) => {
    if (confirm(`Are you sure you want to delete the page "${pageTitle}"?`)) {
      const { error } = await (supabase.from('cms_sections') as any).delete().eq('id', id);
      if (!error) {
        toast.success("Page deleted");
        setPages(pages.filter(p => p.id !== id));
      } else {
        toast.error("Failed to delete");
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--text)] flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--accent)]" /> Footer Docs
          </h1>
          <p className="text-[var(--text-dim)] mt-1">Manage dynamic pages linked in the site footer (e.g., Shipping, About, Contact).</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-2.5 rounded-full flex items-center gap-2 hover:opacity-90 shadow-lg shadow-[var(--accent)]/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" /> Create Page
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-[var(--text-dim)] flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4" />
            Loading pages...
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[var(--bg-alt)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--line)]">
              <FileText className="w-8 h-8 text-[var(--text-dim)]" />
            </div>
            <h3 className="font-bold text-lg mb-2">No pages found</h3>
            <p className="text-[var(--text-dim)] mb-6 max-w-md mx-auto">Create your first dynamic page to link in the footer. Recommended pages: shipping, size-guide, about, contact.</p>
            <button onClick={openCreateModal} className="text-[var(--accent)] font-bold hover:underline">
              + Create a new page
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg-alt)]/50">
                  <th className="p-5 font-bold text-[var(--text-dim)] text-xs uppercase tracking-wider">Page Title</th>
                  <th className="p-5 font-bold text-[var(--text-dim)] text-xs uppercase tracking-wider">Slug / URL</th>
                  <th className="p-5 font-bold text-[var(--text-dim)] text-xs uppercase tracking-wider">Last Updated</th>
                  <th className="p-5 font-bold text-[var(--text-dim)] text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {pages.map((page) => {
                  const slug = page.section_key.replace('page_', '');
                  return (
                    <tr key={page.id} className="hover:bg-[var(--bg-alt)]/30 transition-colors">
                      <td className="p-5 font-bold text-[var(--text)]">
                        {page.json_content?.title || 'Untitled Page'}
                      </td>
                      <td className="p-5 font-mono text-sm text-[var(--text-dim)]">
                        /pages/{slug}
                      </td>
                      <td className="p-5 text-sm text-[var(--text-dim)]">
                        {new Date(page.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(page)}
                            className="p-2 text-[var(--text-dim)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-colors"
                            title="Edit Page"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(page.id, page.json_content?.title || 'Untitled')}
                            className="p-2 text-[var(--text-dim)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--bg-card)] rounded-[32px] w-full max-w-4xl shadow-2xl relative border border-[var(--line)] my-8 flex flex-col h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--line)]">
              <h2 className="font-display text-2xl font-bold text-[var(--text)]">
                {editingId ? 'Edit Page' : 'Create New Page'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-[var(--bg-alt)] text-[var(--text-dim)] hover:text-[var(--text)] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Page Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    placeholder="e.g. Shipping & Returns"
                    className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors font-bold text-lg" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">URL Slug</label>
                  <div className="flex items-center bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl focus-within:border-[var(--accent)] transition-colors overflow-hidden">
                    <span className="pl-3 py-3 text-[var(--text-dim)] font-mono text-sm bg-[var(--bg-card)]">/pages/</span>
                    <input 
                      type="text" 
                      value={slug} 
                      onChange={e => setSlug(e.target.value)} 
                      required 
                      disabled={!!editingId} // Don't allow changing slug of existing pages to prevent broken links
                      placeholder="e.g. shipping"
                      className="w-full bg-transparent p-3 text-[var(--text)] outline-none font-mono text-sm" 
                    />
                  </div>
                  {editingId && <p className="text-[10px] text-[var(--text-dim)] mt-1">Slug cannot be changed after creation.</p>}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-2">Page Content (HTML or Text)</label>
                <textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  required 
                  placeholder="Enter your page content here..."
                  className="flex-1 w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-4 text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors font-mono text-sm resize-none" 
                />
              </div>

              <div className="shrink-0 pt-4 border-t border-[var(--line)]">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-[var(--accent)] text-[var(--bg)] font-bold p-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? 'Saving...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
