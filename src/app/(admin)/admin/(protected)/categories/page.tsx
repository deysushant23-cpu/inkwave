'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types/database';
import { Plus, X, Eye, EyeOff, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { createCategoryAction, toggleCategoryStatusAction, toggleCategoryHeaderAction, updateCategoryAction, deleteCategoryAction } from '@/app/actions/catalog';
import { saveCmsSectionAction } from '@/app/actions/cms';
import { toast } from 'sonner';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('categories') as any).select('*');
    const { data: orderData } = await (supabase.from('cms_sections') as any)
      .select('json_content')
      .eq('section_key', 'categories_sort_order')
      .single();

    if (!error && data) {
      let sorted = data as any[];
      const orderContent = orderData?.json_content as any;
      if (orderContent?.order) {
        const orderArray = orderContent.order as string[];
        sorted = [...data].sort((a: any, b: any) => {
          const indexA = orderArray.indexOf(a.id);
          const indexB = orderArray.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      } else {
        sorted = [...data].sort((a: any, b: any) => a.name.localeCompare(b.name));
      }
      setCategories(sorted);
    }
    setLoading(false);
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setCategories(updated);
    const orderIds = updated.map(c => c.id);

    setSaving(true);
    const result = await saveCmsSectionAction('categories_sort_order', { order: orderIds });
    setSaving(false);

    if (result.success) {
      toast.success("Category position updated successfully!");
    } else {
      toast.error("Failed to save category order: " + result.error);
      fetchCategories();
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9\-]+/g, '-'),
      description,
    };
    
    if (editingCategory) {
      const result = await updateCategoryAction(editingCategory.id, payload);
      setIsSubmitting(false);

      if (result.success) {
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...payload } : c));
        setIsModalOpen(false);
        resetForm();
        toast.success("Category updated!");
      } else {
        toast.error("Failed to update category: " + (result.error || "Unknown error"));
      }
    } else {
      const createPayload = {
        ...payload,
        is_active: true,
        show_in_header: false
      };
      const result = await createCategoryAction(createPayload);
      setIsSubmitting(false);

      if (result.success && result.category) {
        setCategories([...categories, result.category]);
        setIsModalOpen(false);
        resetForm();
        toast.success("Category created!");
      } else {
        toast.error("Failed to create category: " + (result.error || "Unknown error"));
      }
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Are you sure you want to delete ${category.name}?`)) return;
    
    const result = await deleteCategoryAction(category.id);
    if (result.success) {
      setCategories(categories.filter(c => c.id !== category.id));
      toast.success("Category deleted!");
    } else {
      toast.error("Failed to delete category (it may contain products): " + result.error);
    }
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setEditingCategory(null);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || '');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (category: Category) => {
    const newStatus = !category.is_active;
    
    // Optimistic UI update
    setCategories(categories.map(c => c.id === category.id ? { ...c, is_active: newStatus } : c));
    
    const result = await toggleCategoryStatusAction(category.id, newStatus);
    
    if (result.success) {
      toast.success(`Category ${newStatus ? 'activated' : 'deactivated'}!`);
    } else {
      // Revert on error
      setCategories(categories.map(c => c.id === category.id ? { ...c, is_active: !newStatus } : c));
      toast.error("Failed to update status: " + result.error);
    }
  };

  const handleToggleHeader = async (category: Category) => {
    const newStatus = !category.show_in_header;
    
    // Optimistic UI update
    setCategories(categories.map(c => c.id === category.id ? { ...c, show_in_header: newStatus } : c));
    
    const result = await toggleCategoryHeaderAction(category.id, newStatus);
    
    if (result.success) {
      toast.success(`Category ${newStatus ? 'added to' : 'removed from'} header!`);
    } else {
      // Revert on error
      setCategories(categories.map(c => c.id === category.id ? { ...c, show_in_header: !newStatus } : c));
      toast.error("Failed to update header status: " + result.error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--text)]">Categories</h1>
          <p className="text-[var(--text-dim)]">Manage product collections and categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="/admin/cms-categories"
            className="bg-[var(--bg-card)] border border-[var(--line)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] font-mono text-xs font-bold px-5 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            Manage Homepage Categories Strip &rarr;
          </a>
          <button 
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-2.5 rounded-full flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[var(--accent)]/20 transition-all hover:scale-105 cursor-pointer text-xs uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> New Category
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--line)] rounded-3xl overflow-hidden mb-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-alt)] text-[var(--text-dim)]">
              <tr>
                <th className="p-6 font-semibold uppercase tracking-wider">Name</th>
                <th className="p-6 font-semibold uppercase tracking-wider">Slug</th>
                <th className="p-6 font-semibold uppercase tracking-wider">Description</th>
                <th className="p-6 font-semibold uppercase tracking-wider">Status</th>
                <th className="p-6 font-semibold uppercase tracking-wider">Header Nav</th>
                <th className="p-6 font-semibold uppercase tracking-wider">Position</th>
                <th className="p-6 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-dim)]">Loading...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-dim)]">No categories found. Create one above.</td>
                </tr>
              ) : (
                categories.map((c, index) => (
                  <tr key={c.id} className="hover:bg-[var(--bg-alt)]/50 transition-colors">
                    <td className="p-6 font-bold text-[var(--text)]">{c.name}</td>
                    <td className="p-6 text-[var(--text-dim)] font-mono">{c.slug}</td>
                    <td className="p-6 text-[var(--text-dim)] max-w-xs truncate">{c.description || '-'}</td>
                    <td className="p-6">
                      <button 
                        onClick={() => handleToggleStatus(c)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all border ${
                          c.is_active 
                            ? 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50' 
                            : 'bg-[var(--bg)] text-[var(--text-dim)] border-[var(--line)] hover:bg-[var(--bg-alt)] hover:text-white'
                        }`}
                      >
                        {c.is_active ? (
                          <>
                            <Eye className="w-4 h-4" /> ACTIVE
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" /> HIDDEN
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => handleToggleHeader(c)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all border ${
                          c.show_in_header 
                            ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/50' 
                            : 'bg-[var(--bg)] text-[var(--text-dim)] border-[var(--line)] hover:bg-[var(--bg-alt)] hover:text-white'
                        }`}
                      >
                        {c.show_in_header ? 'IN HEADER' : 'HIDDEN'}
                      </button>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--text)]">#{index + 1}</span>
                        <div className="flex gap-1">
                          <button
                            disabled={index === 0 || saving}
                            onClick={() => handleMoveCategory(index, 'up')}
                            className="p-1 rounded bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={index === categories.length - 1 || saving}
                            onClick={() => handleMoveCategory(index, 'down')}
                            className="p-1 rounded bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(c)}
                          className="p-2 text-[var(--text-dim)] hover:text-[var(--accent)] hover:bg-[var(--bg)] rounded-full transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(c)}
                          className="p-2 text-[var(--text-dim)] hover:text-red-500 hover:bg-[var(--bg)] rounded-full transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] rounded-[32px] w-full max-w-md shadow-2xl p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-[var(--bg-alt)] text-[var(--text-dim)] hover:text-[var(--text)] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-display text-2xl font-bold mb-6 text-[var(--text)]">{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-dim)] mb-2 uppercase tracking-widest">Name</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  className="w-full bg-[var(--bg-alt)] border-none rounded-xl p-4 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="e.g. Outerwear"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-dim)] mb-2 uppercase tracking-widest">Slug</label>
                <input 
                  required
                  type="text" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-[var(--bg-alt)] border-none rounded-xl p-4 text-[var(--text)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="e.g. outerwear"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-dim)] mb-2 uppercase tracking-widest">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[var(--bg-alt)] border-none rounded-xl p-4 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] min-h-[100px]"
                  placeholder="Optional description"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-full font-bold text-sm bg-[var(--bg-alt)] text-[var(--text)] hover:opacity-80 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-3 rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingCategory ? 'Save Changes' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
