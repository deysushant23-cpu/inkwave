'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroBanner() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
    },
  };

  return (
    <div className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/60 z-10" />
      <motion.img 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        src="https://images.unsplash.com/photo-1617391654484-934c8922c262?q=80&w=2000&auto=format&fit=crop" 
        alt="Streetwear Hero" 
        className="absolute inset-0 w-full h-full object-cover origin-center"
      />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center"
      >
        <motion.div variants={itemVariants} className="inline-block bg-red-500 text-white font-bold px-3 py-1 text-xs uppercase tracking-widest rounded mb-6 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
          Drop 001 — Active
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="font-syne text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6 uppercase drop-shadow-2xl">
          Digital Reality
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-gray-300 md:text-xl max-w-2xl mx-auto mb-10 font-medium drop-shadow-lg">
          Experience the intersection of luxury streetwear and neural rendering. No fitting room required.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          <Link href="/drops" className="group bg-white text-black font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 w-full sm:w-auto">
            Explore Drops <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
