'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccordionSpecs() {
  const [openSection, setOpenSection] = useState<string | null>('fabric');

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="border-y border-white/10">
      <div className="border-b border-white/10">
        <button 
          onClick={() => toggle('fabric')}
          className="w-full py-5 flex items-center justify-between text-left font-syne font-bold hover:text-gray-300 transition-colors"
        >
          Fabric & Care
          <ChevronDown className={`w-5 h-5 transition-transform ${openSection === 'fabric' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {openSection === 'fabric' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pb-5 text-sm text-gray-400 leading-relaxed">
                Constructed from 400GSM heavyweight French Terry cotton. 
                Custom developed acid wash process means no two garments are identical.
                <br /><br />
                Wash cold, inside out. Do not tumble dry. Allow to air dry naturally to preserve the graphic integrity.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-b border-white/10">
        <button 
          onClick={() => toggle('fit')}
          className="w-full py-5 flex items-center justify-between text-left font-syne font-bold hover:text-gray-300 transition-colors"
        >
          Fit & Sizing Guide
          <ChevronDown className={`w-5 h-5 transition-transform ${openSection === 'fit' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {openSection === 'fit' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pb-5 text-sm text-gray-400 leading-relaxed">
                Cut for a relaxed, oversized drape. We recommend going true to size for the intended baggy aesthetic, or sizing down if you prefer a more standard fit.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <button 
          onClick={() => toggle('returns')}
          className="w-full py-5 flex items-center justify-between text-left font-syne font-bold hover:text-gray-300 transition-colors"
        >
          Exchanges & Shipping
          <ChevronDown className={`w-5 h-5 transition-transform ${openSection === 'returns' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {openSection === 'returns' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pb-5 text-sm text-gray-400 leading-relaxed flex flex-col gap-2">
                <p>• <strong>Free Shipping:</strong> Automatically applied to all orders above ₹2000. Under ₹2000 is flat ₹99.</p>
                <p>• <strong>Delivery Timeline:</strong> Direct dispatch from Surat Studio. Standard B2C delivery takes exactly 3 to 4 days.</p>
                <p>• <strong>7-Day Exchanges:</strong> We support free doorstep size exchanges. Raise a request from your orders profile tab within 7 days of delivery.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
