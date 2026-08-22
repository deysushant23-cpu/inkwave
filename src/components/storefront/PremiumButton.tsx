'use client';

import React from 'react';
import Magnetic from './Magnetic';
import Link from 'next/link';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isMagnetic?: boolean;
  href?: string;
}

export default function PremiumButton({ children, isMagnetic = true, className = '', href, ...props }: PremiumButtonProps) {
  const content = href ? (
    <Link href={href} className={`premium-btn-wrapper ${className}`} style={{ display: 'inline-block' }}>
      <div className="premium-btn-inner">
        {children}
      </div>
    </Link>
  ) : (
    <button className={`premium-btn-wrapper ${className}`} {...props}>
      <div className="premium-btn-inner">
        {children}
      </div>
    </button>
  );

  if (isMagnetic) {
    return <Magnetic intensity={0.15}>{content}</Magnetic>;
  }

  return content;
}
