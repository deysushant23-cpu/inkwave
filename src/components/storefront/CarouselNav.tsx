'use client';

export default function CarouselNav() {
  const scrollLeft = () => {
    document.getElementById('carousel')?.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollRight = () => {
    document.getElementById('carousel')?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="carousel-nav">
      <button className="car-btn" aria-label="Scroll left" onClick={scrollLeft}>
        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button className="car-btn" aria-label="Scroll right" onClick={scrollRight}>
        <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}
