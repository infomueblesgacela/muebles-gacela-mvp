import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Trash2, ArrowLeft, Sparkles, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const GACIBOT_WEBHOOK_URL = 'https://n8n-ock0.srv1932813.hstgr.cloud/webhook/gacibot';

const SUGGESTED_QUESTIONS = [
  '¿Qué mesas de luz tienen en Línea Clásica?',
  '¿Qué medidas tiene la Cómoda ALBA?',
  '¿Tienen escritorios para home office o gamer?',
  '¿Qué módulos de cocina tienen disponibles?',
  '¿Dónde queda la fábrica y showroom?',
  '¿Cómo hago para armar un mueble si compré uno?',
];

export const GaciBotTester: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>(() => 'session_' + Math.random().toString(36).substring(2, 9));
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: '¡Hola! Qué bueno que nos contactes. Soy Gaci, tu asesor de Muebles Gacela. Contame, ¿qué espacio estás buscando renovar o qué mueble te gustaría conocer?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

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
        botReply = '⚠️ Hubo un error al comunicar con el servidor. Código: ' + response.status;
      }

      // Si empieza con '=', quitarlo
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
        text: '❌ Error de conexión con el servidor. Verificá que el workflow esté publicado.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setSessionId('session_' + Math.random().toString(36).substring(2, 9));
    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: 'Chat reiniciado. ¿Qué consulta querés hacer sobre los muebles?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-brand-primary flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 font-sans">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl border border-brand-card/40 flex flex-col h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="bg-brand-primary text-brand-bg px-6 py-4 flex items-center justify-between border-b border-brand-support/20">
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white mr-1"
              title="Volver a la tienda"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-brand-accent flex items-center justify-center shadow-inner">
                <Bot size={22} className="text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-brand-primary rounded-full" />
            </div>
            <div>
              <h1 className="font-godber uppercase text-base tracking-wider leading-tight">GaciBot</h1>
              <p className="text-[11px] text-white/70 font-clofie">Asesor oficial de Muebles Gacela</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all font-clofie font-semibold"
            >
              <RefreshCw size={13} />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="bg-[#FAF8F5] px-6 py-2.5 border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-brand-support font-bold shrink-0 flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Sparkles size={12} className="text-brand-accent" />
            Preguntas Rápidas:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="bg-white border border-gray-200 hover:border-brand-accent text-brand-primary/80 hover:text-brand-primary px-3 py-1 rounded-full whitespace-nowrap transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-[#FAF8F5]/50 to-white">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-brand-support text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-brand-primary text-brand-bg rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  <div className="space-y-1">
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (!line.trim()) return <div key={lIdx} className="h-2" />;
                      
                      // Process links in line (detect both https://... and markdown [text](url))
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
                                  className="inline-flex items-center gap-1 text-brand-accent hover:text-brand-support font-semibold underline underline-offset-2 break-all my-0.5 bg-brand-bg/40 px-1.5 py-0.5 rounded transition-colors"
                                >
                                  {part}
                                </a>
                              );
                            }
                            // Bold formatting **text**
                            const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
                            return boldParts.map((bPart, bIdx) => {
                              if (bPart.startsWith('**') && bPart.endsWith('**')) {
                                return <strong key={bIdx} className="font-bold text-brand-primary">{bPart.slice(2, -2)}</strong>;
                              }
                              return <span key={bIdx}>{bPart}</span>;
                            });
                          })}
                        </p>
                      );
                    })}
                  </div>
                  <span
                    className={`block text-[10px] mt-2 ${
                      msg.sender === 'user' ? 'text-white/50 text-right' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <User size={16} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-gray-500 text-xs italic"
            >
              <div className="w-8 h-8 rounded-full bg-brand-support text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-gray-500 font-clofie not-italic">Gaci está escribiendo...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí una pregunta para poner a prueba a Gaci..."
            disabled={loading}
            className="flex-1 bg-[#FAF8F5] border border-gray-200 focus:border-brand-accent rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Send size={16} />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
