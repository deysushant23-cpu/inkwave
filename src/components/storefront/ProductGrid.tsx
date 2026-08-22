'use client';

import { Product } from '@/types/database';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>No products found.</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
    >
      {products.map((product, index) => (
        <motion.div key={product.id} variants={item}>
          <ProductCard product={product} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
}
