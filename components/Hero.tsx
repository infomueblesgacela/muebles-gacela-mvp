import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[500px] w-full flex items-center justify-center bg-[#ECE2D2] overflow-hidden">
      
      {/* Background Image / Minimalist Japandi Style */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero.webp" 
          alt="Gacela Interior Design" 
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay para garantizar alto contraste entre el texto oscuro y la imagen fotográfica */}
        <div className="absolute inset-0 bg-[#ECE2D2]/40"></div>
      </div>
      
      {/* Hero Content - Centered */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
      >
        <p className="font-outersans font-thin text-[14px] tracking-[0.4em] uppercase mb-4 text-[#2B341F]">
          Diseños que combinan elegancia y sostenibilidad
        </p>
        
        <h1 className="font-godber text-4xl md:text-6xl font-normal tracking-[0.05em] uppercase text-[#2B341F] mb-8 max-w-4xl leading-tight">
          El mueble ideal para <br className="hidden md:block"/> transformar tu hogar
        </h1>
        
        <Link to="/productos" onClick={() => window.scrollTo(0, 0)} className="mt-2 border border-[#2B341F] text-[#2B341F] px-12 py-3 rounded-[4px] hover:bg-[#2B341F] hover:text-[#ECE2D2] transition-colors duration-500 uppercase tracking-widest font-clofie font-bold italic text-[14px] inline-block">
          Ver Portfolio
        </Link>
      </motion.div>
      
    </section>
  );
};

export default Hero;
