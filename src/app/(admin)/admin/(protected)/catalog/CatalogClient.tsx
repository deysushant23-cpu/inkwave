'use client';

import { useState, useMemo } from 'react';
import { Product, Category, ProductVariant } from '@/types/database';
import { 
  PackagePlus, 
  X, 
  Edit3, 
  ListTree, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Loader2, 
  Search, 
  Sparkles, 
  Plus, 
  Copy, 
  AlertCircle,
  Flame,
  Layers,
  LayoutGrid,
  LayoutList,
  Check,
  ExternalLink,
  Box,
  Tag,
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  Percent,
  Zap,
  BadgePercent,
  TrendingDown
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import MediaUploader from '@/components/admin/MediaUploader';
import { 
  createProductAction, 
  updateProductAction, 
  deleteProductAction,
  addVariantAction, 
  bulkAddVariantsAction,
  updateVariantAction, 
  deleteVariantAction, 
  getProductVariantsAction,
  toggleProductSaleAction,
  bulkSetCategorySaleAction
} from '@/app/actions/catalog';
import { saveProductSeoAction, getProductSeoAction } from '@/app/actions/admin';

interface CatalogClientProps {
  initialProducts: any[];
  initialCategories: Category[];
}

type ViewMode = 'table' | 'grid';
type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'stock_desc' | 'stock_asc' | 'title_asc' | 'sale_first';

export default function CatalogClient({ initialProducts, initialCategories }: CatalogClientProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);
  const [isBulkSaleModalOpen, setIsBulkSaleModalOpen] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState<string | null>(null);
  const [togglingSaleId, setTogglingSaleId] = useState<string | null>(null);
  
  // Current active product for editing / variants
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeVariants, setActiveVariants] = useState<ProductVariant[]>([]);
  
  // Form State for Product
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState<number | string>(0);
  const [compareAtPrice, setCompareAtPrice] = useState<number | string>('');
  const [isSale, setIsSale] = useState(false);
  const [saleBadgeText, setSaleBadgeText] = useState('SALE');
  const [discountPercent, setDiscountPercent] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [overlayMaskUrl, setOverlayMaskUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isDrop, setIsDrop] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SEO Metadata State
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Bulk Sale Campaign State
  const [bulkSaleCategory, setBulkSaleCategory] = useState<string>('all');
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState<number>(20);
  const [bulkSaleBadgeText, setBulkSaleBadgeText] = useState<string>('SALE');
  const [isApplyingBulkSale, setIsApplyingBulkSale] = useState(false);

  const handleApplyBulkSale = async (isSale: boolean) => {
    setIsApplyingBulkSale(true);
    try {
      const res = await bulkSetCategorySaleAction(
        bulkSaleCategory,
        isSale,
        Number(bulkDiscountPercent) || 20,
        bulkSaleBadgeText || 'SALE'
      );

      if (res.success) {
        toast.success(isSale ? 'Sale campaign launched successfully!' : 'Sale turned off for selected products.');
        setProducts(prev => prev.map(p => {
          if (bulkSaleCategory === 'all' || p.category_id === bulkSaleCategory) {
            const base = Number(p.base_price || 0);
            const originalCompare = isSale ? Math.round(base / (1 - (Number(bulkDiscountPercent) / 100))) : null;
            return {
              ...p,
              is_sale: isSale,
              compare_at_price: originalCompare,
              sale_badge_text: isSale ? bulkSaleBadgeText : null,
              discount_percent: isSale ? bulkDiscountPercent : null
            };
          }
          return p;
        }));
        setIsBulkSaleModalOpen(false);
      } else {
        toast.error('Failed to apply sale: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      toast.error('Error applying sale: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsApplyingBulkSale(false);
    }
  };

  // Variant editing state
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [newVarSize, setNewVarSize] = useState('M');
  const [newVarColor, setNewVarColor] = useState('');
  const [newVarSku, setNewVarSku] = useState('');
  const [newVarStock, setNewVarStock] = useState<number | string>(10);
  const [newVarPrice, setNewVarPrice] = useState<number | string>('');
  const [newVarComparePrice, setNewVarComparePrice] = useState<number | string>('');
  const [isDirty, setIsDirty] = useState(false);

  // Key KPI Metrics
  const stats = useMemo(() => {
    const total = products.length;
    const drops = products.filter(p => p.is_drop).length;
    const saleCount = products.filter(p => p.is_sale || (p.compare_at_price && Number(p.compare_at_price) > Number(p.base_price))).length;
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      const vars = p.product_variants || [];
      if (vars.length === 0) {
        outOfStockCount++;
      } else {
        const prodStock = vars.reduce((sum: number, v: any) => sum + (Number(v.stock_quantity) || 0), 0);
        totalStock += prodStock;
        if (prodStock === 0) outOfStockCount++;
        else if (prodStock < 10) lowStockCount++;
      }
    });

    return { total, drops, saleCount, totalStock, lowStockCount, outOfStockCount };
  }, [products]);

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setCategoryId('');
    setBasePrice(0);
    setCompareAtPrice('');
    setIsSale(false);
    setSaleBadgeText('SALE');
    setDiscountPercent('');
    setDescription('');
    setOverlayMaskUrl('');
    setImages([]);
    setIsDrop(true);
    setActiveProduct(null);
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = async (p: any) => {
    setActiveProduct(p);
    setTitle(p.title);
    setSlug(p.slug);
    setCategoryId(p.category_id || '');
    setBasePrice(p.base_price || 0);
    const comp = p.compare_at_price ?? p.compareAtPrice ?? '';
    setCompareAtPrice(comp);
    
    const hasCompare = comp !== '' && comp !== null && Number(comp) > Number(p.base_price);
    const onSale = Boolean(p.is_sale || hasCompare);
    setIsSale(onSale);
    setSaleBadgeText(p.sale_badge_text || 'SALE');
    
    if (hasCompare) {
      setDiscountPercent(Math.round(((Number(comp) - Number(p.base_price)) / Number(comp)) * 100));
    } else {
      setDiscountPercent(p.discount_percent || '');
    }

    setDescription(p.description || '');
    setOverlayMaskUrl(p.overlay_mask_url || '');
    const productImages = p.images && Array.isArray(p.images) && p.images.length > 0 
      ? p.images 
      : (p.overlay_mask_url ? [p.overlay_mask_url] : []);
    setImages(productImages);
    setIsDrop(p.is_drop ?? true);

    // Fetch SEO metadata from cms_sections
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
    
    const seoRes = await getProductSeoAction(p.id);
    if (seoRes.success && seoRes.seo) {
      const j = seoRes.seo as any;
      setMetaTitle(j.title || '');
      setMetaDescription(j.description || '');
      setMetaKeywords(j.keywords || '');
    }

    setIsEditModalOpen(true);
  };

  const handleQuickToggleSale = async (p: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setTogglingSaleId(p.id);
    const currentlyOnSale = Boolean(p.is_sale || (p.compare_at_price && Number(p.compare_at_price) > Number(p.base_price)));
    const nextIsSale = !currentlyOnSale;

    let nextComparePrice: number | null = null;
    let nextDiscountPct: number | null = null;
    let nextBadge = 'SALE';

    if (nextIsSale) {
      const base = Number(p.base_price || 0);
      if (p.compare_at_price && Number(p.compare_at_price) > base) {
        nextComparePrice = Number(p.compare_at_price);
        nextDiscountPct = Math.round(((nextComparePrice - base) / nextComparePrice) * 100);
      } else {
        nextDiscountPct = 20;
        nextComparePrice = Math.round(base / 0.8);
      }
      nextBadge = p.sale_badge_text || 'SALE';
    }

    try {
      const res = await toggleProductSaleAction(p.id, nextIsSale, nextComparePrice, nextBadge, nextDiscountPct);
      if (res.success) {
        toast.success(nextIsSale ? `🔥 "${p.title}" is now ON SALE (${nextDiscountPct}% OFF)!` : `Sale turned OFF for "${p.title}".`);
        setProducts(prev => prev.map(item => item.id === p.id ? {
          ...item,
          is_sale: nextIsSale,
          compare_at_price: nextComparePrice,
          sale_badge_text: nextIsSale ? nextBadge : null,
          discount_percent: nextDiscountPct
        } : item));
      } else {
        toast.error("Failed to update sale status: " + res.error);
      }
    } catch (err: any) {
      toast.error("Error updating sale status: " + (err?.message || "Unknown error"));
    } finally {
      setTogglingSaleId(null);
    }
  };



  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const copy = [...images];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    setImages(copy);
    setOverlayMaskUrl(copy[0] || '');
  };

  const handleUpdateImageSlot = (index: number, url: string) => {
    const copy = [...images];
    copy[index] = url;
    setImages(copy);
    if (index === 0) setOverlayMaskUrl(url);
  };

  const handleRemoveImageSlot = (index: number) => {
    const copy = images.filter((_, idx) => idx !== index);
    setImages(copy);
    setOverlayMaskUrl(copy[0] || '');
  };

  // Open Variants Modal & fetch live data
  const openVariantsModal = async (p: Product) => {
    setActiveProduct(p);
    setIsVariantsModalOpen(true);
    const existing = (p as any).product_variants || [];
    setActiveVariants(existing);
    
    // Auto-generate suggested SKU based on category
    const catName = categories.find(c => c.id === p.category_id)?.name || (p as any).categories?.name || '';
    const isJeans = Boolean(
      catName.toLowerCase().includes('jean') ||
      p.slug?.toLowerCase().includes('jean') ||
      p.slug?.toLowerCase().includes('denim') ||
      p.title?.toLowerCase().includes('jean') ||
      p.title?.toLowerCase().includes('denim')
    );
    const prefix = p.slug.toUpperCase().slice(0, 12).replace(/-$/, '');
    const defaultInitialSize = isJeans ? '28' : 'M';
    const rand = Math.floor(100 + Math.random() * 900);
    setNewVarSku(`${prefix}-${defaultInitialSize}-${rand}`);
    setNewVarSize(defaultInitialSize);
    setNewVarColor('');
    setNewVarStock(10);
    setNewVarPrice('');
    setNewVarComparePrice('');
    setIsDirty(false);
    setIsLoadingVariants(true);

    try {
      const res = await getProductVariantsAction(p.id);
      if (res.success && res.variants) {
        setActiveVariants(res.variants);
        setProducts(prev => prev.map(item => item.id === p.id ? { ...item, product_variants: res.variants } : item));
      }
    } catch (err) {
      console.error("Error fetching live variants:", err);
    } finally {
      setIsLoadingVariants(false);
    }
  };

  const saveProductSeo = async (productId: string) => {
    const res = await saveProductSeoAction(productId, {
      title: metaTitle.trim(),
      description: metaDescription.trim(),
      keywords: metaKeywords.trim()
    });
    if (!res.success) {
      console.error("Error saving product SEO metadata:", res.error);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent, isEdit: boolean) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const parsedComparePrice = compareAtPrice !== '' && compareAtPrice !== null && !isNaN(Number(compareAtPrice))
      ? parseFloat(compareAtPrice.toString())
      : null;

    const validImages = images.filter(Boolean);

    const payload = {
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      description: description.trim() || null,
      base_price: typeof basePrice === 'string' ? parseFloat(basePrice) || 0 : basePrice,
      compare_at_price: parsedComparePrice,
      is_sale: isSale,
      sale_badge_text: isSale ? (saleBadgeText.trim() || 'SALE') : null,
      discount_percent: discountPercent !== '' && !isNaN(Number(discountPercent)) ? Number(discountPercent) : null,
      category_id: categoryId || null,
      is_drop: isDrop,
      overlay_mask_url: validImages[0] || overlayMaskUrl || null,
      images: validImages
    };

    if (isEdit && activeProduct) {
      const result = await updateProductAction(activeProduct.id, payload);
      if (result.success) {
        await saveProductSeo(activeProduct.id);
        toast.success("Product updated successfully!");
        setProducts(products.map(p => p.id === activeProduct.id ? { 
          ...p, 
          ...payload,
          categories: categories.find(c => c.id === categoryId) || p.categories 
        } : p));
        setIsEditModalOpen(false);
      } else {
        toast.error("Failed to update: " + result.error);
      }
    } else {
      const result = await createProductAction(payload);
      if (result.success && result.product) {
        await saveProductSeo(result.product.id);
        toast.success("Product created successfully!");
        const newProd = {
          ...result.product,
          is_sale: isSale,
          sale_badge_text: isSale ? (saleBadgeText.trim() || 'SALE') : null,
          discount_percent: discountPercent !== '' && !isNaN(Number(discountPercent)) ? Number(discountPercent) : null,
          categories: categories.find(c => c.id === categoryId) || null,
          product_variants: []
        };
        setProducts([newProd, ...products]);
        setIsCreateModalOpen(false);
        // Prompt admin to immediately configure size variants
        openVariantsModal(newProd);
      } else {
        toast.error("Failed to create: " + (result.error || "Unknown error"));
      }
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${productTitle}" and all its variants? This cannot be undone.`)) {
      return;
    }

    setIsDeletingProduct(productId);
    try {
      const res = await deleteProductAction(productId);
      if (res.success) {
        toast.success(`"${productTitle}" was deleted.`);
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        toast.error("Failed to delete product: " + res.error);
      }
    } catch (err: any) {
      toast.error("Error deleting product: " + (err?.message || "Unknown error"));
    } finally {
      setIsDeletingProduct(null);
    }
  };

  // Quick Inline Variant Updates
  const handleVariantUpdate = async (variantId: string, field: 'stock_quantity' | 'price_override' | 'compare_at_price' | 'size' | 'color' | 'sku', value: any) => {
    const result = await updateVariantAction(variantId, { [field]: value });
    if (result.success) {
      toast.success("Variant updated!");
      const updated = activeVariants.map(v => v.id === variantId ? { ...v, [field]: value } : v);
      setActiveVariants(updated);
      setProducts(prev => prev.map(p => p.id === activeProduct?.id ? { ...p, product_variants: updated } : p));
    } else {
      toast.error("Failed to update variant: " + result.error);
    }
  };

  // Add Single Variant
  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    setIsAddingVariant(true);
    
    const parsedVarComparePrice = newVarComparePrice ? (typeof newVarComparePrice === 'string' ? parseFloat(newVarComparePrice) || null : newVarComparePrice) : null;

    const payload = {
      product_id: activeProduct.id,
      size: newVarSize.trim().toUpperCase(),
      color: newVarColor.trim() || null,
      sku: newVarSku.trim().toUpperCase(),
      stock_quantity: typeof newVarStock === 'string' ? parseInt(newVarStock) || 0 : newVarStock,
      price_override: newVarPrice ? (typeof newVarPrice === 'string' ? parseFloat(newVarPrice) || null : newVarPrice) : null,
      compare_at_price: parsedVarComparePrice
    };

    const result = await addVariantAction(payload);
    if (result.success && result.variant) {
      toast.success(`Size ${payload.size} variant added!`);
      const updated = [...activeVariants, result.variant];
      setActiveVariants(updated);
      setProducts(prev => prev.map(p => p.id === activeProduct.id ? { ...p, product_variants: updated } : p));
      
      // Auto increment or prepare next size (supports waist 28-36 and alpha sizes)
      const waistSizes = ['26', '28', '30', '32', '34', '36', '38', '40'];
      const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
      const waistIdx = waistSizes.indexOf(newVarSize.trim());
      const standardIdx = standardSizes.indexOf(newVarSize.toUpperCase().trim());

      let nextSize = 'L';
      if (waistIdx !== -1 && waistIdx < waistSizes.length - 1) {
        nextSize = waistSizes[waistIdx + 1];
      } else if (standardIdx !== -1 && standardIdx < standardSizes.length - 1) {
        nextSize = standardSizes[standardIdx + 1];
      }
      setNewVarSize(nextSize);
      const cleanPrefix = activeProduct.slug.toUpperCase().slice(0, 12).replace(/-$/, '');
      const nextRand = Math.floor(100 + Math.random() * 900);
      setNewVarSku(`${cleanPrefix}-${nextSize}-${nextRand}`);
      setIsDirty(false);
    } else {
      toast.error("Failed to add variant: " + (result.error || "Unknown error"));
    }
    setIsAddingVariant(false);
  };

  // Bulk Add Standard Size Run (S, M, L, XL, XXL)
  const handleBulkAddStandardSizes = async (sizeRun: string[]) => {
    if (!activeProduct) return;
    setIsBulkAdding(true);
    
    const existingSizes = new Set(activeVariants.map(v => v.size.toUpperCase()));
    const sizesToAdd = sizeRun.filter(s => !existingSizes.has(s.toUpperCase()));

    if (sizesToAdd.length === 0) {
      toast.info("All selected sizes already exist for this product!");
      setIsBulkAdding(false);
      return;
    }

    const prefix = activeProduct.slug.toUpperCase().slice(0, 12).replace(/-$/, '');
    const variantsPayload = sizesToAdd.map(size => ({
      size,
      color: newVarColor.trim() || null,
      sku: `${prefix}-${size}-${Date.now().toString().slice(-3)}`,
      stock_quantity: 10,
      price_override: null,
      compare_at_price: null
    }));

    try {
      const res = await bulkAddVariantsAction(activeProduct.id, variantsPayload);
      if (res.success && res.variants) {
        toast.success(`Generated ${res.variants.length} size variants!`);
        const updated = [...activeVariants, ...res.variants];
        setActiveVariants(updated);
        setProducts(prev => prev.map(p => p.id === activeProduct.id ? { ...p, product_variants: updated } : p));
      } else {
        toast.error("Failed to generate sizes: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      toast.error("Bulk add error: " + (err?.message || "Unknown error"));
    } finally {
      setIsBulkAdding(false);
    }
  };

  // Duplicate Existing Variant
  const duplicateVariant = async (variant: ProductVariant) => {
    if (!activeProduct) return;
    setIsAddingVariant(true);
    const newSku = `${variant.sku}-COPY-${Math.floor(Math.random() * 100)}`;
    const payload = {
      product_id: variant.product_id,
      size: `${variant.size} (Copy)`,
      color: variant.color,
      sku: newSku,
      stock_quantity: variant.stock_quantity,
      price_override: variant.price_override,
      compare_at_price: variant.compare_at_price
    };
    const result = await addVariantAction(payload);
    if (result.success && result.variant) {
      toast.success("Variant duplicated!");
      const updated = [...activeVariants, result.variant];
      setActiveVariants(updated);
      setProducts(prev => prev.map(p => p.id === activeProduct.id ? { ...p, product_variants: updated } : p));
    } else {
      toast.error("Failed to duplicate variant: " + (result.error || "Unknown error"));
    }
    setIsAddingVariant(false);
  };

  // Delete Variant
  const handleDeleteVariant = async (variantId: string, sizeName: string) => {
    if (!confirm(`Delete size ${sizeName}?`)) return;
    const result = await deleteVariantAction(variantId);
    if (result.success) {
      toast.success("Variant removed!");
      const updated = activeVariants.filter(v => v.id !== variantId);
      setActiveVariants(updated);
      setProducts(prev => prev.map(p => p.id === activeProduct?.id ? { ...p, product_variants: updated } : p));
    } else {
      toast.error("Failed to delete variant: " + (result.error || "Unknown error"));
    }
  };

  // Dynamic Category Tabs with counts
  const categoryTabs = useMemo(() => {
    const tabs = [
      { id: 'All', label: 'All Products', count: products.length },
      { id: 'Sale', label: '🔥 On Sale', count: stats.saleCount },
      { id: 'Drops', label: 'Limited Drops 🔥', count: stats.drops },
      { id: 'LowStock', label: 'Low / Out of Stock', count: stats.lowStockCount + stats.outOfStockCount }
    ];

    categories.forEach(c => {
      const catCount = products.filter(p => p.category_id === c.id || p.categories?.name === c.name).length;
      tabs.push({ id: c.name, label: c.name, count: catCount });
    });

    return tabs;
  }, [products, categories, stats]);

  // Filter & Sort Products
  const processedProducts = useMemo(() => {
    let result = products.filter(p => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title?.toLowerCase().includes(q);
        const matchSlug = p.slug?.toLowerCase().includes(q);
        const matchCat = p.categories?.name?.toLowerCase().includes(q);
        const matchSku = p.product_variants?.some((v: any) => v.sku?.toLowerCase().includes(q));
        if (!matchTitle && !matchSlug && !matchCat && !matchSku) return false;
      }

      // Tab filters
      if (activeTab === 'All') return true;
      if (activeTab === 'Sale') {
        return Boolean(p.is_sale || (p.compare_at_price && Number(p.compare_at_price) > Number(p.base_price)));
      }
      if (activeTab === 'Drops') return p.is_drop === true;
      if (activeTab === 'LowStock') {
        const variants = p.product_variants || [];
        if (variants.length === 0) return true;
        const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0);
        return totalStock < 10;
      }

      return p.categories?.name?.toLowerCase() === activeTab.toLowerCase();
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'sale_first') {
        const aSale = Boolean(a.is_sale || (a.compare_at_price && Number(a.compare_at_price) > Number(a.base_price)));
        const bSale = Boolean(b.is_sale || (b.compare_at_price && Number(b.compare_at_price) > Number(b.base_price)));
        if (aSale && !bSale) return -1;
        if (!aSale && bSale) return 1;
        return 0;
      }
      if (sortBy === 'price_asc') {
        return Number(a.base_price || 0) - Number(b.base_price || 0);
      }
      if (sortBy === 'price_desc') {
        return Number(b.base_price || 0) - Number(a.base_price || 0);
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'stock_desc') {
        const stockA = (a.product_variants || []).reduce((s: number, v: any) => s + (v.stock_quantity || 0), 0);
        const stockB = (b.product_variants || []).reduce((s: number, v: any) => s + (v.stock_quantity || 0), 0);
        return stockB - stockA;
      }
      if (sortBy === 'stock_asc') {
        const stockA = (a.product_variants || []).reduce((s: number, v: any) => s + (v.stock_quantity || 0), 0);
        const stockB = (b.product_variants || []).reduce((s: number, v: any) => s + (v.stock_quantity || 0), 0);
        return stockA - stockB;
      }
      return 0;
    });

    return result;
  }, [products, searchQuery, activeTab, sortBy]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* ── 1. HEADER & TOP ACTIONS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--line)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
              Inventory & Catalog Hub
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
            Products & Catalog
          </h1>
          <p className="text-sm text-[var(--text-dim)] max-w-2xl">
            Manage live streetwear drops, set products on flash sale, customize promotional pricing & badges, and track size inventories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={() => setIsBulkSaleModalOpen(true)}
            className="w-full sm:w-auto bg-[#FF1E56]/10 text-[#FF1E56] border border-[#FF1E56]/30 hover:bg-[#FF1E56] hover:text-white font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <BadgePercent className="w-5 h-5" />
            <span>Sale Campaign Manager</span>
          </button>

          <button 
            onClick={openCreateModal}
            className="w-full sm:w-auto bg-[var(--accent)] text-[var(--bg)] font-bold px-6 py-3 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-[var(--accent)]/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <PackagePlus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* ── 2. METRIC KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Products */}
        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--line)] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">Total Products</p>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--text)] mt-1">{stats.total}</p>
            <p className="text-[11px] text-[var(--text-dim)] mt-0.5">Across {categories.length} categories</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[var(--bg-alt)] border border-[var(--line)] flex items-center justify-center text-[var(--text)]">
            <Box className="w-5 h-5" />
          </div>
        </div>

        {/* On Sale Products KPI */}
        <div 
          onClick={() => setActiveTab('Sale')}
          className="p-5 rounded-3xl bg-[#FF1E56]/5 border border-[#FF1E56]/25 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#FF1E56]/60 transition-colors"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#FF1E56]">On Flash Sale</p>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[#FF1E56] mt-1">{stats.saleCount}</p>
            <p className="text-[11px] text-[#FF1E56]/80 mt-0.5">Click to filter active sales</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FF1E56]/15 border border-[#FF1E56]/30 flex items-center justify-center text-[#FF1E56]">
            <BadgePercent className="w-5 h-5" />
          </div>
        </div>

        {/* Limited Drops */}
        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--line)] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">Active Drops</p>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 mt-1">{stats.drops}</p>
            <p className="text-[11px] text-[var(--text-dim)] mt-0.5">Featured in showcase</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Total Stock Units */}
        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--line)] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">Total Inventory</p>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-1">{stats.totalStock}</p>
            <p className="text-[11px] text-[var(--text-dim)] mt-0.5">Units in warehouse</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--line)] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">Stock Alerts</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${stats.outOfStockCount > 0 ? 'text-red-400' : stats.lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stats.outOfStockCount + stats.lowStockCount}
              </span>
              {stats.outOfStockCount > 0 && (
                <span className="text-[11px] font-bold text-red-400">({stats.outOfStockCount} OOS)</span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-dim)] mt-0.5">Need replenishment</p>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${stats.outOfStockCount > 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-[var(--bg-alt)] border-[var(--line)] text-[var(--text-dim)]'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH, TABS & TOOLBAR ── */}
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, /slug, or variant SKU..."
              className="w-full pl-11 pr-10 py-3 bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl text-sm text-[var(--text)] placeholder:text-[var(--text-dim)]/60 outline-none focus:border-[var(--accent)] transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--text-dim)] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & View Mode Controls */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-dim)] mr-2" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-[var(--text)] font-semibold outline-none cursor-pointer pr-2"
              >
                <option value="newest">Newest First</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="stock_desc">Highest Stock</option>
                <option value="stock_asc">Lowest Stock</option>
                <option value="title_asc">Name: A to Z</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-[var(--text)] text-[var(--bg)] shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                title="Table View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[var(--text)] text-[var(--bg)] shadow' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Category Pill Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categoryTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                  isActive 
                    ? 'bg-[var(--text)] text-[var(--bg)] shadow-md scale-[1.02]' 
                    : 'bg-[var(--bg-card)] text-[var(--text-dim)] border border-[var(--line)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${isActive ? 'bg-[var(--bg)]/20 text-[var(--bg)]' : 'bg-[var(--bg-alt)] text-[var(--text-dim)]'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. PRODUCT LISTING: TABLE VIEW ── */}
      {viewMode === 'table' ? (
        <div className="bg-[var(--bg-card)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-alt)]/80 text-[var(--text-dim)] border-b border-[var(--line)]">
                <tr>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider text-[11px] w-[35%]">Product & Info</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider text-[11px] w-[18%]">Price & MRP</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider text-[11px] w-[25%]">Stock & Sizes</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider text-[11px] w-[10%]">Type</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-wider text-[11px] text-right w-[12%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {processedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 px-6 text-center text-[var(--text-dim)]">
                      <div className="max-w-sm mx-auto space-y-3">
                        <Layers className="w-12 h-12 mx-auto text-[var(--text-dim)]/30" />
                        <p className="font-bold text-lg text-[var(--text)]">No products found</p>
                        <p className="text-xs text-[var(--text-dim)]">
                          {searchQuery ? `No matches found for "${searchQuery}". Try another keyword.` : 'Click "+ Add New Product" to populate your catalog.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedProducts.map((p) => {
                    const hasCompare = p.compare_at_price && Number(p.compare_at_price) > Number(p.base_price);
                    const discount = hasCompare 
                      ? Math.round(((Number(p.compare_at_price) - Number(p.base_price)) / Number(p.compare_at_price)) * 100) 
                      : (p.discount_percent || null);
                    const isOnSale = Boolean(p.is_sale || hasCompare);

                    const variants: ProductVariant[] = p.product_variants || [];
                    const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0);
                    const primaryImg = (p.images && p.images[0]) || p.overlay_mask_url || null;
                    const secondaryImg = (p.images && p.images[1]) || null;

                    return (
                      <tr key={p.id} className={`hover:bg-[var(--bg-alt)]/50 transition-colors group ${isOnSale ? 'bg-[#FF1E56]/[0.02]' : ''}`}>
                        
                        {/* 1. Product & Media Thumbnail */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            {/* Dual-image thumbnail with hover flip */}
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-[var(--line)] shrink-0 flex items-center justify-center shadow-inner">
                              {primaryImg ? (
                                <img 
                                  src={primaryImg} 
                                  alt={p.title} 
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${secondaryImg ? 'group-hover:opacity-0' : ''}`} 
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-[var(--text-dim)]/40" />
                              )}
                              {secondaryImg && (
                                <img 
                                  src={secondaryImg} 
                                  alt={`${p.title} Hover`} 
                                  className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                                />
                              )}
                              {p.images && p.images.length > 1 && (
                                <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-[9px] font-mono px-1 rounded text-white/90">
                                  {p.images.length}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-[var(--text)] text-base tracking-tight truncate group-hover:text-[var(--accent)] transition-colors">
                                  {p.title}
                                </div>
                                {isOnSale && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#FF1E56] text-white font-black text-[9px] uppercase tracking-wider shrink-0 shadow-xs">
                                    {p.sale_badge_text || 'SALE'}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <a 
                                  href={`/product/${p.slug}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs font-mono text-[var(--text-dim)] hover:text-white flex items-center gap-1 transition-colors"
                                  title="View live storefront product"
                                >
                                  <span>/{p.slug}</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </a>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-alt)] text-[var(--text-dim)] border border-[var(--line)]">
                                  {p.categories?.name || 'Uncategorized'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Pricing Matrix & Quick Sale Control */}
                        <td className="py-4 px-6">
                          <div className="space-y-1.5">
                            <div className="flex items-baseline gap-2">
                              <span className="font-mono font-extrabold text-base text-[var(--text)]">
                                {formatPrice(p.base_price)}
                              </span>
                              {hasCompare && (
                                <span className="text-xs font-mono text-[var(--text-dim)] line-through opacity-60">
                                  {formatPrice(p.compare_at_price)}
                                </span>
                              )}
                            </div>
                            
                            {/* Quick Sale Toggle Pill */}
                            <div>
                              {isOnSale ? (
                                <button
                                  onClick={(e) => handleQuickToggleSale(p, e)}
                                  disabled={togglingSaleId === p.id}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg bg-[#FF1E56]/15 text-[#FF1E56] border border-[#FF1E56]/30 hover:bg-[#FF1E56] hover:text-white transition-colors cursor-pointer"
                                  title="Click to remove product from Sale"
                                >
                                  {togglingSaleId === p.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Zap className="w-3 h-3 fill-current" />
                                  )}
                                  <span>{p.sale_badge_text || 'SALE'} • {discount ? `${discount}% OFF` : 'ACTIVE'}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => handleQuickToggleSale(p, e)}
                                  disabled={togglingSaleId === p.id}
                                  className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-dim)] hover:text-[#FF1E56] hover:border-[#FF1E56]/40 px-2 py-0.5 rounded-lg bg-[var(--bg-alt)] border border-[var(--line)] transition-colors cursor-pointer"
                                  title="1-Click: Put on 20% Promotional Sale"
                                >
                                  {togglingSaleId === p.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Plus className="w-3 h-3" />
                                  )}
                                  <span>+ Put on Sale</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Stock & Sizes Matrix */}
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            {/* Stock Health Badge */}
                            <div>
                              {variants.length === 0 ? (
                                <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                  <AlertCircle className="w-3.5 h-3.5" /> No Variants Added
                                </span>
                              ) : totalStock === 0 ? (
                                <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Out of Stock (0)
                                </span>
                              ) : totalStock < 10 ? (
                                <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Low Stock ({totalStock} left)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> In Stock ({totalStock} units)
                                </span>
                              )}
                            </div>

                            {/* Aligned Size Chips */}
                            {variants.length > 0 && (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {variants.map((v) => (
                                  <span 
                                    key={v.id} 
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono border font-medium ${
                                      v.stock_quantity === 0 
                                        ? 'border-red-500/30 text-red-400 bg-red-500/5' 
                                        : 'border-[var(--line)] text-[var(--text-dim)] bg-[var(--bg-alt)]'
                                    }`}
                                  >
                                    {v.size}: <strong className={v.stock_quantity === 0 ? 'text-red-400' : 'text-[var(--text)]'}>{v.stock_quantity}</strong>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 4. Drop Type */}
                        <td className="py-4 px-6">
                          {p.is_drop ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--text)] text-[var(--bg)] font-bold text-xs tracking-wider shadow-sm">
                              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> DROP
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--bg-alt)] text-[var(--text-dim)] font-bold text-xs border border-[var(--line)]">
                              STANDARD
                            </span>
                          )}
                        </td>

                        {/* 5. Aligned Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openVariantsModal(p)} 
                              className="bg-neutral-800 border border-neutral-700 text-neutral-100 hover:border-amber-400 hover:text-amber-400 hover:bg-neutral-750 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                              title="Configure sizes and stock levels"
                            >
                              <ListTree className="w-3.5 h-3.5 text-neutral-300" />
                              <span>Sizes ({variants.length})</span>
                            </button>

                            <button 
                              onClick={() => openEditModal(p)} 
                              className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white hover:border-neutral-500 hover:bg-neutral-700 transition-all shadow-sm cursor-pointer"
                              title="Edit Product Details & Sale Status"
                            >
                              <Edit3 className="w-4 h-4 text-neutral-200" />
                            </button>

                            <button 
                              onClick={() => handleDeleteProduct(p.id, p.title)} 
                              disabled={isDeletingProduct === p.id}
                              className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all disabled:opacity-30 shadow-sm cursor-pointer"
                              title="Delete Product"
                            >
                              {isDeletingProduct === p.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-neutral-200" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-neutral-200" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── GRID CARDS VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-[var(--text-dim)] bg-[var(--bg-card)] rounded-3xl border border-[var(--line)]">
              <Layers className="w-12 h-12 mx-auto text-[var(--text-dim)]/30 mb-3" />
              <p className="font-bold text-lg text-[var(--text)]">No products found</p>
              <p className="text-xs text-[var(--text-dim)] mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            processedProducts.map((p) => {
              const hasCompare = p.compare_at_price && Number(p.compare_at_price) > Number(p.base_price);
              const discount = hasCompare 
                ? Math.round(((Number(p.compare_at_price) - Number(p.base_price)) / Number(p.compare_at_price)) * 100) 
                : (p.discount_percent || null);
              const isOnSale = Boolean(p.is_sale || hasCompare);
              const variants: ProductVariant[] = p.product_variants || [];
              const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0);
              const primaryImg = (p.images && p.images[0]) || p.overlay_mask_url || null;
              const secondaryImg = (p.images && p.images[1]) || null;

              return (
                <div key={p.id} className={`bg-[var(--bg-card)] border rounded-3xl overflow-hidden flex flex-col group transition-all shadow-sm ${isOnSale ? 'border-[#FF1E56]/40 hover:border-[#FF1E56]' : 'border-[var(--line)] hover:border-[var(--accent)]/40'}`}>
                  {/* Image Header */}
                  <div className="relative aspect-square w-full bg-black/40 overflow-hidden">
                    {primaryImg ? (
                      <img 
                        src={primaryImg} 
                        alt={p.title} 
                        className={`w-full h-full object-cover transition-all duration-500 ${secondaryImg ? 'group-hover:opacity-0 group-hover:scale-105' : ''}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-[var(--text-dim)]/30" />
                      </div>
                    )}
                    {secondaryImg && (
                      <img 
                        src={secondaryImg} 
                        alt={`${p.title} Hover`} 
                        className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    )}
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {isOnSale && (
                        <span className="px-3 py-1 rounded-full bg-[#FF1E56] text-white font-black text-xs flex items-center gap-1 shadow-lg shadow-[#FF1E56]/30">
                          <Zap className="w-3.5 h-3.5 fill-white" /> {p.sale_badge_text || 'SALE'}
                        </span>
                      )}
                      {p.is_drop && (
                        <span className="px-3 py-1 rounded-full bg-[var(--text)] text-[var(--bg)] font-bold text-xs flex items-center gap-1 shadow-md">
                          <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> DROP
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                        {p.categories?.name || 'Uncategorized'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono text-white/90">
                        {totalStock} in stock
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-[var(--text)] tracking-tight line-clamp-1">{p.title}</h3>
                      <p className="text-xs font-mono text-[var(--text-dim)] mt-0.5">/{p.slug}</p>
                      
                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-lg font-mono font-bold text-[var(--accent)]">{formatPrice(p.base_price)}</span>
                        {hasCompare && (
                          <span className="text-xs font-mono text-[var(--text-dim)] line-through opacity-60">
                            {formatPrice(p.compare_at_price)}
                          </span>
                        )}
                        {discount !== null && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FF1E56]/15 text-[#FF1E56] border border-[#FF1E56]/30">
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      {/* Sizes */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {variants.map(v => (
                          <span key={v.id} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text-dim)]">
                            {v.size}: {v.stock_quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
                      <button 
                        onClick={() => openVariantsModal(p)}
                        className="flex-1 bg-neutral-800 border border-neutral-700 text-neutral-100 hover:border-amber-400 hover:text-amber-400 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <ListTree className="w-3.5 h-3.5 text-neutral-300" /> Sizes ({variants.length})
                      </button>

                      {/* Quick 1-click Sale button */}
                      <button
                        onClick={(e) => handleQuickToggleSale(p, e)}
                        disabled={togglingSaleId === p.id}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${isOnSale ? 'bg-[#FF1E56]/15 border-[#FF1E56]/40 text-[#FF1E56] hover:bg-[#FF1E56] hover:text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-[#FF1E56] hover:border-[#FF1E56]/40'}`}
                        title={isOnSale ? 'Remove from Sale' : '1-Click: Put on Sale'}
                      >
                        {togglingSaleId === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#FF1E56]" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </button>

                      <button 
                        onClick={() => openEditModal(p)}
                        className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white hover:border-neutral-500 hover:bg-neutral-700 transition-all shadow-sm cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4 text-neutral-200" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id, p.title)}
                        className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all shadow-sm cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4 text-neutral-200" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── 5. CREATE / EDIT PRODUCT MODAL ── */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[var(--bg-card)] rounded-[32px] w-full max-w-3xl shadow-2xl border border-[var(--line)] my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-[var(--line)] flex items-center justify-between bg-[var(--bg-alt)]/40 shrink-0">
              <div>
                <h2 className="font-display text-2xl font-bold text-[var(--text)]">
                  {isEditModalOpen ? 'Edit Product Details' : 'Add New Streetwear Product'}
                </h2>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  Configure title, auto-slug, pricing with discount badges, categories, and multi-angle product photography.
                </p>
              </div>
              <button 
                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                className="p-2.5 bg-[var(--bg-alt)] text-[var(--text-dim)] hover:text-[var(--text)] rounded-full border border-[var(--line)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={(e) => handleSaveProduct(e, isEditModalOpen)} className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              
              {/* Basic Information Group */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> General Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1.5">
                      Product Title <span className="text-[var(--accent)]">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={e => {
                        const newTitle = e.target.value;
                        setTitle(newTitle);
                        if (!isEditModalOpen) {
                          setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                        }
                      }} 
                      required 
                      placeholder="e.g. Acid Wash Heavyweight Tee"
                      className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-2xl p-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1.5">
                      URL Slug <span className="text-[var(--accent)]">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={slug} 
                      onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                      required 
                      placeholder="acid-wash-heavyweight-tee"
                      className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-2xl p-3.5 text-sm text-[var(--text)] font-mono outline-none focus:border-[var(--accent)] transition-colors" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1.5">
                      Category Assignment
                    </label>
                    <select 
                      value={categoryId} 
                      onChange={e => setCategoryId(e.target.value)} 
                      className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-2xl p-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
                    >
                      <option value="">Select a Category (or Uncategorized)</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Flash Sale Engine Group */}
              <div className="space-y-4 pt-2 border-t border-[var(--line)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
                    <span>₹</span> Pricing & Flash Sale Engine
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="modalIsSale"
                      checked={isSale}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsSale(checked);
                        if (checked && (!compareAtPrice || Number(compareAtPrice) <= Number(basePrice))) {
                          const base = Number(basePrice || 1999);
                          const defaultComp = Math.round(base / 0.8);
                          setCompareAtPrice(defaultComp);
                          setDiscountPercent(20);
                        }
                      }}
                      className="w-4 h-4 accent-[#FF1E56] rounded cursor-pointer"
                    />
                    <label htmlFor="modalIsSale" className="text-xs font-bold text-[#FF1E56] flex items-center gap-1 cursor-pointer">
                      <Zap className="w-3.5 h-3.5 fill-[#FF1E56]" /> Set on Promotional Sale
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1.5">
                      Selling Price (₹) <span className="text-[var(--accent)]">*</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={basePrice} 
                      onChange={e => {
                        const val = e.target.value;
                        setBasePrice(val);
                        if (compareAtPrice && Number(compareAtPrice) > Number(val) && Number(val) > 0) {
                          setDiscountPercent(Math.round(((Number(compareAtPrice) - Number(val)) / Number(compareAtPrice)) * 100));
                        }
                      }} 
                      required 
                      placeholder="1999"
                      className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-2xl p-3.5 text-base font-bold font-mono text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors" 
                    />
                    <p className="text-[11px] text-[var(--text-dim)] mt-1">Customer purchase price</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1.5">
                      Original MRP (₹ Crossed)
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={compareAtPrice} 
                      onChange={e => {
                        const val = e.target.value;
                        setCompareAtPrice(val);
                        if (val && Number(val) > Number(basePrice) && Number(basePrice) > 0) {
                          const pct = Math.round(((Number(val) - Number(basePrice)) / Number(val)) * 100);
                          setDiscountPercent(pct);
                          setIsSale(true);
                        } else if (!val) {
                          setDiscountPercent('');
                        }
                      }} 
                      placeholder="Optional (e.g. 2999)"
                      className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-2xl p-3.5 text-base font-mono text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors" 
                    />
                    <div className="mt-1">
                      {compareAtPrice && Number(compareAtPrice) > Number(basePrice) ? (
                        <span className="text-[#FF1E56] font-bold text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Discount: {Math.round(((Number(compareAtPrice) - Number(basePrice)) / Number(compareAtPrice)) * 100)}% OFF
                        </span>
                      ) : (
                        <p className="text-[11px] text-[var(--text-dim)]">Optional strikethrough price</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Promotional Sale Customization Options (Visible when Sale is Active) */}
                {isSale && (
                  <div className="bg-[#FF1E56]/5 border border-[#FF1E56]/20 p-4 rounded-2xl space-y-3.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#FF1E56] flex items-center gap-1.5">
                        <Flame className="w-4 h-4 fill-[#FF1E56]" /> Sale Badge & Preset Config
                      </span>
                      <span className="text-[11px] font-mono text-[#FF1E56]/80 font-bold">
                        {discountPercent ? `${discountPercent}% Discount Active` : 'Custom Sale'}
                      </span>
                    </div>

                    {/* Badge Text Presets & Custom Input */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                        Badge Text Label
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {['SALE', 'HOT SALE', 'LIMITED SALE', 'DROP SALE', '25% OFF', 'CLEARANCE'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setSaleBadgeText(preset)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                              saleBadgeText === preset
                                ? 'bg-[#FF1E56] text-white shadow-xs'
                                : 'bg-[var(--bg-card)] text-[var(--text-dim)] border border-[var(--line)] hover:text-white'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={saleBadgeText}
                        onChange={(e) => setSaleBadgeText(e.target.value.toUpperCase())}
                        placeholder="Custom badge label (e.g. MEGA SALE)"
                        className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-xs font-bold text-[var(--text)] outline-none focus:border-[#FF1E56]"
                      />
                    </div>

                    {/* Quick Discount Calculator Buttons */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                        Quick Discount Presets
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              setDiscountPercent(pct);
                              const base = Number(basePrice || 1999);
                              const calcComp = Math.round(base / (1 - (pct / 100)));
                              setCompareAtPrice(calcComp);
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                              Number(discountPercent) === pct
                                ? 'bg-[var(--accent)] text-[var(--bg)] shadow-xs'
                                : 'bg-[var(--bg-card)] text-[var(--text-dim)] border border-[var(--line)] hover:text-white'
                            }`}
                          >
                            {pct}% OFF
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Storefront Badge Preview */}
                    <div className="p-3 bg-black/50 border border-neutral-800 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-[var(--text-dim)] font-medium">Storefront Badge Preview:</span>
                      <span className="px-3 py-1 rounded-full bg-[#FF1E56] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-[#FF1E56]/40">
                        <Zap className="w-3.5 h-3.5 fill-white" /> {saleBadgeText || 'SALE'} {discountPercent ? `• ${discountPercent}% OFF` : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">
                  Product Description & Fabric Details
                </label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={3} 
                  placeholder="Heavyweight cotton, oversized dropped shoulders, acid wash distressed finish..."
                  className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-2xl p-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors" 
                />
              </div>

              {/* SEO Metadata Config */}
              <div className="space-y-4 pt-4 border-t border-[var(--line)] bg-neutral-900/20 p-5 rounded-2xl border border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> SEO Search Metadata (Google Recommendation)
                </h3>
                <p className="text-[11px] text-[var(--text-dim)] font-mono leading-normal">
                  Customize search engine tags for this product. Google uses these tags to recommend this product in search queries.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold font-bold">SEO Meta Title</label>
                    <input 
                      type="text" 
                      value={metaTitle} 
                      onChange={e => setMetaTitle(e.target.value)} 
                      placeholder="e.g. Inkwave Fathom Overshirt | Premium Distressed Cotton"
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold font-bold">SEO Meta Keywords</label>
                    <input 
                      type="text" 
                      value={metaKeywords} 
                      onChange={e => setMetaKeywords(e.target.value)} 
                      placeholder="e.g. overshirt, distressed shirt, streetwear jacket, mens casual shirt"
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-1.5 font-bold font-bold">SEO Meta Description</label>
                  <textarea 
                    value={metaDescription} 
                    onChange={e => setMetaDescription(e.target.value)} 
                    rows={2}
                    placeholder="e.g. Shop the Fathom Overshirt at Inkwave. Premium heavyweight 380GSM cotton with distressed vats-dyed texture."
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]" 
                  />
                </div>
              </div>
              
              {/* Product Images & Hover Sequence */}
              <div className="space-y-4 pt-2 border-t border-[var(--line)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5" /> Product Photography & Hover Sequencing
                    </h3>
                    <p className="text-xs text-[var(--text-dim)] mt-0.5">Slot #1 is default front view. Slot #2 displays on hover.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setImages([...images, ''])}
                    className="text-xs font-bold bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] px-3 py-1.5 rounded-xl hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Slot
                  </button>
                </div>

                {images.length === 0 ? (
                  <div className="border border-dashed border-[var(--line)] rounded-3xl p-8 text-center space-y-3 bg-[var(--bg-alt)]/30">
                    <ImageIcon className="w-10 h-10 text-[var(--text-dim)]/40 mx-auto" />
                    <p className="text-xs text-[var(--text-dim)]">No product images attached yet. Add at least 2 images for the hover effect.</p>
                    <div className="max-w-xs mx-auto">
                      <MediaUploader 
                        onUploadSuccess={(url) => {
                          setImages([url]);
                          setOverlayMaskUrl(url);
                        }} 
                        label="Upload Primary Photo" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {images.map((img, idx) => {
                      const isPrimary = idx === 0;
                      const isSecondary = idx === 1;
                      return (
                        <div 
                          key={idx} 
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isPrimary 
                              ? 'bg-[var(--accent)]/5 border-[var(--accent)]/40 shadow-xs' 
                              : isSecondary 
                              ? 'bg-purple-500/5 border-purple-500/30' 
                              : 'bg-[var(--bg-alt)] border-[var(--line)]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md ${
                              isPrimary 
                                ? 'bg-[var(--accent)] text-[var(--bg)]' 
                                : isSecondary 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-[var(--line)] text-[var(--text-dim)]'
                            }`}>
                              {isPrimary ? 'Slot #1 • Primary (Front View)' : isSecondary ? 'Slot #2 • Secondary (Hover Flip)' : `Slot #${idx + 1} • Gallery`}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveImage(idx, idx - 1)}
                                className="p-1 text-[var(--text-dim)] hover:text-white disabled:opacity-20 rounded"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === images.length - 1}
                                onClick={() => handleMoveImage(idx, idx + 1)}
                                className="p-1 text-[var(--text-dim)] hover:text-white disabled:opacity-20 rounded"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveImageSlot(idx)}
                                className="p-1 text-[var(--text-dim)] hover:text-red-400 rounded"
                                title="Remove Slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={img}
                              onChange={(e) => handleUpdateImageSlot(idx, e.target.value)}
                              placeholder={`Image URL for slot #${idx + 1}...`}
                              className="flex-1 bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-xs text-[var(--text)] font-mono outline-none focus:border-[var(--accent)]"
                            />
                            <div className="w-28 shrink-0">
                              <MediaUploader
                                onUploadSuccess={(url) => handleUpdateImageSlot(idx, url)}
                                label={img ? "Replace" : "Upload"}
                              />
                            </div>
                          </div>

                          {img && (
                            <div className="mt-2 relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--line)] bg-black/40">
                              <img src={img} alt={`Slot ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Limited Drop Highlight */}
              <div className="flex items-center gap-3.5 bg-[var(--bg-alt)] p-4 rounded-2xl border border-[var(--line)]">
                <input 
                  type="checkbox" 
                  id="isDrop" 
                  checked={isDrop} 
                  onChange={e => setIsDrop(e.target.checked)} 
                  className="w-5 h-5 accent-[var(--accent)] rounded cursor-pointer" 
                />
                <div>
                  <label htmlFor="isDrop" className="font-bold text-sm text-[var(--text)] cursor-pointer flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400" /> Feature as Limited Drop
                  </label>
                  <p className="text-xs text-[var(--text-dim)]">Shows glowing DROP badge and highlights in storefront drop filters.</p>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex gap-3 pt-4 border-t border-[var(--line)]">
                <button 
                  type="button" 
                  onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                  className="flex-1 bg-[var(--bg-alt)] text-[var(--text)] border border-[var(--line)] font-bold py-3.5 rounded-2xl hover:bg-[var(--line)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 bg-[var(--accent)] text-[var(--bg)] font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : isEditModalOpen ? 'Update Product' : 'Create & Configure Sizes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. VARIANTS & INVENTORY MATRIX STUDIO MODAL ── */}
      {isVariantsModalOpen && activeProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[var(--bg-card)] rounded-[32px] w-full max-w-4xl shadow-2xl border border-[var(--line)] my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-[var(--line)] bg-[var(--bg-alt)]/40 flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                    Sizes & Inventory Matrix
                  </span>
                  {isLoadingVariants && <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />}
                </div>
                <h2 className="font-display text-2xl font-bold text-[var(--text)]">
                  {activeProduct.title}
                </h2>
                <p className="text-xs text-[var(--text-dim)] font-mono">
                  Base Price: <strong className="text-[var(--text)]">{formatPrice(activeProduct.base_price)}</strong> • SKU Prefix: <strong className="text-[var(--text)]">{activeProduct.slug.toUpperCase().slice(0, 8)}</strong>
                </p>
              </div>

              <button 
                onClick={() => setIsVariantsModalOpen(false)}
                className="p-2.5 bg-[var(--bg-alt)] text-[var(--text-dim)] hover:text-[var(--text)] rounded-full border border-[var(--line)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              
              {/* Quick Presets Bar */}
              <div className="bg-[var(--bg-alt)] p-4 rounded-2xl border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" /> Quick Size Run Generator
                  </p>
                  <p className="text-[11px] text-[var(--text-dim)]">Instantly generate standard size runs with auto-SKU and stock.</p>
                </div>

                {(() => {
                  const catName = categories.find(c => c.id === activeProduct?.category_id)?.name || (activeProduct as any)?.categories?.name || '';
                  const isJeans = Boolean(
                    catName.toLowerCase().includes('jean') ||
                    activeProduct?.slug?.toLowerCase().includes('jean') ||
                    activeProduct?.slug?.toLowerCase().includes('denim') ||
                    activeProduct?.title?.toLowerCase().includes('jean') ||
                    activeProduct?.title?.toLowerCase().includes('denim')
                  );

                  return (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleBulkAddStandardSizes(['26', '28', '30', '32', '34', '36'])}
                        disabled={isBulkAdding}
                        className={`${
                          isJeans 
                            ? 'bg-[var(--accent)] text-[var(--bg)] shadow-md shadow-[var(--accent)]/20' 
                            : 'bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--accent)] border border-[var(--line)]'
                        } font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer`}
                      >
                        {isBulkAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Jeans (28 to 36)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBulkAddStandardSizes(['26', '28', '30', '32', '34', '36', '38', '40'])}
                        disabled={isBulkAdding}
                        className="bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--accent)] border border-[var(--line)] font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                      >
                        Extended (28-40)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBulkAddStandardSizes(['S', 'M', 'L', 'XL', 'XXL'])}
                        disabled={isBulkAdding}
                        className={`${
                          !isJeans 
                            ? 'bg-[var(--accent)] text-[var(--bg)] shadow-md shadow-[var(--accent)]/20' 
                            : 'bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--accent)] border border-[var(--line)]'
                        } font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer`}
                      >
                        {isBulkAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Standard (S to XXL)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBulkAddStandardSizes(['2XL', '3XL', '4XL'])}
                        disabled={isBulkAdding}
                        className="bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--accent)] border border-[var(--line)] font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                      >
                        Plus (2XL-4XL)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBulkAddStandardSizes(['FREE SIZE'])}
                        disabled={isBulkAdding}
                        className="bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--accent)] border border-[var(--line)] font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                      >
                        Free Size
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Existing Variants Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">
                    Active Size Variants ({activeVariants.length})
                  </h3>
                  <span className="text-xs font-mono font-bold text-[var(--accent)]">
                    Total Warehouse Stock: {activeVariants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)} units
                  </span>
                </div>

                {activeVariants.length === 0 ? (
                  <div className="p-8 text-center bg-[var(--bg-alt)] rounded-3xl text-[var(--text-dim)] border border-[var(--line)] space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-400" />
                    <p className="font-bold text-sm text-[var(--text)]">No size variants exist for this product</p>
                    <p className="text-xs">Use the quick generator above or add a specific size below.</p>
                  </div>
                ) : (
                  <div className="border border-[var(--line)] rounded-2xl overflow-hidden bg-[var(--bg-alt)]/30">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-alt)] text-[var(--text-dim)] border-b border-[var(--line)] font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-4 w-[15%]">Size & Color</th>
                          <th className="py-3 px-4 w-[25%]">SKU</th>
                          <th className="py-3 px-4 w-[18%]">Stock Units</th>
                          <th className="py-3 px-4 w-[20%]">Price Override (₹)</th>
                          <th className="py-3 px-4 w-[12%] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)]">
                        {activeVariants.map((variant) => (
                          <tr key={variant.id} className="hover:bg-[var(--bg-alt)]/50 transition-colors">
                            
                            {/* Size & Color */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-base text-[var(--text)] font-mono">{variant.size}</span>
                                {variant.color && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--line)] text-[var(--text-dim)]">
                                    {variant.color}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* SKU */}
                            <td className="py-3 px-4">
                              <input 
                                type="text"
                                defaultValue={variant.sku}
                                onBlur={(e) => handleVariantUpdate(variant.id, 'sku', e.target.value.toUpperCase())}
                                className="w-full bg-[var(--bg-card)] border border-[var(--line)] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                              />
                            </td>

                            {/* Stock */}
                            <td className="py-3 px-4">
                              <input 
                                type="number"
                                defaultValue={variant.stock_quantity ?? 0}
                                onBlur={(e) => handleVariantUpdate(variant.id, 'stock_quantity', parseInt(e.target.value) || 0)}
                                className="w-24 bg-[var(--bg-card)] border border-[var(--line)] rounded-xl px-2.5 py-1.5 font-mono text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--accent)] text-center"
                              />
                            </td>

                            {/* Price Override */}
                            <td className="py-3 px-4">
                              <input 
                                type="number"
                                step="0.01"
                                placeholder={`Base (${activeProduct.base_price})`}
                                defaultValue={variant.price_override ?? ''}
                                onBlur={(e) => handleVariantUpdate(variant.id, 'price_override', e.target.value === '' ? null : parseFloat(e.target.value))}
                                className="w-28 bg-[var(--bg-card)] border border-[var(--line)] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                              />
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => duplicateVariant(variant)}
                                  className="p-1.5 bg-[var(--bg-card)] border border-[var(--line)] rounded-lg text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                                  title="Duplicate Size"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVariant(variant.id, variant.size)}
                                  className="p-1.5 bg-[var(--bg-card)] border border-[var(--line)] rounded-lg text-[var(--text-dim)] hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                                  title="Delete Size"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add Single Variant Form */}
              <div className="bg-[var(--bg-alt)]/40 p-5 rounded-3xl border border-[var(--line)] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Custom Variant
                </h4>

                {/* Size Chips Grouped by Waist (Jeans/Denim) and Apparel */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-wider mr-1">Waist / Jeans:</span>
                    {['28', '30', '32', '34', '36', '38', '40'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setNewVarSize(sz);
                          const cleanPrefix = activeProduct.slug.toUpperCase().slice(0, 12).replace(/-$/, '');
                          const rand = Math.floor(100 + Math.random() * 900);
                          setNewVarSku(`${cleanPrefix}-${sz}-${rand}`);
                          setIsDirty(true);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                          newVarSize === sz 
                            ? 'bg-[var(--accent)] text-[var(--bg)] shadow-sm' 
                            : 'bg-[var(--bg-card)] text-[var(--text)] border border-[var(--line)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider mr-1">Apparel / Tops:</span>
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'FREE'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setNewVarSize(sz);
                          const cleanPrefix = activeProduct.slug.toUpperCase().slice(0, 12).replace(/-$/, '');
                          const rand = Math.floor(100 + Math.random() * 900);
                          setNewVarSku(`${cleanPrefix}-${sz}-${rand}`);
                          setIsDirty(true);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                          newVarSize === sz 
                            ? 'bg-[var(--accent)] text-[var(--bg)] shadow-sm' 
                            : 'bg-[var(--bg-card)] text-[var(--text-dim)] border border-[var(--line)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddVariant} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1">Size *</label>
                    <input 
                      type="text" 
                      value={newVarSize} 
                      onChange={e => { setNewVarSize(e.target.value); setIsDirty(true); }} 
                      required 
                      placeholder="e.g. M" 
                      className="w-full bg-[var(--bg-card)] border border-[var(--line)] rounded-xl p-2.5 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--accent)]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1">Colorway</label>
                    <input 
                      type="text" 
                      value={newVarColor} 
                      onChange={e => { setNewVarColor(e.target.value); setIsDirty(true); }} 
                      placeholder="e.g. Onyx Black" 
                      className="w-full bg-[var(--bg-card)] border border-[var(--line)] rounded-xl p-2.5 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1">SKU *</label>
                    <input 
                      type="text" 
                      value={newVarSku} 
                      onChange={e => { setNewVarSku(e.target.value); setIsDirty(true); }} 
                      required 
                      placeholder="SKU-100" 
                      className="w-full bg-[var(--bg-card)] border border-[var(--line)] rounded-xl p-2.5 text-xs font-mono text-[var(--text)] outline-none focus:border-[var(--accent)]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] mb-1">Stock Units *</label>
                    <input 
                      type="number" 
                      value={newVarStock === null || isNaN(Number(newVarStock)) ? '' : newVarStock} 
                      onChange={e => { setNewVarStock(e.target.value); setIsDirty(true); }} 
                      required 
                      className="w-full bg-[var(--bg-card)] border border-[var(--line)] rounded-xl p-2.5 text-sm font-mono font-bold text-[var(--text)] outline-none focus:border-[var(--accent)] text-center" 
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <button 
                      type="submit" 
                      disabled={isAddingVariant} 
                      className="w-full bg-[var(--accent)] text-[var(--bg)] font-bold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md shadow-[var(--accent)]/20 text-xs cursor-pointer"
                    >
                      {isAddingVariant ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add Size
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-[var(--line)] bg-[var(--bg-alt)]/40 shrink-0">
              <button 
                onClick={async () => {
                  if (isDirty && newVarSize.trim() && newVarSku.trim() && !isAddingVariant && activeProduct) {
                    const parsedVarComparePrice = newVarComparePrice ? (typeof newVarComparePrice === 'string' ? parseFloat(newVarComparePrice) || null : newVarComparePrice) : null;
                    const payload = {
                      product_id: activeProduct.id,
                      size: newVarSize.trim().toUpperCase(),
                      color: newVarColor.trim() || null,
                      sku: newVarSku.trim().toUpperCase(),
                      stock_quantity: typeof newVarStock === 'string' ? parseInt(newVarStock) || 0 : newVarStock,
                      price_override: newVarPrice ? (typeof newVarPrice === 'string' ? parseFloat(newVarPrice) || null : newVarPrice) : null,
                      compare_at_price: parsedVarComparePrice
                    };
                    const result = await addVariantAction(payload);
                    if (result.success && result.variant) {
                      toast.success(`Size ${payload.size} variant saved!`);
                      const updated = [...activeVariants, result.variant];
                      setActiveVariants(updated);
                      setProducts(prev => prev.map(p => p.id === activeProduct.id ? { ...p, product_variants: updated } : p));
                    } else if (!result.success) {
                      toast.error("Failed to auto-save variant: " + result.error);
                      return; // Don't close if database save errors
                    }
                  }
                  setIsVariantsModalOpen(false);
                }}
                className="w-full bg-[var(--text)] text-[var(--bg)] font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
              >
                Done Managing Variants
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. BULK SALE CAMPAIGN MANAGER MODAL ── */}
      {isBulkSaleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[var(--bg-card)] rounded-[32px] w-full max-w-xl shadow-2xl border border-[var(--line)] my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-[var(--line)] flex items-center justify-between bg-[var(--bg-alt)]/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF1E56]/15 border border-[#FF1E56]/30 flex items-center justify-center text-[#FF1E56]">
                  <BadgePercent className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                    Sale Campaign Manager
                  </h2>
                  <p className="text-xs text-[var(--text-dim)] mt-0.5">
                    Launch store-wide or category flash sales in seconds.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsBulkSaleModalOpen(false)}
                className="p-2.5 bg-[var(--bg-alt)] text-[var(--text-dim)] hover:text-[var(--text)] rounded-full border border-[var(--line)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 space-y-6 flex-1">
              
              {/* Scope Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">
                  Target Product Scope
                </label>
                <select
                  value={bulkSaleCategory}
                  onChange={(e) => setBulkSaleCategory(e.target.value)}
                  className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-2xl p-3.5 text-sm font-bold text-[var(--text)] outline-none focus:border-[#FF1E56] transition-colors cursor-pointer"
                >
                  <option value="all">🌟 Entire Catalog (All {products.length} Products)</option>
                  {categories.map((c) => {
                    const count = products.filter(p => p.category_id === c.id || p.categories?.name === c.name).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({count} products)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Discount Percentage Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">
                    Promotional Discount %
                  </label>
                  <span className="text-sm font-mono font-bold text-[#FF1E56]">{bulkDiscountPercent}% OFF</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setBulkDiscountPercent(pct)}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        Number(bulkDiscountPercent) === pct
                          ? 'bg-[#FF1E56] text-white shadow-md shadow-[#FF1E56]/30'
                          : 'bg-[var(--bg-alt)] text-[var(--text-dim)] border border-[var(--line)] hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={bulkDiscountPercent}
                  onChange={(e) => setBulkDiscountPercent(Number(e.target.value))}
                  placeholder="Custom discount percentage..."
                  className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-sm font-mono text-[var(--text)] outline-none focus:border-[#FF1E56]"
                />
              </div>

              {/* Badge Text Preset */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">
                  Storefront Badge Text
                </label>
                <div className="flex flex-wrap gap-2">
                  {['SALE', 'HOT SALE', 'FLASH SALE', 'MEGA DROP', 'CLEARANCE'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBulkSaleBadgeText(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        bulkSaleBadgeText === preset
                          ? 'bg-[var(--accent)] text-[var(--bg)] shadow-xs'
                          : 'bg-[var(--bg-alt)] text-[var(--text-dim)] border border-[var(--line)] hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={bulkSaleBadgeText}
                  onChange={(e) => setBulkSaleBadgeText(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH SALE"
                  className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl p-3 text-xs font-bold text-[var(--text)] outline-none focus:border-[#FF1E56]"
                />
              </div>

              {/* Live Preview Card */}
              <div className="bg-black/50 border border-neutral-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-dim)]">
                  <span>Campaign Impact:</span>
                  <span className="font-mono text-white font-bold">
                    {bulkSaleCategory === 'all' 
                      ? `${products.length} Products` 
                      : `${products.filter(p => p.category_id === bulkSaleCategory).length} Products in ${categories.find(c => c.id === bulkSaleCategory)?.name || 'Category'}`}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                  <span className="text-xs text-[var(--text-dim)]">Badge Appearance:</span>
                  <span className="px-3 py-1 rounded-full bg-[#FF1E56] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-[#FF1E56]/40">
                    <Zap className="w-3.5 h-3.5 fill-white" /> {bulkSaleBadgeText || 'SALE'} • {bulkDiscountPercent}% OFF
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleApplyBulkSale(false)}
                  disabled={isApplyingBulkSale}
                  className="flex-1 bg-[var(--bg-alt)] text-red-400 border border-red-500/30 hover:bg-red-500/10 font-bold py-3.5 px-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {isApplyingBulkSale ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Turn OFF Sale for Selected
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyBulkSale(true)}
                  disabled={isApplyingBulkSale}
                  className="flex-1 bg-[#FF1E56] text-white font-bold py-3.5 px-4 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[#FF1E56]/30 text-xs cursor-pointer"
                >
                  {isApplyingBulkSale ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                  Launch Sale Campaign
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
