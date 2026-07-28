
import React from 'react';
import { motion } from 'framer-motion';
import { LeafIcon, RecycleIcon, ShieldCheckIcon, RtaIcon } from './Icons';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center text-center px-4 group"
    >
      <div className="w-16 h-16 mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-[14px] tracking-[0.4em] uppercase text-brand-primary mb-3 font-outersans font-thin">
        {title}
      </h3>
      <p className="text-lg text-[#594A42] font-clofie font-light leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </motion.div>
  );
};

const QualitySustainability: React.FC = () => {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-left mb-16">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[14px] font-thin tracking-[0.4em] uppercase text-brand-support mb-4 font-outersans"
          >
            Compromiso Gacela
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-godber font-normal tracking-[0.05em] uppercase text-brand-primary leading-tight"
          >
            CALIDAD Y SOSTENIBILIDAD
          </motion.h3>
        </div>

        {/* Grilla de Características */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
          <Feature 
            icon={<img src="/images/iso.png" alt="Certificación ISO 9001" className="max-h-16 w-auto object-contain" />} 
            title="ISO 9001" 
            delay={0.1}
            description="Cumplimos con estándares internacionales que garantizan la excelencia en cada proceso de fabricación." 
          />
          <Feature 
            icon={<img src="/images/eco.png" alt="Eco-friendly" className="max-h-16 w-auto object-contain" />} 
            title="ECO-FRIENDLY" 
            delay={0.2}
            description="Nuestro compromiso ambiental nos lleva a utilizar procesos de bajo impacto y acabados no tóxicos." 
          />
          <Feature 
            icon={<img src="/images/rta.png" alt="Sistema RTA" className="max-h-16 w-auto object-contain" />} 
            title="SISTEMA RTA" 
            delay={0.3}
            description="Diseño inteligente 'Ready to Assemble' que optimiza la logística y reduce la huella de carbono." 
          />
          <Feature 
            icon={<img src="/images/materiales.png" alt="Materiales Nobles" className="max-h-16 w-auto object-contain" />} 
            title="MATERIALES NOBLES" 
            delay={0.4}
            description="Utilizamos maderas de fuentes renovables y materiales reciclables para muebles que duran toda la vida." 
          />
        </div>
      </div>
    </section>
  );
};

export default QualitySustainability;
