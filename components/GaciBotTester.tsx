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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: '¡Hola! Soy Gaci, el asistente de Muebles Gacela. Estoy conectado en vivo a tu servidor n8n con Google Gemini 3.5 Flash. Haceme cualquier pregunta sobre nuestro catálogo, medidas o materiales para ponerme a prueba.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        body: JSON.stringify({ message: messageText }),
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
        botReply = '⚠️ Hubo un error al comunicar con el servidor de n8n. Código: ' + response.status;
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
        text: '❌ Error de conexión con el webhook de n8n. Verificá que el workflow esté publicado.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
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
    <div className="min-h-screen bg-[#F4EFE6] text-brand-primary flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-brand-card/40 flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-brand-primary text-brand-bg px-6 py-4 flex items-center justify-between border-b border-brand-support/20">
          <div className="flex items-center space-x-3">
            <Link
              to="/admin"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white mr-1"
              title="Volver al Admin"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="w-10 h-10 rounded-2xl bg-brand-accent flex items-center justify-center shadow-inner">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-godber uppercase text-lg tracking-wider">GaciBot Sandbox</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En Vivo n8n + Gemini 3.5
                </span>
              </div>
              <p className="text-[11px] text-white/60 font-clofie">Ambiente de Pruebas Privado para Muebles Gacela</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all font-clofie font-bold"
            >
              <RefreshCw size={14} />
              Limpiar Chat
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[#FAF8F5]/50 to-white">
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
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-brand-primary text-brand-bg rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
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
                <span className="ml-1 text-gray-500 font-clofie">Gaci está pensando la respuesta...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
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
