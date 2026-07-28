
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';

interface Message {
    id: string;
    type: 'bot' | 'user';
    text: string;
    timestamp: Date;
}

const GACELA_CONTEXT = {
    address: "Sobremonte 3236, San Fernando",
    workingHours: "Lunes a Viernes de 9:00 a 18:00hs y Sábados de 9:00 a 13:00hs",
    whatsapp: "+54 11 1234-5678",
    assemblyGuideLink: "en la sección de Guías de Armado de nuestra web"
};

const GaciBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [userName, setUserName] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addBotMessage("¡Hola! Soy Gaci, tu asistente de experiencia de Muebles Gacela. Contame, ¿con quién tengo el gusto de hablar?");
        }
    }, [isOpen]);

    const addBotMessage = (text: string) => {
        setIsTyping(true);
        // Simular tiempo de escritura basado en la longitud del texto
        const delay = Math.min(Math.max(text.length * 20, 1000), 2500);
        setTimeout(() => {
            const newMessage: Message = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'bot',
                text,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, newMessage]);
            setIsTyping(false);
        }, delay);
    };

    const extractName = (text: string): string | null => {
        const patterns = [
            /(?:me llamo|soy|mi nombre es)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i,
            /^(?:hola,?\s+)?([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)$/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) return match[1];
        }
        return null;
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue.trim();
        const newUserMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'user',
            text: userText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue('');

        // Lógica de respuesta
        if (!userName) {
            const name = extractName(userText);
            if (name) {
                setUserName(name);
                addBotMessage(`¡Mucho gusto, ${name}! Ya te anoté. ¿En qué puedo ayudarte con tu mueble Gacela hoy?`);
            } else {
                // Si no detectamos un patrón claro pero es la primera interacción, asumimos que es el nombre directamente
                if (userText.split(' ').length <= 2) {
                    setUserName(userText);
                    addBotMessage(`¡Mucho gusto, ${userText}! Decime, ¿en qué puedo ayudarte hoy para que tu experiencia con nosotros sea excelente?`);
                } else {
                    addBotMessage("Perdoná, no llegué a captar tu nombre. ¿Cómo te llamás? Así puedo atenderte mejor.");
                }
            }
        } else {
            processResponse(userText);
        }
    };

    const processResponse = (text: string) => {
        const lowerText = text.toLowerCase();

        // Dirección / Ubicación
        if (lowerText.includes('donde') || lowerText.includes('ubicacion') || lowerText.includes('direccion') || lowerText.includes('local') || lowerText.includes('fabrica')) {
            addBotMessage(`Nuestra fábrica y showroom principal están en ${GACELA_CONTEXT.address}. ¡Te esperamos para que veas la calidad de nuestros muebles en persona!`);
            setTimeout(() => addBotMessage("¿Te queda bien esa zona o buscás algún distribuidor más cercano?"), 1000);
            return;
        }

        // Horarios
        if (lowerText.includes('horario') || lowerText.includes('abierto') || lowerText.includes('cuando')) {
            addBotMessage(`Estamos para atenderte los ${GACELA_CONTEXT.workingHours}.`);
            setTimeout(() => addBotMessage("¿Tenías pensado venir a visitarnos hoy?"), 1000);
            return;
        }

        // Protocolo de Fricción
        if (lowerText.includes('dañado') || lowerText.includes('roto') || lowerText.includes('error') || lowerText.includes('problema') || lowerText.includes('falla')) {
            addBotMessage(`Lamento muchísimo que estés teniendo este inconveniente, ${userName}. Entiendo perfectamente tu frustración y quiero que sepas que para nosotros tu caso es prioridad absoluta.`);
            setTimeout(() => {
                addBotMessage("Por favor, contame más detalles. Voy a escalar esto de inmediato con nuestro equipo de calidad para darte una solución ahora mismo.");
            }, 2000);
            return;
        }

        // Consultas de Stock / Precios
        if (lowerText.includes('stock') || lowerText.includes('disponible') || lowerText.includes('precio') || lowerText.includes('cuanto sale')) {
            addBotMessage("Estoy consultando nuestra base de datos en tiempo real... Generalmente tenemos stock de todas nuestras líneas principales (Escandinava, Industrial, Kids).");
            setTimeout(() => {
                addBotMessage("¿De qué mueble específico necesitás saber disponibilidad? ¿En qué más puedo ayudarte para que tu experiencia sea perfecta?");
            }, 2500);
            return;
        }

        // Respuesta genérica persistente
        addBotMessage(`Entiendo lo que me decís, ${userName}. Dejame ver cómo podemos resolver esto de la mejor manera.`);
        setTimeout(() => {
            addBotMessage("¿Hay algo más en lo que pueda ayudarte para que tu experiencia sea perfecta?");
        }, 2000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* Botón Disparador */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-brand-support rounded-full shadow-2xl flex items-center justify-center p-0 overflow-hidden border-2 border-white"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="text-white w-8 h-8" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="logo"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="flex items-center justify-center"
                        >
                            <Bot className="text-white w-9 h-9" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Ventana de Chat */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[550px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-brand-support p-6 text-white flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Bot className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight font-serif">GaciBot</h3>
                                <p className="text-white/70 text-sm">Asistente de Experiencia</p>
                            </div>
                        </div>

                        {/* Mensajes */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-bg/30">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${msg.type === 'user'
                                            ? 'bg-brand-support text-brand-bg rounded-tr-none'
                                            : 'bg-white text-brand-primary border border-gray-100 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-100 flex items-center space-x-2">
                                        <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                                        <span className="text-xs text-brand-primary/60 italic">Gaci está escribiendo...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-4 bg-white border-t border-gray-100 flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Escribí tu mensaje..."
                                className="flex-1 bg-brand-bg/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark-green/20 outline-none transition-all"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="bg-brand-support text-brand-bg p-3 rounded-2xl disabled:opacity-50 transition-all shadow-lg"
                            >
                                <Send className="w-5 h-5" />
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GaciBot;
