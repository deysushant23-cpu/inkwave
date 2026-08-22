'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function DownloadInvoiceButton() {
  return (
    <button 
      onClick={() => {
        toast.info('Preparing invoice for print/download...');
        setTimeout(() => window.print(), 500);
      }}
      className="print:hidden mt-4 md:mt-0 px-6 py-2.5 bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--text)] transition-colors font-bold text-xs uppercase tracking-wider flex items-center gap-2"
    >
      <Download className="w-4 h-4" /> Download Invoice
    </button>
  );
}
