'use client';

import { useState } from 'react';

export default function ThemeDock() {
  const [activeTheme, setActiveTheme] = useState('ink');

  const switchTheme = (theme: string) => {
    setActiveTheme(theme);
    const wipe = document.getElementById('wipe');
    if (wipe) {
      // Create a wipe effect
      wipe.style.setProperty('--wipe-color', 
        theme === 'ink' ? '#1B3A5C' : 
        theme === 'bone' ? '#EDEAE8' : '#0F2032'
      );
      
      // Randomize wipe origin
      wipe.style.setProperty('--wx', `${Math.random() * 100}%`);
      wipe.style.setProperty('--wy', `${Math.random() * 100}%`);
      
      wipe.classList.remove('active');
      void wipe.offsetWidth; // trigger reflow
      wipe.classList.add('active');

      setTimeout(() => {
        document.documentElement.setAttribute('data-theme', theme);
      }, 350); // halfway through animation
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  return (
    <div className="theme-dock">
      <span className="td-label">Store design</span>
      <button 
        className={`swatch ${activeTheme === 'ink' ? 'active' : ''}`} 
        data-t="ink" 
        title="Ink theme" 
        aria-label="Ink theme"
        onClick={() => switchTheme('ink')}
      ></button>
      <button 
        className={`swatch ${activeTheme === 'bone' ? 'active' : ''}`} 
        data-t="bone" 
        title="Bone theme" 
        aria-label="Bone theme"
        onClick={() => switchTheme('bone')}
      ></button>
      <button 
        className={`swatch ${activeTheme === 'current' ? 'active' : ''}`} 
        data-t="current" 
        title="Current theme" 
        aria-label="Current theme"
        onClick={() => switchTheme('current')}
      ></button>
    </div>
  );
}
