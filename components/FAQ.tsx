
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, ShieldCheck, Sparkles, Sprout, MessageCircle } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#D9CDB8]/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-lg md:text-xl font-godber font-normal uppercase tracking-[0.05em] transition-colors ${isOpen ? 'text-brand-support' : 'text-brand-primary group-hover:text-brand-support'}`}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-brand-support ml-4 shrink-0"
        >
          <ChevronDown size={24} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-[#594A42] leading-relaxed font-clofie font-light text-lg whitespace-pre-line pl-2 md:pl-0">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ: React.FC = () => {
  const faqData = [
    {
      category: "Sobre Nosotros y Calidad",
      icon: Users,
      questions: [
        {
          question: "¿Son fabricantes directos?",
          answer: "Sí, somos una potencia industrial con base en Río Cuarto, Córdoba. Contamos con una planta de producción equipada con tecnología de punta y 40 años de trayectoria fabricando muebles listos para armar."
        },
        {
          question: "¿Puedo personalizar los colores y telas?",
          answer: "Nuestros diseños están estandarizados para garantizar eficiencia y accesibilidad. Sin embargo, cada línea ofrece una paleta de colores (como Roble, Blanco o Gris) seleccionada bajo estándares de tendencia global para que combines como quieras."
        },
        {
          question: "¿Cómo se entregan los muebles?",
          answer: "Todos nuestros productos se entregan bajo el concepto \"Ready to Assemble\" (listos para armar) en cajas compactas que facilitan el traslado y protegen cada pieza."
        },
        {
          question: "¿Tienen stock inmediato o es por pedido?",
          answer: "Mantenemos un flujo de stock constante para nuestros productos, asegurando una entrega ágil. Podés consultar la disponibilidad en tiempo real mediante nuestro buscador inteligente en la web."
        }
      ]
    },
    {
      category: "Garantía y Soporte",
      icon: ShieldCheck,
      questions: [
        {
          question: "¿Qué garantía tienen los productos?",
          answer: "Todos los muebles Gacela cuentan con una garantía de un (1) año por defectos de fabricación y/o vicios en los materiales, respaldada por nuestro control de calidad bajo normas certificadas."
        },
        {
          question: "¿Qué cubre exactamente la garantía?",
          answer: "Cubre fallas de origen en piezas, herrajes y materiales. No cubre daños por errores de montaje externos, humedad excesiva o maltrato. Es vital seguir el Instructivo de Armado oficial."
        },
        {
          question: "¿Cómo gestiono un reclamo o servicio técnico?",
          answer: "Es muy fácil. Podés escribirle a GaciBot por WhatsApp. El asistente te pedirá una foto de la pieza afectada y, si detecta una falla de origen, dispararemos una orden de reposición inmediata."
        }
      ]
    },
    {
      category: "Asesoramiento y Experiencia 4.0",
      icon: Sparkles,
      questions: [
        {
          question: "¿Me ayudan a diseñar mi ambiente?",
          answer: "¡Claro! Escribinos y un asesor experto te ayudará a proyectar el ambiente en 3D o en plano para que veas cómo quedará antes de comprar."
        },
        {
          question: "¿Dónde puedo ver los muebles en persona?",
          answer: "Podés encontrarnos en nuestra planta industrial en Sobremonte 3236, Río Cuarto , o en la red de distribuidores oficiales y grandes tiendas de retail en todo el país."
        },
        {
          question: "¿Son seguras las camas para niños?",
          answer: "Absolutamente. Nuestra Línea Infantil está diseñada bajo estrictas normas de seguridad y ergonomía, utilizando materiales sostenibles que cuidan la salud de tu familia y el medio ambiente."
        }
      ]
    },
    {
      category: "Sustentabilidad y Futuro",
      icon: Sprout,
      questions: [
        {
          question: "¿Qué es el programa \"Gacela Sustentable\"?",
          answer: "Es nuestro compromiso con el medio ambiente. Optimizamos el corte de placas para reducir el desperdicio al mínimo y utilizamos materiales de origen sostenible en toda nuestra cadena productiva."
        },
        {
          question: "¿Dónde consigo productos sustentables?",
          answer: "Toda la línea Gacela 2026 está bajo el pilar de diseño sostenible. Al comprar un mueble Gacela, estás eligiendo industria nacional que respeta el ecosistema."
        }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FAF8F5] pt-32 pb-24 min-h-screen"
    >
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        <div className="mb-20 text-center">
          <h2 className="text-[14px] font-thin tracking-[0.5em] uppercase text-brand-support mb-4 font-outersans">Centro de Ayuda</h2>
          <h1 className="text-4xl md:text-7xl font-normal tracking-[0.05em] uppercase text-brand-primary font-godber leading-tight">
            Preguntas <br/><span className="text-brand-support">Frecuentes</span>
          </h1>
          <p className="mt-8 text-lg text-[#8C7A6B] font-clofie font-light max-w-2xl mx-auto">
            Todo lo que necesitás saber sobre la experiencia Gacela.
          </p>
        </div>

        <div className="space-y-16">
          {faqData.map((block, blockIdx) => (
            <motion.div 
              key={blockIdx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-brand-support/10">
                  <block.icon className="text-brand-support" size={24} />
                </div>
                <h3 className="text-xl md:text-2xl font-godber font-normal text-brand-primary uppercase tracking-[0.05em]">{block.category}</h3>
              </div>
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-[#D9CDB8]/20">
                <div className="space-y-1">
                  {block.questions.map((q, qIdx) => (
                    <FAQItem key={qIdx} question={q.question} answer={q.answer} />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating Help Badge */}
        <div className="mt-32 text-center p-12 bg-white rounded-[3rem] border border-[#D9CDB8]/30 shadow-xl overflow-hidden relative group">
          <div className="absolute -right-20 -top-20 text-[200px] font-godber text-brand-support/5 select-none transition-transform group-hover:rotate-12 duration-1000">?</div>
          <h4 className="text-2xl font-godber font-normal text-brand-primary uppercase mb-4 tracking-[0.05em] relative z-10">¿Todavía tenés dudas?</h4>
          <p className="text-lg text-[#8C7A6B] font-clofie font-light mb-8 relative z-10">Nuestro equipo de soporte humano y GaciBot están listos para ayudarte.</p>
          <a 
            href="https://wa.me/5493584329079" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-full font-clofie font-bold italic text-[14px] uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-[#25D366]/20 relative z-10"
          >
            <MessageCircle size={20} />
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default FAQ;
