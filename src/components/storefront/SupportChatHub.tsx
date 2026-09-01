'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { usePathname } from 'next/navigation';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function SupportChatHub() {
  const pathname = usePathname();
  const [activeMode, setActiveMode] = useState<'ai' | 'whatsapp'>('ai');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "Hey there! 👋 I'm your Inkwave AI Stylist.\n\nLooking for something specific? E.g. *\"Show me some t-shirts under ₹100\"* or *\"I need some new jeans.\"*"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide widget completely on product detail and checkout pages
  const isProductOverview = pathname.startsWith('/product');
  const isCheckoutPage = pathname.startsWith('/checkout');

  useEffect(() => {
    if (isProductOverview || isCheckoutPage) {
      setIsOpen(false);
    }
  }, [pathname, isProductOverview, isCheckoutPage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (isProductOverview || isCheckoutPage) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });

      const data = await res.json();
      
      if (data.reply) {
        const botMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Oops, I'm having trouble connecting right now. Try again later!" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const triggerWhatsAppRedirect = () => {
    const phoneNumber = '918160321453';
    const messageText = encodeURIComponent('Hello Inkwave! I have a query about your collection.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${messageText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFabClick = () => {
    if (activeMode === 'whatsapp') {
      triggerWhatsAppRedirect();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[98] flex flex-col items-end gap-3.5">
      
      {/* Mode Switcher Pill Slider (Only show when chat panel is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="flex items-center bg-[var(--bg-card)] border border-[var(--line)] p-1 rounded-full shadow-2xl font-mono text-[9px] uppercase tracking-wider font-bold gap-0.5 relative overflow-hidden backdrop-blur-md"
          >
            <button
              onClick={() => setActiveMode('ai')}
              className={`px-3 py-1.5 rounded-full transition-colors relative z-10 ${
                activeMode === 'ai' ? 'text-[var(--bg)] font-black' : 'text-[var(--text-dim)] hover:text-white'
              }`}
            >
              {activeMode === 'ai' && (
                <motion.span
                  layoutId="activePillGlow"
                  className="absolute inset-0 bg-[var(--accent)] rounded-full -z-10 shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              AI Stylist
            </button>
            <button
              onClick={() => setActiveMode('whatsapp')}
              className={`px-3 py-1.5 rounded-full transition-colors relative z-10 ${
                activeMode === 'whatsapp' ? 'text-white font-black' : 'text-[var(--text-dim)] hover:text-white'
              }`}
            >
              {activeMode === 'whatsapp' && (
                <motion.span
                  layoutId="activePillGlow"
                  className="absolute inset-0 bg-[#25D366] rounded-full -z-10 shadow-[0_0_8px_rgba(37,211,102,0.3)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              WhatsApp
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Stylist Chatbot Panel */}
      <AnimatePresence>
        {isOpen && activeMode === 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[80vh] rounded-none flex flex-col overflow-hidden shadow-2xl border border-[var(--line)] mb-2"
            style={{ 
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none flex items-center justify-center bg-[var(--accent)] text-[var(--bg)] shadow-md font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-mono uppercase tracking-wider" style={{ color: 'var(--text)' }}>Inkwave Stylist</h3>
                  <p className="text-xs flex items-center gap-1 font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
                    <span className="w-2 h-2 rounded-none bg-green-500 inline-block animate-pulse"></span>
                    AI Assistant
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Switch to WhatsApp Directly from inside Chat Header */}
                <button
                  onClick={() => { setActiveMode('whatsapp'); setIsOpen(false); triggerWhatsAppRedirect(); }}
                  className="p-2 rounded-none bg-emerald-500/10 hover:bg-emerald-500/20 text-[#25D366] transition-colors cursor-pointer mr-1"
                  title="Switch to WhatsApp Support"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-none hover:bg-[var(--bg-alt)] transition-colors text-[var(--text-dim)] hover:text-[var(--text)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm scrollbar-hide">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-[var(--accent)] text-white' 
                      : 'bg-white text-[var(--accent)] border border-[var(--accent)]/20'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-none text-sm ${
                    msg.role === 'user'
                      ? 'bg-[var(--bg-alt)] text-[var(--text)]'
                      : 'bg-[var(--bg)] border border-[var(--line)] text-[var(--text)]'
                  }`}>
                    <ReactMarkdown 
                      components={{
                        a: ({node, ...props}) => <a className="text-[var(--accent)] underline font-bold" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-[var(--accent)]" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 max-w-[85%]"
                >
                  <div className="w-8 h-8 rounded-none flex items-center justify-center shrink-0 bg-[var(--accent)] text-[var(--bg)]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-none bg-[var(--bg)] border border-[var(--line)] flex items-center gap-1">
                    <motion.div className="w-1.5 h-1.5 rounded-none bg-[var(--text-dim)]" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 rounded-none bg-[var(--text-dim)]" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 rounded-none bg-[var(--text-dim)]" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[var(--bg)] border-t border-[var(--line)]">
              <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-[var(--bg-alt)] border border-[var(--line)] rounded-none pl-4 pr-12 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-dim)] font-mono"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1 top-1 bottom-1 aspect-square rounded-none flex items-center justify-center bg-[var(--accent)] text-[var(--bg)] disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Action Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleFabClick}
        className="w-14 h-14 rounded-none shadow-2xl flex items-center justify-center transition-shadow duration-300 border border-[var(--line)] cursor-pointer relative"
        style={{ 
          background: activeMode === 'ai' ? 'var(--accent)' : '#25D366', 
          color: activeMode === 'ai' ? 'var(--bg)' : 'white',
          boxShadow: activeMode === 'ai' ? '0 10px 25px rgba(255,255,255,0.05)' : '0 10px 25px rgba(37,211,102,0.3)'
        }}
        aria-label={activeMode === 'ai' ? 'Toggle AI Stylist' : 'Chat on WhatsApp'}
      >
        {/* Pulsing ring in WhatsApp mode */}
        {activeMode === 'whatsapp' && (
          <span className="absolute inset-0 rounded-none bg-[#25D366]/30 animate-ping opacity-75 pointer-events-none" />
        )}

        <AnimatePresence mode="wait">
          {isOpen && activeMode === 'ai' ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key={activeMode}
              initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
            >
              {activeMode === 'ai' ? (
                <MessageSquare className="w-6 h-6" />
              ) : (
                <svg
                  className="w-7 h-7 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.528 2.015 14.077.99 11.52.99c-5.439 0-9.861 4.37-9.865 9.801-.001 1.73.473 3.41 1.37 4.861L2.01 21.99l6.18-1.597zM17.06 14.18c-.282-.143-1.67-.823-1.929-.918-.259-.095-.448-.143-.637.143-.19.285-.733.918-.899 1.107-.166.19-.333.214-.616.071-.282-.143-1.194-.44-2.274-1.405-.84-.75-1.407-1.676-1.572-1.962-.166-.285-.018-.44.124-.581.127-.127.282-.333.424-.5.143-.166.19-.285.285-.476.095-.19.047-.357-.024-.5-.071-.143-.637-1.536-.873-2.107-.23-.554-.485-.48-.637-.48-.164-.002-.353-.002-.542-.002-.19 0-.498.071-.76.357-.26.285-1.02 1.001-1.02 2.441 0 1.439 1.045 2.829 1.187 3.02.143.19 2.056 3.14 4.979 4.402.695.3 1.237.479 1.661.614.698.221 1.334.19 1.837.114.56-.085 1.67-.683 1.905-1.343.235-.66.235-1.226.166-1.343-.07-.117-.259-.19-.542-.333z" />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
    </div>
  );
}
