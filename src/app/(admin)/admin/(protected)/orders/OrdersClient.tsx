'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, RefreshCw, X, Download, Eye, Loader2, Printer, Receipt, Send, CheckCircle2, ArrowUpRight, FileText, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { updateOrderStatusAction, fetchAdminOrdersAndBillsAction, getAdminOrderItemsAction } from '@/app/actions/admin';
import { generateAndSendBill } from '@/app/actions/billing';
import Link from 'next/link';
import { generateTextDecal } from '@/lib/customPrintHelpers';

const ORDER_STATUSES = ['ORDER_PLACED', 'IN_FULFILLMENT', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED'];

const STATUS_STYLES: Record<string, string> = {
  ORDER_PLACED: 'bg-blue-900/35 text-blue-300 border border-blue-500/20',
  IN_FULFILLMENT: 'bg-amber-900/35 text-amber-300 border border-amber-500/20',
  SHIPPED: 'bg-indigo-900/35 text-indigo-300 border border-indigo-500/20',
  OUT_FOR_DELIVERY: 'bg-purple-900/35 text-purple-300 border border-purple-500/20',
  DELIVERED: 'bg-green-900/35 text-green-300 border border-green-500/20',
  RETURNED: 'bg-red-900/35 text-red-300 border border-red-500/20',
  CANCELLED: 'bg-gray-800 text-gray-400 border border-gray-700',
};

// Map color names to hex codes for the 3D Preview
const COLOR_HEX_MAP: Record<string, string> = {
  'Pure White': '#ffffff',
  'Ink Black': '#111111',
  'Crimson Red': '#b31a1a',
  'Light Pink': '#ffc0cb',
  'Light Green': '#90ee90'
};

// Dynamic import for R3F CustomPrintCanvas to prevent SSR/Reconciler crashes in admin
const CustomPrintCanvas = dynamic(
  () => import('@/components/storefront/CustomPrintCanvas'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center text-[var(--text-dim)] font-mono text-[10px] uppercase tracking-widest gap-2 bg-black/20">
        <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Loading 3D Preview...
      </div>
    )
  }
);

