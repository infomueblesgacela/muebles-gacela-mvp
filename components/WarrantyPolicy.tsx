
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Award, CheckCircle2, AlertTriangle, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const WarrantyPolicy: React.FC = () => {
  const sections = [
    {
      title: "Garantía de Productos",
      content: "MUEBLES GACELA SRL garantiza sus productos por el lapso de un (1) año a partir de la fecha de compra, cubriendo defectos de fabricación y/o vicios en los materiales.\n\nPara hacer efectiva la garantía, es imprescindible presentar la factura o ticket de compra emitido por un vendedor o distribuidor oficial."
    },
    {
      title: "Alcance de la Cobertura",
      content: "La garantía se limita estrictamente a fallas originadas en la producción o materiales defectuosos. Gacela respaldará aquellas piezas que presenten fallas de origen o daños derivados de un uso adecuado, siguiendo los estándares de carga y cuidado del mueble."
    },
    {
      title: "Cumplimiento del Instructivo",
      content: "La garantía solo será válida si el producto ha sido ensamblado siguiendo estrictamente los pasos detallados en el Instructivo de Armado oficial (físico o digital via GaciBot). Los errores de montaje por no seguir la secuencia técnica invalidan el reclamo."
    },
    {
      title: "Exclusiones Generales",
      content: "Esta garantía no tendrá validez en los siguientes casos:\n\n• Daños causados por factores climáticos o naturales (humedad excesiva, exposición directa al sol, inundaciones).\n• Errores de montaje, golpes durante el traslado por terceros o maltrato del producto.\n• Desgaste natural por el uso intensivo o limpiezas con productos abrasivos/químicos no recomendados."
    },
    {
      title: "Gestión de Reposición",
      content: "En caso de detectarse una falla técnica, la reposición de la pieza podrá gestionarse en la tienda de adquisición. Si el plazo de la tienda expiró pero está dentro del año de fábrica, contactate con nuestro Centro de Atención o presentate en nuestra planta industrial."
    },
    {
      title: "Exclusiones Específicas",
      content: "• Humedad: El contacto directo con agua anula la garantía de las placas de MDP/MDF.\n• Sobrecarga: El pandeo de estantes por exceder el peso máximo no se considera falla de fabricación.\n• Modificaciones: Cualquier perforación o modificación estructural fuera del manual anula la garantía."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FAF8F5] pt-32 pb-24"
    >
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        <div className="mb-20 text-left border-b border-[#D9CDB8] pb-12">
          <h2 className="text-[14px] font-thin tracking-[0.4em] uppercase text-brand-support mb-4 font-outersans">Compromiso Gacela</h2>
          <h1 className="text-4xl md:text-6xl font-normal tracking-[0.05em] uppercase text-brand-primary font-godber leading-tight">
            Política de <br/><span className="text-brand-support">Garantía</span>
          </h1>
          
          <p className="mt-12 text-xl md:text-2xl text-[#594A42] font-clofie font-light leading-relaxed max-w-3xl italic">
            "En Muebles Gacela, respaldamos la precisión de nuestra fabricación industrial y la calidad de nuestros materiales."
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-base text-[#8C7A6B] font-clofie font-light border-t border-[#D9CDB8]/30 pt-12">
            <div className="space-y-4">
              <p className="font-clofie font-bold italic text-brand-primary text-base uppercase tracking-widest">Centro de Atención</p>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-support shrink-0" />
                <p>Planta Industrial: Sobremonte 3236,<br/>Río Cuarto, Córdoba</p>
              </div>
            </div>
            <div className="space-y-3 md:text-right flex flex-col md:items-end">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-support" />
                <p>+54 358 4622342</p>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-brand-support" />
                <p>WhatsApp Post Venta: +54 9 358 4329079</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-4 sticky top-40 h-fit">
            <div className="bg-white p-8 rounded-3xl border border-[#D9CDB8]/30 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-5 h-5 text-brand-support" />
                <h4 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40">Garantía</h4>
              </div>
              <nav className="space-y-6">
                {sections.map((section, idx) => (
                  <a 
                    key={idx} 
                    href={`#section-${idx + 1}`}
                    className="flex items-center group text-[11px] uppercase tracking-[0.2em] text-[#8C7A6B] hover:text-brand-support transition-all font-clofie font-bold italic"
                  >
                    <span className="w-6 text-brand-support/40 group-hover:text-brand-support transition-colors">{(idx + 1).toString().padStart(2, '0')}</span>
                    <span className="group-hover:translate-x-1 transition-transform">{section.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="space-y-24 mb-32">
              {sections.map((section, idx) => (
                <motion.section 
                  key={idx}
                  id={`section-${idx + 1}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="scroll-mt-40 group"
                >
                  <div className="relative">
                    <span className="absolute -left-12 -top-12 text-9xl font-godber text-brand-support/5 select-none transition-colors group-hover:text-brand-support/10">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="relative">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-px w-8 bg-brand-support/30"></div>
                        <h3 className="text-3xl font-godber font-normal text-brand-primary uppercase tracking-[0.05em]">{section.title}</h3>
                      </div>
                      <div className="text-[#594A42] leading-relaxed font-clofie font-light text-xl whitespace-pre-line pl-12 border-l border-[#D9CDB8]/30">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </motion.section>
              ))}
            </div>

            {/* Final CTA */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-brand-primary text-brand-bg p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                 <AlertTriangle size={120} />
              </div>
              <div className="relative z-10 text-center md:text-left">
                <h4 className="text-2xl md:text-3xl font-godber font-normal uppercase tracking-[0.05em] mb-6 leading-tight">
                  ¿Tuviste un problema <br/>con una pieza?
                </h4>
                <Link 
                  to="/contacto" 
                  className="inline-flex items-center gap-4 bg-brand-support text-white px-8 py-5 rounded-2xl font-clofie font-bold italic text-[14px] uppercase tracking-widest hover:bg-[#856141] transition-all shadow-lg hover:shadow-brand-support/20 group/btn"
                >
                  Contactanos ahora
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WarrantyPolicy;
