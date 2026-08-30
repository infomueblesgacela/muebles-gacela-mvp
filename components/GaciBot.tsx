import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, MessageCircle, Sparkles, RefreshCw, ChevronDown, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const GACIBOT_WEBHOOK_URL = 'https://n8n-ock0.srv1932813.hstgr.cloud/webhook/gacibot';

const SUGGESTED_CHIPS = [
  '¿Qué botineros tienen?',
  '¿Medidas de la Cómoda ALBA?',
  '¿Cómo armo mi mueble?',
  'Horarios y showroom',
];

export const GaciBot: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => 'web_' + Math.random().toString(36).substring(2, 9));
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Qué bueno que nos contactes. Soy Gaci, el asistente virtual de Muebles Gacela. Contame, ¿qué espacio estás buscando renovar o qué mueble te gustaría conocer?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer para el mensaje teaser a los 5s y ocultarlo a los 30s
  useEffect(() => {
    // Si ya interactuó o abrió el chat, no mostrar el teaser
    if (hasInteracted || isOpen) return;

    const showTimer = setTimeout(() => {
      setShowTeaser(true);
    }, 5000); // Aparece a los 5 segundos

    const hideTimer = setTimeout(() => {
      setShowTeaser(false);
    }, 35000); // Desaparece 30 segundos después (a los 35s total)

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [hasInteracted, isOpen]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [messages, loading, isOpen]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowTeaser(false);
    setHasInteracted(true);
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    setHasInteracted(true);
    setShowTeaser(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch(GACIBOT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText, sessionId: sessionId }),
      });

      let botReply = '';
      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          botReply = data.reply || data.output || data.text || text;
        } catch {
          botReply = text;
        }
      } else {
        botReply = '⚠️ Hubo un error al comunicar con el servidor. Por favor intentá de nuevo.';
      }

      if (botReply.startsWith('=')) {
        botReply = botReply.substring(1).trim();
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply || 'Perdón, no pude procesar la respuesta en este momento.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '❌ No pudimos conectar con el servidor en este momento. Por favor verificá tu conexión.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setSessionId('web_' + Math.random().toString(36).substring(2, 9));
    setMessages([
      {
        id: 'reset_' + Date.now(),
        sender: 'bot',
        text: 'Chat reiniciado. ¿Qué consulta querés hacer sobre los muebles o armado?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Ocultar la burbuja si estamos en el tester específico
  if (location.pathname === '/test-gacibot') {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans">
      {/* Teaser Popup Speech Bubble (Aparece a los 5s y se va a los 30s) */}
      <AnimatePresence>
        {showTeaser && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[290px] sm:w-[320px] bg-white rounded-2xl shadow-2xl p-4 border border-brand-card/30 backdrop-blur-md cursor-pointer hover:border-brand-accent/60 transition-all group"
            onClick={handleOpenChat}
          >
            {/* Close button for teaser */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTeaser(false);
                setHasInteracted(true);
              }}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={12} />
            </button>

            <div className="flex items-start gap-3">
              <div className="relative shrink-0 mt-0.5">
                <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Bot size={20} />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="pr-4">
                <p className="font-bold text-xs text-brand-primary flex items-center gap-1 uppercase tracking-wider">
                  GaciBot
                  <span className="text-[10px] lowercase text-emerald-600 font-normal bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">online</span>
                </p>
                <p className="text-xs text-gray-700 mt-1 leading-snug">
                  ¡Hola! 👋 Soy <strong>Gaci</strong>, asistente oficial de Muebles Gacela. ¿Buscás medidas, catálogo o ayuda con el armado? ¡Hacé clic acá para chatear!
                </p>
              </div>
            </div>

            {/* Flechita apuntando a la burbuja */}
            <div className="absolute -bottom-2 right-7 w-4 h-4 bg-white transform rotate-45 border-r border-b border-brand-card/30" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burbujita Flotante Disparadora */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            handleOpenChat();
          }
        }}
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center border-2 border-white transition-all duration-300 ${
          isOpen ? 'bg-brand-primary text-white' : 'bg-brand-support text-white'
        }`}
        aria-label="Abrir asistente virtual GaciBot"
      >
        {/* Ping de notificación animado si aún no interactuó */}
        {!hasInteracted && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-accent border-2 border-white"></span>
          </span>
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <ChevronDown size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <Bot size={28} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Ventana de Chat Flotante */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[92vw] sm:w-[390px] h-[560px] max-h-[82vh] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-brand-card/40"
          >
            {/* Header */}
            <div className="bg-brand-primary text-brand-bg px-5 py-3.5 flex items-center justify-between border-b border-brand-support/20 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-brand-accent flex items-center justify-center shadow-inner">
                    <Bot size={22} className="text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-brand-primary rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide leading-tight flex items-center gap-1.5">
                    GaciBot
                    <span className="text-[10px] text-emerald-400 font-normal">● Online</span>
                  </h3>
                  <p className="text-[11px] text-white/70">Asistente oficial Muebles Gacela</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  title="Reiniciar chat"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  title="Cerrar chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chips de Preguntas Rápidas */}
            <div className="bg-[#FAF8F5] px-3.5 py-2 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar shrink-0">
              <span className="text-brand-support font-bold shrink-0 flex items-center gap-0.5 text-[10px] uppercase tracking-wider">
                <Sparkles size={11} className="text-brand-accent" />
              </span>
              {SUGGESTED_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                  className="bg-white border border-gray-200 hover:border-brand-accent text-brand-primary/80 hover:text-brand-primary px-2.5 py-1 rounded-full whitespace-nowrap transition-all text-[11px] shrink-0 disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Lista de Mensajes */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#FAF8F5]/50 to-white"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-brand-support text-white flex items-center justify-center shrink-0 mt-1 shadow-xs text-xs">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-brand-primary text-brand-bg rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    <div className="space-y-1">
                      {msg.text.split('\n').map((line, lIdx) => {
                        if (!line.trim()) return <div key={lIdx} className="h-1.5" />;

                        // Detección de URLs
                        const urlRegex = /(https?:\/\/[^\s\)]+)/g;
                        const parts = line.split(urlRegex);

                        return (
                          <p key={lIdx} className={line.startsWith('* ') || line.startsWith('• ') ? 'pl-2' : ''}>
                            {parts.map((part, pIdx) => {
                              if (part.match(urlRegex)) {
                                return (
                                  <a
                                    key={pIdx}
                                    href={part}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-brand-accent hover:text-brand-support font-semibold underline underline-offset-2 break-all my-0.5 bg-brand-bg/60 px-1 py-0.5 rounded transition-colors"
                                  >
                                    {part}
                                  </a>
                                );
                              }

                              // Bold parsing **text**
                              const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
                              return boldParts.map((bPart, bIdx) => {
                                if (bPart.startsWith('**') && bPart.endsWith('**')) {
                                  return (
                                    <strong key={bIdx} className="font-bold text-brand-primary">
                                      {bPart.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return <span key={bIdx}>{bPart}</span>;
                              });
                            })}
                          </p>
                        );
                      })}
                    </div>
                    <span
                      className={`block text-[9px] mt-1.5 ${
                        msg.sender === 'user' ? 'text-white/50 text-right' : 'text-gray-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-brand-accent text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <User size={14} />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Indicador de escritura animado */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-gray-500 text-xs italic"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-support text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot size={15} />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="ml-1 text-gray-500 text-xs not-italic">Gaci está escribiendo...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu consulta..."
                disabled={loading}
                className="flex-1 bg-[#FAF8F5] border border-gray-200 focus:border-brand-accent rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-sm flex items-center justify-center gap-1 shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GaciBot;
