import React from 'react';


export const metadata = {
  title: 'Size Guide | Inkwave',
  description: 'Measurement guidelines for Inkwave Studio garments.',
};

export default function SizeGuidePage() {
  return (
    <>
      <div className="w-full relative z-10 pt-[160px] pb-32">
        <div className="wrap max-w-5xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-24 reveal in">
            <span className="font-label-caps text-xs tracking-widest text-[var(--accent)] mb-4 inline-block">
              Measurement & Fit
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold uppercase text-white mb-6 tracking-tighter">
              Size Guide
            </h1>
            <p className="font-mono text-sm md:text-base text-[var(--text-dim)] max-w-2xl mx-auto leading-relaxed">
              Our garments are designed with a relaxed, architectural fit. Measurements are taken flat. Please allow for a 1-2cm variance.
            </p>
          </div>

          {/* Guide Section: Shirts */}
          <section className="mb-24 reveal in">
            <h2 className="font-headline-sm text-3xl text-white uppercase tracking-wider mb-8 border-b border-[var(--line)] pb-4">
              Shirts & Tops
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="font-label-caps text-xs tracking-widest text-[var(--text-dim)] py-4 px-4 border-b border-[var(--line)]">Size</th>
                    <th className="font-label-caps text-xs tracking-widest text-[var(--text-dim)] py-4 px-4 border-b border-[var(--line)]">Chest (cm)</th>
                    <th className="font-label-caps text-xs tracking-widest text-[var(--text-dim)] py-4 px-4 border-b border-[var(--line)]">Length (cm)</th>
                    <th className="font-label-caps text-xs tracking-widest text-[var(--text-dim)] py-4 px-4 border-b border-[var(--line)]">Shoulder (cm)</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm text-white">
                  <tr className="border-b border-[var(--line)]/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">Small (1)</td>
                    <td className="py-4 px-4">56</td>
                    <td className="py-4 px-4">70</td>
                    <td className="py-4 px-4">48</td>
                  </tr>
                  <tr className="border-b border-[var(--line)]/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">Medium (2)</td>
                    <td className="py-4 px-4">59</td>
                    <td className="py-4 px-4">72</td>
                    <td className="py-4 px-4">50</td>
                  </tr>
                  <tr className="border-b border-[var(--line)]/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">Large (3)</td>
                    <td className="py-4 px-4">62</td>
                    <td className="py-4 px-4">74</td>
                    <td className="py-4 px-4">52</td>
                  </tr>
                  <tr className="border-b border-[var(--line)]/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">X-Large (4)</td>
                    <td className="py-4 px-4">65</td>
                    <td className="py-4 px-4">76</td>
                    <td className="py-4 px-4">54</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Guide Section: Bottoms */}
          <section className="mb-24 reveal in">
            <h2 className="font-headline-sm text-3xl text-white uppercase tracking-wider mb-8 border-b border-[var(--line)] pb-4">
              Jeans & Trousers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="font-label-caps text-xs tracking-widest text-[var(--text-dim)] py-4 px-4 border-b border-[var(--line)]">Size</th>
                    <th className="font-label-caps text-xs tracking-widest text-[var(--text-dim)] py-4 px-4 border-b border-[var(--line)]">Waist (in)</th>
                    <th className="font-label-caps text-xs tracking-widest text-[var(--text-dim)] py-4 px-4 border-b border-[var(--line)]">Inseam (in)</th>
                    <th className="font-label-caps text-xs tracking-widest text-[var(--text-dim)] py-4 px-4 border-b border-[var(--line)]">Leg Opening (cm)</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm text-white">
                  <tr className="border-b border-[var(--line)]/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">28</td>
                    <td className="py-4 px-4">29.5</td>
                    <td className="py-4 px-4">32</td>
                    <td className="py-4 px-4">19</td>
                  </tr>
                  <tr className="border-b border-[var(--line)]/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">30</td>
                    <td className="py-4 px-4">31.5</td>
                    <td className="py-4 px-4">32</td>
                    <td className="py-4 px-4">20</td>
                  </tr>
                  <tr className="border-b border-[var(--line)]/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">32</td>
                    <td className="py-4 px-4">33.5</td>
                    <td className="py-4 px-4">32</td>
                    <td className="py-4 px-4">21</td>
                  </tr>
                  <tr className="border-b border-[var(--line)]/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">34</td>
                    <td className="py-4 px-4">35.5</td>
                    <td className="py-4 px-4">34</td>
                    <td className="py-4 px-4">22</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* How to measure */}
          <section className="reveal in bg-[var(--bg-alt)] p-8 md:p-12 rounded-2xl border border-[var(--line)]">
            <h2 className="font-headline-sm text-2xl text-white uppercase tracking-wider mb-6">
              How to Measure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[var(--text-dim)] font-mono text-sm leading-relaxed">
              <div>
                <strong className="text-white font-label-caps block mb-2">Chest</strong>
                <p>Lay garment flat and measure from armpit to armpit. Multiply by two for circumference.</p>
              </div>
              <div>
                <strong className="text-white font-label-caps block mb-2">Length</strong>
                <p>Measure from the highest point of the shoulder down to the bottom hem.</p>
              </div>
              <div>
                <strong className="text-white font-label-caps block mb-2">Waist</strong>
                <p>Lay trousers flat and measure across the top edge. Multiply by two for circumference.</p>
              </div>
              <div>
                <strong className="text-white font-label-caps block mb-2">Inseam</strong>
                <p>Measure from the crotch seam down the inside leg to the hem.</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
