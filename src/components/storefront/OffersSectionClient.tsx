'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export interface OfferProps {
  title: string;
  subtitle: string;
  discount: string;
  bgImage: string;
  link: string;
  accent: string;
  endTime?: string;
}

/* ── Countdown to midnight ──────────────────────────────────────────────── */
function useCountdown(endTimeStr?: string) {
  const [t, setT] = useState({ h: '00', m: '00', s: '00', isLastHour: false });
  const [mounted, setMounted] = useState(false);

  const getTimeLeft = () => {
    const now = new Date();
    let target = new Date();
    if (endTimeStr) {
      target = new Date(endTimeStr);
    } else {
      target.setHours(24, 0, 0, 0);
    }
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return { h: '00', m: '00', s: '00', isLastHour: false };
    
    // Total difference is less than or equal to 1 hour (3600000 ms) and greater than 0
    const isLastHour = diff > 0 && diff <= 3600000;
    
    return {
      h: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
      m: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0'),
      s: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
      isLastHour
    };
  };

  useEffect(() => {
    setMounted(true);
    setT(getTimeLeft());
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return { ...t, mounted };
}


/* ── Single offer row ────────────────────────────────────────────────────── */
function OfferRow({ offer, index }: { offer: OfferProps; index: number }) {
  const t = useCountdown(offer.endTime);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      className="offer-row"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 1, 0.35, 1] }}
    >
      <Link href={offer.link} className="offer-row-inner">
        {/* Background image — left or right based on index */}
        <div
          className={`offer-img-side ${isEven ? 'offer-img-left' : 'offer-img-right'}`}
          style={{ backgroundImage: `url(${offer.bgImage})` }}
        >
          <div className="offer-img-overlay" />
        </div>

        {/* Content side */}
        <div className={`offer-content-side ${isEven ? 'offer-content-right' : 'offer-content-left'}`}>
          {/* Eyebrow */}
          <p className="offer-eyebrow">{offer.subtitle}</p>

          {/* Title */}
          <h3 className="offer-title">{offer.title}</h3>

          {/* Discount badge */}
          <div className="offer-discount-wrap">
            <span className="offer-discount">{offer.discount}</span>
          </div>

          {/* Countdown */}
          <div className="offer-countdown">
            <span className="offer-countdown-label">Ends in</span>
            <div className={`offer-clock ${t.isLastHour ? 'is-ending' : ''}`}>
              <span className="offer-clock-unit">
                <span className="offer-clock-num">{t.h}</span>
                <span className="offer-clock-seg">h</span>
              </span>
              <span className="offer-clock-sep">:</span>
              <span className="offer-clock-unit">
                <span className="offer-clock-num">{t.m}</span>
                <span className="offer-clock-seg">m</span>
              </span>
              <span className="offer-clock-sep">:</span>
              <span className="offer-clock-unit">
                <span className="offer-clock-num">{t.s}</span>
                <span className="offer-clock-seg">s</span>
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="offer-cta">
            <span>Shop Offer</span>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */
export default function OffersSectionClient({ offers }: { offers: OfferProps[] }) {
  return (
    <section className="section offers-section" id="offers">
      <div className="wrap">
        <div className="sec-head reveal in">
          <div>
            <span className="sec-tag">Exclusive Access</span>
            <h2>Current Offers</h2>
          </div>
        </div>
      </div>

      <div className="offers-list">
        {offers.map((offer, i) => (
          <OfferRow key={i} offer={offer} index={i} />
        ))}
      </div>
    </section>
  );
}
