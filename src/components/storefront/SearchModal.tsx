'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  ArrowRight, 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  Square,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const TRENDING_VOICE_TAGS = [
  'Oversized T-Shirt',
  'Black Hoodie',
  'Acid Wash',
  'Denim Jeans',
  'Graphic Tee',
  'Cargo Pants',
  'Under ₹999',
];

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
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 45, 30, 60, 40, 20, 35]);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Stop microphone stream & visualizer
  const stopAudioCapture = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Start real microphone audio capture + live audio visualizer
  const startVoiceSession = async () => {
    try {
      setLiveTranscript('');
      setIsProcessingAudio(false);

      // 1. Request real microphone access (Works in ALL browsers including Brave, Safari, Chrome, Firefox)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });
      mediaStreamRef.current = stream;

      // 2. Setup AudioContext for real-time sound wave visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVisualizer = () => {
          analyser.getByteFrequencyData(dataArray);
          const normalized = Array.from(dataArray.slice(0, 8)).map((val) => 
            Math.max(12, Math.min(90, Math.round((val / 255) * 85) + 12))
          );
          setAudioLevels(normalized);
          animationFrameRef.current = requestAnimationFrame(updateVisualizer);
        };
        updateVisualizer();
      }

      // 3. Setup MediaRecorder to capture spoken audio
      audioChunksRef.current = [];
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0 && !liveTranscript) {
          // Send to transcription route if live transcript didn't catch text
          setIsProcessingAudio(true);
          try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            const res = await fetch('/api/transcribe-audio', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (data.success && data.text) {
              setQuery(data.text);
              setLiveTranscript(data.text);
            }
          } catch (err) {
            console.error('Transcription error:', err);
          } finally {
            setIsProcessingAudio(false);
          }
        }
      };

      recorder.start(250);
      setIsListening(true);

      // 4. Concurrently attempt Web Speech Recognition for instant live transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) {}
          }
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;
          recognition.lang = navigator.language || 'en-IN';

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((res: any) => res[0].transcript)
              .join('');
            if (transcript) {
              setLiveTranscript(transcript);
              setQuery(transcript);
            }
          };

          recognition.onerror = (event: any) => {
            console.log('Browser SpeechRecognition note:', event.error);
            // We do NOT stop the microphone stream — user can still speak and audio is captured!
          };

          recognition.onend = () => {
            // Speech recognition completed
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (e) {
          console.log('SpeechRecognition start notice:', e);
        }
      }

    } catch (err: any) {
      console.error('Microphone permission error:', err);
      setIsListening(false);
      stopAudioCapture();
      toast.error('Microphone permission was not granted. Please allow microphone access in your browser.');
    }
  };

  // Stop speaking session and apply search
  const stopVoiceSession = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    stopAudioCapture();

    if (liveTranscript) {
      setQuery(liveTranscript);
      toast.success(`Searching for: "${liveTranscript}"`);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopVoiceSession();
    } else {
      startVoiceSession();
    }
  };

  // Cleanup on close or unmount
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
      if (isListening) {
        stopVoiceSession();
      }
      setQuery('');
      setLiveTranscript('');
      setResults([]);
      document.body.style.overflow = '';
    }
    return () => {
      stopAudioCapture();
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Live search query debounce
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
    }, 250);

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

        <div className="p-4 sm:p-6 border-b border-[var(--line)] sticky top-[72px] bg-[var(--bg)] z-10">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              ref={inputRef}
              type="text"
              placeholder={isListening ? "Listening... Speak your style" : "Search drops, oversized, hoodies..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full bg-[var(--bg-alt)] border ${
                isListening 
                  ? 'border-red-500 ring-2 ring-red-500/30' 
                  : 'border-[var(--line)] focus:border-[var(--accent)]'
              } rounded-full pl-10 pr-20 py-3 text-[var(--text)] outline-none transition-all font-mono text-sm`}
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setLiveTranscript(''); }}
                  className="p-1 rounded-full text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Voice Microphone Action Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-105'
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

          {/* ─── ACTIVE VOICE SPEAKING LIVE CARD ─── */}
          {isListening && (
            <div className="mt-3 p-4 rounded-2xl bg-neutral-900 border border-red-500/40 text-white shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span className="font-mono text-xs uppercase tracking-widest font-bold text-red-400">
                    Listening to you...
                  </span>
                </div>

                {/* Real-time Voice Audio Visualizer Equalizer */}
                <div className="flex items-end gap-1 h-6 px-2 bg-black/40 rounded-lg py-1">
                  {audioLevels.map((lvl, idx) => (
                    <span
                      key={idx}
                      style={{ height: `${lvl}%` }}
                      className="w-1 bg-gradient-to-t from-red-600 to-red-400 rounded-full transition-all duration-75"
                    />
                  ))}
                </div>
              </div>

              {/* Live Spoken Speech Display */}
              <div className="min-h-10 py-2 px-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between">
                <p className="font-mono text-sm text-neutral-200">
                  {liveTranscript ? (
                    <span className="font-bold text-white">"{liveTranscript}"</span>
                  ) : (
                    <span className="text-neutral-500 italic">Speak now (e.g. "Oversized Acid Wash Tee", "Black Denim")...</span>
                  )}
                </p>
                {liveTranscript && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2 animate-in fade-in" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-neutral-400">
                  Tap when finished speaking:
                </span>
                <button
                  type="button"
                  onClick={stopVoiceSession}
                  className="px-4 py-1.5 rounded-full bg-white text-black font-mono text-xs uppercase tracking-wider font-black hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Done Speaking</span>
                </button>
              </div>
            </div>
          )}

          {/* Processing Audio Indicator */}
          {isProcessingAudio && (
            <div className="mt-3 flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-900 border border-white/10 text-white font-mono text-xs animate-in fade-in">
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
              <span>Transcribing your speech...</span>
            </div>
          )}

          {/* Quick Voice / Trending Spoken Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--accent)]" /> Quick:
            </span>
            {TRENDING_VOICE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  setLiveTranscript(tag);
                }}
                className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[var(--bg-alt)] hover:bg-white hover:text-black border border-[var(--line)] hover:border-white text-[var(--text-dim)] hover:font-bold transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
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
          ) : (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest">
                  {loading ? 'Searching drops...' : `Found ${results.length} results`}
                </h4>
                {loading && <div className="spinner w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
              </div>

              <div className="flex flex-col gap-4">
                {results.map((product) => {
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

                {!loading && results.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="font-mono text-sm text-[var(--text-dim)]">No streetwear pieces match &quot;{query}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
