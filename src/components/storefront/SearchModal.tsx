'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Search, ArrowRight, Mic, MicOff, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const supabase = createClient();

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setQuery(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Microphone permission denied. Please allow microphone access in your browser.');
          } else if (event.error !== 'no-speech') {
            toast.error(`Voice search error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice search is not supported by your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Recognition stop error', e);
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('🎙️ Listening... Speak to search');
      } catch (e) {
        console.error('Recognition start failed', e);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
      if (suggested.length === 0) {
        fetch('/api/search?limit=4')
          .then(res => res.json())
          .then(data => {
            if (data.success) setSuggested(data.results || []);
          })
          .catch(err => console.error('Error fetching suggestions', err));
      }
    } else {
      if (isListening && recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setQuery('');
      setResults([]);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        
        if (data.success) {
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Search error', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={onClose} style={{ zIndex: 98 }}></div>
      
      <div className={`drawer ${isOpen ? 'open' : ''}`} style={{ zIndex: 99 }}>
        <div className="drawer-head">
          <h3>Search</h3>
          <button className="drawer-close" onClick={onClose} aria-label="Close search">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div className="p-6 border-b border-[var(--line)] sticky top-[72px] bg-[var(--bg)] z-10">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              ref={inputRef}
              type="text"
              placeholder={isListening ? "Listening... Speak now" : "Search products, collections, hoodies..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full bg-[var(--bg-alt)] border ${
                isListening 
                  ? 'border-red-500 ring-2 ring-red-500/30' 
                  : 'border-[var(--line)] focus:border-[var(--accent)]'
              } rounded-full pl-10 pr-20 py-3 text-[var(--text)] outline-none transition-all font-mono`}
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Voice Microphone Search Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                    : 'text-[var(--text-dim)] hover:text-white hover:bg-white/10'
                }`}
                title={isListening ? 'Stop listening' : 'Search by voice'}
                aria-label={isListening ? 'Stop listening' : 'Search by voice'}
              >
                {isListening ? (
                  <Mic className="w-4 h-4 animate-bounce" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Active Voice Listening Live Feedback Banner */}
          {isListening && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono animate-in fade-in duration-200">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <span className="truncate">Listening... Speak e.g. "Oversized T-Shirt", "Black Hoodie", "Jeans"</span>
            </div>
          )}
        </div>

        <div className="drawer-items" style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
          {query.trim() === '' ? (
            <div className="mt-6">
              <h4 className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-4">Suggested Products</h4>
              <div className="flex flex-col gap-4">
                {suggested.map((product) => {
                  const thumb = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 group p-2 hover:bg-[var(--bg-alt)] rounded-xl transition-colors border border-transparent hover:border-[var(--line)]"
                    >
                      {thumb ? (
                        <img src={thumb} alt={product.title} className="w-16 h-16 object-cover rounded-lg bg-[var(--bg-card)]" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
                          <Search className="w-4 h-4 opacity-30" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">{product.title}</div>
                        <div className="text-sm text-[var(--text-dim)] mt-1">₹{product.base_price?.toFixed(2)}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 ml-auto text-[var(--text-dim)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  );
                })}
                {suggested.length === 0 && (
                  <div className="empty-cart" style={{ opacity: 0.5 }}>
                    Search for apparel, collections, or specific drops.
                  </div>
                )}
              </div>
            </div>
          ) : loading ? (

            <div className="py-12 flex justify-center">
              <div className="animate-spin w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-4 mt-6">
              {results.map((product) => {
                const thumb = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 group p-2 hover:bg-[var(--bg-alt)] rounded-xl transition-colors border border-transparent hover:border-[var(--line)]"
                  >
                    <div className="w-16 h-16 shrink-0 bg-[var(--bg-alt)] rounded-lg overflow-hidden border border-[var(--line)] relative">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-dim)]">
                          <Search className="w-4 h-4 opacity-30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate group-hover:text-[var(--accent)] transition-colors text-[var(--text)]">
                        {product.title}
                      </h4>
                      <p className="text-xs font-mono text-[var(--text-dim)] mt-1">
                        ₹{(product.base_price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--accent)] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-cart" style={{ opacity: 0.5, marginTop: '2rem' }}>
              No items found for "{query}".<br/>Try a different search term.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
