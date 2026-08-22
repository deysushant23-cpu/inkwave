'use client';

import { useEffect } from 'react';

export default function AdminThemeManager() {
  useEffect(() => {
    // Force bubble theme on mount
    document.documentElement.setAttribute('data-theme', 'bubble');
    
    return () => {
      // Revert to ink theme on unmount (if leaving admin)
      document.documentElement.setAttribute('data-theme', 'ink');
    };
  }, []);

  return null;
}