function CustomPrintOrderPreview({ 
  print, 
  orderId, 
  idx, 
  downloadOriginalDesign 
}: { 
  print: any; 
  orderId: string; 
  idx: number; 
  downloadOriginalDesign: (base64Data: string, filename: string) => void;
}) {
  const [typoTexture, setTypoTexture] = useState<string | null>(null);
  const [loadingTypo, setLoadingTypo] = useState(false);
  const [adminView, setAdminView] = useState<'front' | 'back' | 'angle-left'>('front');

  useEffect(() => {
    const typoSpec = print.metadata?.typography;
    if (!typoSpec || !typoSpec.text) {
      setTypoTexture(null);
      return;
    }

    setLoadingTypo(true);
    generateTextDecal({
      text: typoSpec.text,
      fontFamily: typoSpec.font,
      fontSize: typoSpec.fontSize || 72,
      color: typoSpec.textColor || '#FFFFFF',
      letterSpacing: typoSpec.letterSpacing || 4,
      isCurved: typoSpec.isCurved || false,
      isOutline: typoSpec.isOutline || false,
      subtext: typoSpec.subtext
    }).then((dataUrl) => {
      setTypoTexture(dataUrl);
      setLoadingTypo(false);
    }).catch(err => {
      console.error('Error generating typography texture:', err);
      setLoadingTypo(false);
    });
  }, [print.metadata?.typography]);

  const colorName = print.metadata?.color || print.color || 'Pure White';
  const presetHex = print.metadata?.colorHex || print.metadata?.color_hex || COLOR_HEX_MAP[colorName] || '#ffffff';
  
  const layers = print.metadata?.graphics || print.metadata?.graphic_layers || [];
  const typography = print.metadata?.typography || null;
  const neckLabel = print.metadata?.customLabel || print.metadata?.custom_label || 'N/A';
  const fabricWash = print.metadata?.fabricWash || 'solid';

  // Support backward compatibility for legacy simple print formats
  const hasLayersOrTypo = layers.length > 0 || !!typography;
  const legacyImageUrl = !hasLayersOrTypo ? (print.metadata?.uploaded_design || print.uploaded_design) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-black/30 border border-[var(--line)] p-5 rounded-2xl">
      
      {/* 1. 3D Position Preview Block with View Angle Switcher */}
      <div className="border border-[var(--line)] overflow-hidden aspect-square bg-[var(--bg-card)] rounded-xl relative flex items-center justify-center">
        {loadingTypo ? (
          <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center text-[var(--text-dim)] font-mono text-[10px] uppercase tracking-widest gap-2 bg-black/20">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Loading Typography...
          </div>
        ) : (
          <CustomPrintCanvas 
            colorHex={presetHex}
            fabricWash={fabricWash}
            graphics={layers}
            typographyTexture={typoTexture}
            typographyOptions={typography ? {
              x: typography.x || 0,
              y: typography.y || 25,
              scale: typography.scale || 42,
              rotate: typography.rotate || 0
            } : undefined}
            activeView={adminView}
            // Backward compatibility properties
            textureUrl={legacyImageUrl}
            scaleValue={print.metadata?.scale || 40}
            rotateValue={print.metadata?.rotate || 0}
            xPosition={print.metadata?.left || 0}
            yPosition={print.metadata?.top || 38}
            printSide={print.metadata?.side || 'front'}
          />
        )}

        {/* View Switcher Controls */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-black/85 backdrop-blur-md border border-white/15 p-1 rounded-xl shadow-lg">
          <button
            onClick={() => setAdminView('front')}
            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${adminView === 'front' ? 'bg-[var(--accent)] text-black font-bold' : 'text-white/70 hover:text-white'}`}
          >
            Front
          </button>
          <button
            onClick={() => setAdminView('back')}
            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${adminView === 'back' ? 'bg-[var(--accent)] text-black font-bold' : 'text-white/70 hover:text-white'}`}
          >
            Back
          </button>
          <button
            onClick={() => setAdminView('angle-left')}
            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${adminView === 'angle-left' ? 'bg-[var(--accent)] text-black font-bold' : 'text-white/70 hover:text-white'}`}
          >
            3/4
          </button>
        </div>

        <div className="absolute bottom-3 right-3 bg-black/75 border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-widest text-[var(--accent)] uppercase font-bold">
          Surat Lab 3D Spec
        </div>
      </div>

      {/* 2. Specs details and high-resolution file download */}
      <div className="flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="text-xs uppercase font-mono text-[var(--accent)] font-bold flex items-center justify-between">
            <span>Garment & Dispatch Blueprint</span>
            <span className="text-[10px] text-[var(--text-dim)] font-normal">Surat Production</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[var(--bg)] p-2.5 border border-[var(--line)] rounded-lg">
              <span className="text-[10px] text-[var(--text-dim)] uppercase block">Color Blank</span>
              <span className="font-bold text-[var(--text)]">{colorName}</span>
            </div>
            <div className="bg-[var(--bg)] p-2.5 border border-[var(--line)] rounded-lg">
              <span className="text-[10px] text-[var(--text-dim)] uppercase block">Size & Fit</span>
              <span className="font-bold text-[var(--text)]">{print.size || 'L'} (Boxy Fit)</span>
            </div>
            <div className="bg-[var(--bg)] p-2.5 border border-[var(--line)] rounded-lg">
              <span className="text-[10px] text-[var(--text-dim)] uppercase block">Fabric Wash</span>
              <span className="font-bold text-[var(--text)] uppercase">{fabricWash}</span>
            </div>
            <div className="bg-[var(--bg)] p-2.5 border border-[var(--line)] rounded-lg">
              <span className="text-[10px] text-[var(--text-dim)] uppercase block">Woven Neck Label</span>
              <span className="font-bold text-[var(--text)] uppercase truncate block">{neckLabel}</span>
            </div>
          </div>

          {/* Graphic layers list with Real High-Res Asset Download */}
          {layers.length > 0 && (
            <div className="border-t border-[var(--line)] pt-3 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] uppercase font-mono text-[var(--text)] font-bold">
                  Graphic Layers ({layers.length}) • High-Res Real Files
                </span>
              </div>
              
              <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                {layers.map((layer: any, lIdx: number) => {
                  const rawFile = layer.rawUrl || layer.url;
                  const cleanFile = layer.processedUrl || layer.url;
                  const isSvg = (rawFile || '').startsWith('data:image/svg');

                  return (
                    <div key={lIdx} className="bg-[var(--bg)] p-3 border border-[var(--line)] rounded-xl text-[11px] font-mono flex flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-black border border-white/15 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                            <img src={cleanFile || rawFile} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[var(--text)] truncate">{layer.name || `Graphic #${lIdx + 1}`}</div>
                            <div className="text-[10px] text-[var(--accent)] mt-0.5 uppercase">
                              Side: {layer.side || 'front'} • Scale: {layer.scale}% • Pos: [{layer.x || 0}%, {layer.y || 38}%]
                            </div>
                          </div>
                        </div>

                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono uppercase shrink-0">
                          {isSvg ? 'Vector SVG' : 'High-Res'}
                        </span>
                      </div>

                      {/* Download Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                        {rawFile && (
                          <button
                            onClick={() => {
                              const ext = isSvg ? 'svg' : 'png';
                              downloadOriginalDesign(
                                rawFile, 
                                `inkwave-real-highres-order-${orderId}-layer-${lIdx + 1}.${ext}`
                              );
                            }}
                            className="flex-1 bg-[var(--text)] hover:bg-[var(--accent)] text-[var(--bg)] hover:text-black py-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Real High-Res Asset
                          </button>
                        )}
                        {layer.processedUrl && layer.processedUrl !== rawFile && (
                          <button
                            onClick={() => {
                              downloadOriginalDesign(
                                layer.processedUrl, 
                                `inkwave-cleaned-order-${orderId}-layer-${lIdx + 1}.png`
                              );
                            }}
                            className="bg-[var(--bg-alt)] hover:bg-white/20 border border-[var(--line)] text-[var(--text)] py-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 rounded-lg transition-colors cursor-pointer"
                            title="Download AI-Cleaned Transparent Layer"
                          >
                            <Download className="w-3.5 h-3.5" /> Cleaned PNG
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Typography specs summary & Download */}
          {typography && (
            <div className="border-t border-[var(--line)] pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono text-[var(--text-dim)] font-semibold">Custom Typography Artwork</span>
                {typoTexture && (
                  <button
                    onClick={() => downloadOriginalDesign(typoTexture, `inkwave-typography-order-${orderId}.png`)}
                    className="text-[9px] font-mono text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Download className="w-3 h-3" /> Download Text Decal PNG
                  </button>
                )}
              </div>
              <div className="bg-[var(--bg)] p-3 border border-[var(--line)] rounded-xl text-xs font-mono space-y-1.5 leading-relaxed text-[var(--text-dim)]">
                <div>Text: <span className="text-[var(--text)] font-bold">{typography.text}</span></div>
                {typography.subtext && <div>Subtext: <span className="text-[var(--text)] font-bold">{typography.subtext}</span></div>}
                <div>Font Family: <span className="text-[var(--text)]">{typography.font}</span></div>
                <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                  <div>Color: <span className="text-white font-bold">{typography.textColor || '#FFFFFF'}</span></div>
                  <div>Style: {typography.isCurved ? 'Arc Curved' : 'Straight'} {typography.isOutline ? '+ Outline' : ''}</div>
                </div>
              </div>
            </div>
          )}

          {/* Legacy simple design specs */}
          {!hasLayersOrTypo && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[var(--bg)] p-2 border border-[var(--line)] rounded">Side: <span className="font-bold text-[var(--text)] uppercase">{print.metadata?.side || 'front'}</span></div>
                <div className="bg-[var(--bg)] p-2 border border-[var(--line)] rounded">Scale: <span className="font-bold text-[var(--text)]">{print.metadata?.scale || 0}%</span></div>
                <div className="bg-[var(--bg)] p-2 border border-[var(--line)] rounded">X-Align: <span className="font-bold text-[var(--text)]">{print.metadata?.left || 0}%</span></div>
                <div className="bg-[var(--bg)] p-2 border border-[var(--line)] rounded">Y-Align: <span className="font-bold text-[var(--text)]">{print.metadata?.top || 0}%</span></div>
              </div>

              {legacyImageUrl && (
                <button
                  onClick={() => downloadOriginalDesign(
                    legacyImageUrl, 
                    `custom-print-order-${orderId}-${idx + 1}.png`
                  )}
                  className="w-full bg-[var(--text)] hover:bg-[var(--accent)] text-[var(--bg)] hover:text-black py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors font-bold rounded-xl cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Original High-Res PNG
                </button>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default function OrdersClient({ 
  initialOrders,
  initialBills = []
}: { 
  initialOrders: any[];
  initialBills?: any[];
}) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [bills, setBills] = useState<any[]>(initialBills);
  const [dashboardMode, setDashboardMode] = useState<'orders' | 'billing'>('orders');
  // loading is false initially because data comes from server
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isGeneratingBillId, setIsGeneratingBillId] = useState<string | null>(null);

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'billing') {
        setDashboardMode('billing');
      }
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetchAdminOrdersAndBillsAction();
    if (res.success) {
      setOrders(res.orders);
      setBills(res.bills);
    } else {
      toast.error(res.error || 'Failed to refresh orders.');
    }
    setLoading(false);
  };

  const handleGenerateBill = async (order: any) => {
    setIsGeneratingBillId(order.id);
    
    if (bills.some((b: any) => b.orderId === order.id)) {
      toast.error('A bill has already been generated for this order.');
      setIsGeneratingBillId(null);
      return;
    }

    const res = await generateAndSendBill(order.id);
    if (res.success && res.bill) {
      toast.success('Invoice generated and SMS notification sent!');
      setBills(prev => [res.bill, ...prev]);
      
      // Update selectedOrder details in state if open
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder({ ...selectedOrder });
      }
    } else {
      toast.error(res.error || 'Failed to generate invoice.');
    }
    setIsGeneratingBillId(null);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev: any) => ({ ...prev, order_status: newStatus }));
    }
    
    const result = await updateOrderStatusAction(orderId, newStatus);
    
    if (result.success) {
      toast.success("Order status updated!");
    } else {
      toast.error(result.error || "Failed to update status");
      // Revert Optimistic update (requires a refetch or passing old status, skipping for brevity as they can just refresh)
    }
    setUpdatingId(null);
  };

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    setLoadingItems(true);
    setOrderItems([]);

    const res = await getAdminOrderItemsAction(order.id);
    if (res.success) {
      setOrderItems(res.items);
    } else {
      toast.error(res.error || 'Failed to load order items.');
    }
    setLoadingItems(false);
  };

  const downloadOriginalDesign = (base64Data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  const getOrderDeadlineInfo = (createdAtIso: string, status: string) => {
    const placed = new Date(createdAtIso);
    const deadline = new Date(placed.getTime() + 96 * 60 * 60 * 1000); // 4 days (96 hours)
    const now = new Date();
    
    const diffMs = deadline.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHrs / 24);

    const isCompleted = ['DELIVERED', 'RETURNED', 'CANCELLED'].includes(status);

    return {
      deadline,
      diffHrs,
      diffDays,
      isCompleted,
      isOverdue: diffHrs < 0 && !isCompleted,
    };
  };

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'ALL' || o.order_status === statusFilter;
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const sortedOrders = [...filtered].sort((a, b) => {
    const aInfo = getOrderDeadlineInfo(a.created_at, a.order_status);
    const bInfo = getOrderDeadlineInfo(b.created_at, b.order_status);

    // 1. Pending vs Completed: put pending first
    if (!aInfo.isCompleted && bInfo.isCompleted) return -1;
    if (aInfo.isCompleted && !bInfo.isCompleted) return 1;

    // 2. Both pending: sort by oldest first (closest to deadline first)
    if (!aInfo.isCompleted && !bInfo.isCompleted) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }

    // 3. Both completed: sort by newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const filteredBills = bills.filter((b: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (b.id || '').toLowerCase().includes(s) ||
      (b.customerName || '').toLowerCase().includes(s) ||
      (b.customerPhone || '').toLowerCase().includes(s) ||
      (b.orderId || '').toLowerCase().includes(s)
    );
  });

  const tabLabels: Record<string, string> = {
    ALL: 'All', ORDER_PLACED: 'Placed', IN_FULFILLMENT: 'Processing',
    SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered', RETURNED: 'Returned', CANCELLED: 'Cancelled',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter" style={{ color: 'var(--text)' }}>Orders & Billing Operations</h1>
          <p style={{ color: 'var(--text-dim)' }}>Manage customer custom prints, self-delivery tracking, and digital invoices.</p>
        </div>
        <button onClick={fetchOrders} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold border transition-all text-xs uppercase tracking-wider bg-[var(--bg-card)] border-[var(--line)] text-[var(--text)] hover:opacity-85"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Unified Dashboard Tab Switcher */}
      <div className="flex gap-4 border-b border-[var(--line)] pb-4 mb-6">
        <button
          onClick={() => { setDashboardMode('orders'); setSearch(''); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
            dashboardMode === 'orders'
              ? 'bg-[var(--accent)] text-black border-transparent shadow-lg shadow-[var(--accent)]/15'
              : 'bg-[var(--bg-card)] border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Fulfillment Orders ({orders.filter(o => !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(o.order_status)).length} Pending)
        </button>
        <button
          onClick={() => { setDashboardMode('billing'); setSearch(''); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
            dashboardMode === 'billing'
              ? 'bg-[var(--accent)] text-black border-transparent shadow-lg shadow-[var(--accent)]/15'
              : 'bg-[var(--bg-card)] border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)]'
          }`}
        >
          <Receipt className="w-4 h-4" /> Billing & Invoices ({bills.length} Total)
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={dashboardMode === 'orders' ? "Search by Order ID or Customer..." : "Search by Invoice ID, Name, or Phone..."}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none bg-[var(--bg-card)] text-[var(--text)] border border-[var(--line)] focus:border-[var(--accent)]"
          />
        </div>
        
        {dashboardMode === 'orders' && (
          <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
            {['ALL', ...ORDER_STATUSES].map(status => (
              <button key={status} onClick={() => setStatusFilter(status)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${statusFilter === status ? 'bg-[var(--accent)] text-black border-transparent' : 'bg-[var(--bg-card)] border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)]'}`}
              >
                {tabLabels[status] || status}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Orders Table */}
      {dashboardMode === 'orders' && (
        <div className="border overflow-hidden bg-[var(--bg-card)] border-[var(--line)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead style={{ background: 'var(--bg-alt)', color: 'var(--text-dim)' }} className="border-b border-[var(--line)]">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Order ID</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Total</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Invoice</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Deadline</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {loading ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center" style={{ color: 'var(--text-dim)' }}>Loading orders...</td></tr>
                ) : sortedOrders.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center" style={{ color: 'var(--text-dim)' }}>No orders found.</td></tr>
                ) : sortedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-black/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs" style={{ color: 'var(--text)' }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-semibold" style={{ color: 'var(--text)' }}>
                      {order.profiles?.full_name || 'Guest'}
                    </td>
                    <td className="px-6 py-4 font-bold" style={{ color: 'var(--accent)' }}>
                      ₹{order.total_amount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${STATUS_STYLES[order.order_status] || 'bg-gray-100 text-gray-500'}`}>
                        {(order.order_status || 'UNKNOWN').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const bill = bills.find((b: any) => b.orderId === order.id);
                        if (bill) {
                          return (
                            <Link 
                              href={bill.billUrl || `/admin/bill/${order.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-black bg-green-950/60 text-green-400 border border-green-500/30 hover:border-green-400 hover:text-green-300 transition-colors uppercase font-mono font-bold"
                            >
                              <FileText className="w-3.5 h-3.5" /> {bill.id}
                            </Link>
                          );
                        }
                        return (
                          <button
                            onClick={() => handleGenerateBill(order)}
                            disabled={isGeneratingBillId === order.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold bg-[var(--bg-alt)] border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--text-dim)] disabled:opacity-50 transition-colors uppercase font-mono cursor-pointer font-bold"
                          >
                            {isGeneratingBillId === order.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Receipt className="w-3.5 h-3.5" />
                            )}
                            Generate Bill
                          </button>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const info = getOrderDeadlineInfo(order.created_at, order.order_status);
                        if (info.isCompleted) {
                          return <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-semibold">Resolved</span>;
                        }
                        if (info.isOverdue) {
                          const hrs = Math.abs(Math.floor(info.diffHrs));
                          return (
                            <span className="px-2.5 py-1 rounded text-[9px] font-black bg-red-950/60 text-red-400 border border-red-500/30 animate-pulse inline-flex items-center gap-1 font-mono uppercase">
                              ⚠️ OVERDUE BY {hrs}h
                            </span>
                          );
                        }
                        if (info.diffHrs <= 24) {
                          const hrs = Math.ceil(info.diffHrs);
                          return (
                            <span className="px-2.5 py-1 rounded text-[9px] font-black bg-amber-950/60 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1 font-mono uppercase">
                              ⌛ URGENT: {hrs}h LEFT
                            </span>
                          );
                        }
                        return (
                          <span className="px-2.5 py-1 rounded text-[9px] font-black bg-blue-950/60 text-blue-400 border border-blue-500/30 inline-flex items-center gap-1 font-mono uppercase">
                            📦 {info.diffDays} DAYS LEFT
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-xs" style={{ color: 'var(--text-dim)' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/print-label/${order.id}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs bg-[var(--accent)] text-black px-3 py-1.5 font-bold uppercase tracking-wider hover:brightness-110"
                      >
                        <Printer className="w-3.5 h-3.5" /> Label
                      </Link>
                      {(() => {
                        const bill = bills.find((b: any) => b.orderId === order.id);
                        if (bill) {
                          return (
                            <Link
                              href={bill.billUrl || `/admin/bill/${order.id}`}
                              target="_blank"
                              className="flex items-center gap-1 text-xs bg-black text-white border border-gray-700 px-3 py-1.5 font-bold uppercase tracking-wider hover:bg-gray-800"
                            >
                              <Receipt className="w-3.5 h-3.5" /> Bill
                            </Link>
                          );
                        }
                        return (
                          <button
                            onClick={() => handleGenerateBill(order)}
                            disabled={isGeneratingBillId === order.id}
                            className="flex items-center gap-1 text-xs bg-neutral-900 border border-neutral-800 text-neutral-400 px-3 py-1.5 font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 font-bold"
                          >
                            <Receipt className="w-3.5 h-3.5" /> Bill
                          </button>
                        );
                      })()}
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="flex items-center gap-1 text-xs bg-[var(--bg-alt)] border border-[var(--line)] hover:border-[var(--text)] text-[var(--text)] px-3 py-1.5 font-bold uppercase tracking-wider"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices & Billing list rendering block */}
      {dashboardMode === 'billing' && (
        <div className="border overflow-hidden bg-[var(--bg-card)] border-[var(--line)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead style={{ background: 'var(--bg-alt)', color: 'var(--text-dim)' }} className="border-b border-[var(--line)]">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Invoice ID</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Order ID</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Total</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Generated Date</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center" style={{ color: 'var(--text-dim)' }}>
                      No bills generated matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill: any) => (
                    <tr key={bill.id} className="hover:bg-black/10 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs" style={{ color: 'var(--text)' }}>
                        {bill.id}
                      </td>
                      <td className="px-6 py-4 font-semibold" style={{ color: 'var(--text)' }}>
                        <div>{bill.customerName}</div>
                        <div className="text-[10px] text-[var(--text-dim)] font-mono">{bill.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[var(--text-dim)]">
                        #{bill.orderId?.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-bold" style={{ color: 'var(--accent)' }}>
                        ₹{Number(bill.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {bill.status === 'SMS_SENT' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold bg-green-950/60 text-green-400 border border-green-500/30 uppercase tracking-widest">
                            <Send className="w-3 h-3" /> SMS Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold bg-neutral-900 text-neutral-400 border border-neutral-800 uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> Generated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs" style={{ color: 'var(--text-dim)' }}>
                        {new Date(bill.generatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={bill.billUrl || `/admin/bill/${bill.orderId}`}
                            target="_blank"
                            className="flex items-center gap-1 text-xs bg-[var(--bg-alt)] border border-[var(--line)] hover:border-[var(--text)] text-[var(--text)] px-3 py-1.5 font-bold uppercase tracking-wider"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Invoice <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── DETAILED VIEW DRAWERS MODAL ─── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--bg-card)] w-full max-w-4xl h-full min-h-screen overflow-y-auto p-8 relative border-l border-[var(--line)] shadow-2xl flex flex-col justify-between">
            <div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-6 right-6 p-2 bg-[var(--bg-alt)] text-[var(--text-dim)] hover:text-[var(--text)] rounded-full transition-colors border border-[var(--line)]"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-8">
                <span className="text-[10px] font-mono tracking-widest text-[var(--accent)] uppercase font-bold">Fulfillment Details</span>
                <h2 className="font-display text-2xl font-black mb-1 uppercase tracking-tighter">Order ID: #{selectedOrder.id.slice(0, 12).toUpperCase()}</h2>
                <p className="text-xs text-[var(--text-dim)]">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-[var(--line)] pb-8">
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-dim)]">Customer & Shipping</h3>
                  <div className="text-sm font-bold">{selectedOrder.profiles?.full_name || selectedOrder.shipping_address?.name || 'Guest User'}</div>
                  <div className="text-xs text-[var(--text-dim)] leading-relaxed mb-1">
                    Phone: {selectedOrder.shipping_address?.phone || 'N/A'}
                  </div>
                  <div className="text-xs text-[var(--text-dim)] leading-relaxed mb-1">
                    Email: {selectedOrder.shipping_address?.email || selectedOrder.profiles?.email || 'N/A'}
                  </div>
                  <div className="text-xs text-[var(--text-dim)] leading-relaxed">
                    Address: {selectedOrder.shipping_address?.address || 'N/A'}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-dim)]">Fulfillment Operations</h3>
                  <div className="flex gap-3 items-center">
                    <select
                      value={selectedOrder.order_status}
                      onChange={e => handleStatusUpdate(selectedOrder.id, e.target.value)}
                      disabled={updatingId === selectedOrder.id}
                      className="text-xs rounded px-3 py-2 font-bold focus:outline-none cursor-pointer bg-[var(--bg)] border border-[var(--line)] text-[var(--text)]"
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                    {updatingId === selectedOrder.id && <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />}
                  </div>
                  <div className="text-xs text-[var(--text-dim)] font-mono">
                    Payment Gateway Ref ID: <span className="text-[var(--text)]">{selectedOrder.payment_intent_id}</span>
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-dim)]">Ordered Items</h3>
                {loadingItems ? (
                  <div className="p-8 text-center text-xs text-[var(--text-dim)]">Loading items...</div>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center bg-[var(--bg-alt)] border border-[var(--line)] p-4">
                        <div>
                          <div className="font-bold text-sm">{item.product_variants?.products?.title || 'Custom Printed Tee'}</div>
                          <div className="text-xs text-[var(--text-dim)] mt-1">
                            Quantity: {item.quantity} · Price: ₹{item.unit_price} 
                            {item.product_variants?.color && ` · Color: ${item.product_variants.color}`}
                            {item.product_variants?.size && ` · Size: ${item.product_variants.size}`}
                          </div>
                        </div>
                        <div className="font-bold text-sm text-[var(--accent)]">₹{(item.unit_price * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── DETAILED CUSTOM PRINT FULL SYSTEM VIEW ─── */}
              {selectedOrder.shipping_address?.custom_prints && selectedOrder.shipping_address.custom_prints.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-[var(--line)]">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5 font-bold">
                    ★ CUSTOM PRINT SPECIFICATIONS
                  </h3>
                  
                  {selectedOrder.shipping_address.custom_prints.map((print: any, idx: number) => (
                    <CustomPrintOrderPreview 
                      key={idx}
                      print={print}
                      orderId={selectedOrder.id}
                      idx={idx}
                      downloadOriginalDesign={downloadOriginalDesign}
                    />
                  ))}
                </div>
              )}

            </div>

            <div className="mt-8 pt-8 border-t border-[var(--line)] flex justify-between">
              <div className="flex gap-3">
                {(() => {
                  const bill = bills.find((b: any) => b.orderId === selectedOrder.id);
                  if (bill) {
                    return (
                      <Link 
                        href={bill.billUrl || `/admin/bill/${selectedOrder.id}`}
                        target="_blank"
                        className="flex items-center gap-2 bg-green-500 text-black hover:bg-green-400 px-6 py-3 text-xs uppercase tracking-wider font-bold"
                      >
                        <FileText className="w-4 h-4" /> View Invoice ({bill.id})
                      </Link>
                    );
                  }
                  return (
                    <button 
                      onClick={() => handleGenerateBill(selectedOrder)}
                      disabled={isGeneratingBillId === selectedOrder.id}
                      className="flex items-center gap-2 bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 px-6 py-3 text-xs uppercase tracking-wider font-bold disabled:opacity-50 cursor-pointer font-bold"
                    >
                      {isGeneratingBillId === selectedOrder.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Receipt className="w-4 h-4" />
                      )}
                      Generate & Send Bill
                    </button>
                  );
                })()}
                <Link 
                  href={`/admin/print-label/${selectedOrder.id}`}
                  target="_blank"
                  className="flex items-center gap-2 bg-[var(--bg-alt)] border border-[var(--line)] hover:border-[var(--text)] text-[var(--text)] px-6 py-3 text-xs uppercase tracking-wider font-bold"
                >
                  <Printer className="w-4 h-4" /> Print Label
                </Link>
                {(() => {
                  const bill = bills.find((b: any) => b.orderId === selectedOrder.id);
                  if (bill) {
                    return (
                      <Link 
                        href={bill.billUrl || `/admin/bill/${selectedOrder.id}`}
                        target="_blank"
                        className="flex items-center gap-2 bg-black border border-gray-700 hover:border-gray-400 text-white px-6 py-3 text-xs uppercase tracking-wider font-bold"
                      >
                        <Receipt className="w-4 h-4" /> Print Bill
                      </Link>
                    );
                  }
                  return (
                    <button
                      disabled
                      className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 text-neutral-500 px-6 py-3 text-xs uppercase tracking-wider font-bold cursor-not-allowed"
                    >
                      <Receipt className="w-4 h-4" /> Print Bill (Not Generated)
                    </button>
                  );
                })()}
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="bg-[var(--bg-alt)] border border-[var(--line)] hover:border-[var(--text)] px-6 py-3 text-xs uppercase tracking-wider font-bold text-[var(--text)]"
              >
                Close Fulfill Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
