'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function WhatsAppWidget() {
  const pathname = usePathname();

  // Hide on product overview and checkout pages
  const isProductOverview = pathname.startsWith('/product');
  const isCheckoutPage = pathname.startsWith('/checkout');

  if (isProductOverview || isCheckoutPage) {
    return null;
  }

  const phoneNumber = '918160321453';
  const message = encodeURIComponent('Hello Inkwave! I have a query about your collection.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 left-4 sm:left-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-[98] border border-emerald-500/20 bg-[#25D366] text-white transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(37,211,102,0.6)] cursor-pointer group"
      aria-label="Chat on WhatsApp"
    >
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping opacity-75" />

      {/* Custom Tooltip */}
      <span className="absolute left-16 bg-black/85 text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Chat with Us
      </span>

      {/* WhatsApp SVG Icon */}
      <svg
        className="w-7 h-7 relative z-10 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.528 2.015 14.077.99 11.52.99c-5.439 0-9.861 4.37-9.865 9.801-.001 1.73.473 3.41 1.37 4.861L2.01 21.99l6.18-1.597zM17.06 14.18c-.282-.143-1.67-.823-1.929-.918-.259-.095-.448-.143-.637.143-.19.285-.733.918-.899 1.107-.166.19-.333.214-.616.071-.282-.143-1.194-.44-2.274-1.405-.84-.75-1.407-1.676-1.572-1.962-.166-.285-.018-.44.124-.581.127-.127.282-.333.424-.5.143-.166.19-.285.285-.476.095-.19.047-.357-.024-.5-.071-.143-.637-1.536-.873-2.107-.23-.554-.485-.48-.637-.48-.164-.002-.353-.002-.542-.002-.19 0-.498.071-.76.357-.26.285-1.02 1.001-1.02 2.441 0 1.439 1.045 2.829 1.187 3.02.143.19 2.056 3.14 4.979 4.402.695.3 1.237.479 1.661.614.698.221 1.334.19 1.837.114.56-.085 1.67-.683 1.905-1.343.235-.66.235-1.226.166-1.343-.07-.117-.259-.19-.542-.333z" />
      </svg>
    </motion.a>
  );
}
