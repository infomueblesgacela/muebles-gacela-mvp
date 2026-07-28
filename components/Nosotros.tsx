import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import QualitySustainability from './QualitySustainability';

const Nosotros: React.FC = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const timelineItems = [
    {
      year: "1982",
      title: "NACIMIENTO",
      subtitle: "El sueño familiar en un pequeño taller",
      image: null
    },
    {
      year: "1991",
      title: "TECNOLOGÍA",
      subtitle: "Primera gran incorporación de maquinaria avanzada",
      image: "/images/1991.webp"
    },
    {
      year: "2011",
      title: "CALIDAD",
      subtitle: "Profesionalización del equipo y Certificación de Normas",
      image: "/images/2011.webp"
    },
    {
      year: "2016",
      title: "IDENTIDAD",
      subtitle: "Renovación de nuestra imagen e isologo hacia el futuro",
      image: "/images/2016.webp"
    },
    {
      year: "2026",
      title: "GACELA 4.0",
      subtitle: "Agilidad, diseño y tecnología al servicio del cliente",
      image: "/images/2025.webp"
    }
  ];

  const galleryImages = [
    { src: "/images/Galeria/Escena 315250 (blanco).webp", alt: "Escena 315250 (blanco)" },
    { src: "/images/Galeria/Escena 326270.webp", alt: "Escena 326270" },
    { src: "/images/Galeria/Escena 712152.webp", alt: "Escena 712152" },
    { src: "/images/Galeria/Escena Art 234093 (blanco).webp", alt: "Escena Art 234093 (blanco)" },
    { src: "/images/Galeria/Escena Art 326250.webp", alt: "Escena Art 326250" },
    { src: "/images/Galeria/Escena Art 334093.webp", alt: "Escena Art 334093" },
    { src: "/images/Galeria/Escena Art 716270.webp", alt: "Escena Art 716270" },
    { src: "/images/Galeria/Escena Art 742026.webp", alt: "Escena Art 742026" }
  ];

  const revealVariant = {
    hidden: { filter: "blur(4px)", opacity: 0, y: 15 },
    visible: { 
      filter: "blur(0px)", 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const scrollGallery = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 600 : 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-[#ECE2D2] text-[#2B341F] min-h-screen font-clofie overflow-x-hidden">
      {/* SECCIÓN A: Hero de Bienvenida */}
      <section className="relative h-[60vh] md:h-[70vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with Duotone Effect sutil */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#2B341F] mix-blend-multiply opacity-80 z-10 pointer-events-none"></div>
          <img 
            src="/images/Fábrica.webp" 
            alt="Planta Industrial Muebles Gacela" 
            className="w-full h-full object-cover grayscale brightness-75"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-4">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-godber text-4xl md:text-6xl font-normal tracking-[0.05em] uppercase text-[#ECE2D2] leading-tight"
          >
            40 Años Transformando Espacios
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-outersans font-thin text-[14px] tracking-[0.4em] uppercase text-[#ECE2D2]/80"
          >
            Diseño que se arma con vos.
          </motion.p>
        </div>
      </section>

      {/* SECCIÓN B: Quiénes somos? (Título Centrado + 2 Columnas + Galería Horizontal) */}
      <section className="py-24 bg-[#ECE2D2] border-b border-[#2B341F]/5 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          
          {/* Título Centrado Uniforme */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariant}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="font-godber text-4xl md:text-6xl font-normal tracking-[0.05em] uppercase text-[#2B341F] leading-tight">
              Quiénes somos?
            </h2>
          </motion.div>

          {/* Grilla de 2 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-stretch mb-24">
            
            {/* Columna Izquierda: Imagen del Manual */}
            <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="flex w-full h-full"
            >
              <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-2xl shadow-xl">
                <img 
                  src="/images/Gacela.webp" 
                  alt="Gacela Marca" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Columna Derecha: Texto Narrativo */}
            <motion.div 
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="flex flex-col items-start text-left"
            >
              <div className="font-clofie font-light text-lg leading-relaxed text-[#594A42]">
                <p>
                  En Muebles Gacela diseñamos muebles listos para armar que combinan
                  funcionalidad, estética y accesibilidad. Nacimos como una carpintería
                  tradicional y fuimos creciendo con la incorporación de tecnología, diseño e
                  innovación. Hoy, somos una marca joven con experiencia, que se mueve con la
                  agilidad de su nombre: como una gacela, con estrategia, sensibilidad y enfoque.
                  Creemos en el poder del diseño para mejorar la vida cotidiana y acompañamos a
                  nuestros clientes en la creación de espacios que los representen.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Galería Estética (Horizontal Sutil) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative w-full group"
        >
          {/* Scroll Container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 md:gap-8 px-6 md:px-12 snap-x snap-mandatory scrollbar-hide py-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Estilo extra para esconder la scrollbar en Webkit */}
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                  display: none;
              }
            `}</style>
            
            {galleryImages.map((img, index) => (
              <div 
                key={index}
                className="relative flex-shrink-0 w-[70vw] md:w-[450px] h-[250px] md:h-[320px] snap-center overflow-hidden"
              >
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Flechas de Navegación Custom */}
          <button 
            onClick={() => scrollGallery('left')}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 bg-[#ECE2D2]/80 backdrop-blur-md border border-[#2B341F]/10 text-[#2B341F] p-3 rounded-full hover:bg-[#2B341F] hover:text-[#ECE2D2] transition-colors duration-300 opacity-0 group-hover:opacity-100 shadow-md"
            aria-label="Anterior imagen"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
          
          <button 
            onClick={() => scrollGallery('right')}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 bg-[#ECE2D2]/80 backdrop-blur-md border border-[#2B341F]/10 text-[#2B341F] p-3 rounded-full hover:bg-[#2B341F] hover:text-[#ECE2D2] transition-colors duration-300 opacity-0 group-hover:opacity-100 shadow-md"
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={24} strokeWidth={1.5} />
          </button>
        </motion.div>
      </section>

      {/* SECCIÓN C: Línea de Tiempo de Evolución (#f7f3ea) */}
      <section className="py-24 px-6 md:px-12 bg-[#f7f3ea] relative">
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={revealVariant}
          className="text-center mb-20"
        >
          <h2 className="font-godber text-4xl md:text-6xl font-normal tracking-[0.05em] uppercase text-[#2B341F] leading-tight">Nuestra historia</h2>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          
          <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-[1px] bg-[#2B341F]/15 z-0"></div>

          <div className="flex flex-col gap-24 relative z-10">
            {timelineItems.map((item, index) => (
              <motion.div 
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10%" }}
                variants={revealVariant}
                className={`flex flex-col md:flex-row items-center gap-6 md:gap-16 w-full ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="w-full md:w-1/2 flex flex-col items-start md:items-end group">
                   <div className={`flex flex-col ${index % 2 !== 0 ? 'md:items-start' : 'md:items-end'} w-full`}>
                      <div className="mb-4 inline-block border border-[#2B341F]/40 px-3 py-1 rounded-sm bg-[#f7f3ea] shadow-sm">
                         <span className="font-outersans font-thin text-[14px] tracking-[0.4em] uppercase text-[#2B341F]">
                            {item.year}
                         </span>
                      </div>
                      
                      <h3 className={`font-godber text-2xl tracking-[0.05em] text-[#2B341F] uppercase mb-2 ${index % 2 !== 0 ? 'md:text-left' : 'md:text-right'} leading-tight`}>
                        {item.title}
                      </h3>
                      <p className={`font-clofie font-light text-lg text-[#594A42] max-w-xs ${index % 2 !== 0 ? 'md:text-left' : 'md:text-right'}`}>
                        {item.subtitle}
                      </p>
                   </div>
                </div>

                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#f7f3ea] border border-[#2B341F]/30 z-20"></div>

                <div className="w-full md:w-1/2 flex justify-start md:justify-center">
                  {item.image ? (
                    <div className="w-full max-w-[280px] h-[180px] md:h-[220px] flex items-center justify-center p-4">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="max-w-full max-h-full object-contain md:hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-[280px] h-[180px] md:h-[220px] flex items-center justify-center">
                       {/* Espacio vacío */}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* SECCIÓN D: Filosofía de Diseño (Misión / Visión) */}
      <section className="py-24 px-6 md:px-12 bg-[#ECE2D2] max-w-6xl mx-auto border-t border-[#2B341F]/5">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={revealVariant}
          className="text-center mb-16"
        >
          <h2 className="font-godber text-4xl md:text-6xl font-normal tracking-[0.05em] uppercase text-[#2B341F] leading-tight">Nuestra Esencia</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="group"
          >
            <h3 className="font-outersans font-thin text-[14px] tracking-[0.4em] mb-4 text-[#2B341F]/50 uppercase border-b border-[#2B341F]/10 pb-2">Misión</h3>
            <p className="font-clofie font-light text-lg leading-relaxed text-[#594A42]">
              Creamos soluciones de mobiliario RTA que transforman espacios y acompañan las historias de cada hogar, basándonos en la <span className="font-bold italic">innovación</span> tecnológica y productiva. Facilitamos el armado para que tengas el control total del diseño de tus ambientes.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="group"
          >
            <h3 className="font-outersans font-thin text-[14px] tracking-[0.4em] mb-4 text-[#2B341F]/50 uppercase border-b border-[#2B341F]/10 pb-2">Visión</h3>
            <p className="font-clofie font-light text-lg leading-relaxed text-[#594A42]">
              Ser la marca líder en Argentina y la región en mobiliario autodesplegable, impulsando procesos de <span className="font-bold italic">sostenibilidad</span>, garantizando que cada mueble sea un pilar de diseño, eficiencia y cuidado del medio ambiente.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN E: Calidad y Sostenibilidad (desde la Home) */}
      <QualitySustainability />

      {/* SECCIÓN F: Nuestro Equipo */}
      <section className="py-24 px-6 md:px-12 bg-[#ECE2D2] flex flex-col items-center gap-10 max-w-6xl mx-auto border-t border-[#2B341F]/5">
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-godber text-4xl md:text-6xl font-normal tracking-[0.05em] uppercase text-[#2B341F] leading-tight"
        >
          Nuestro Equipo
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full h-auto max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl flex justify-center bg-white/5"
        >
          <img 
            src="/images/Equipo.webp" 
            alt="Equipo Muebles Gacela" 
            className="w-full h-full object-contain"
          />
        </motion.div>

        <div className="w-full mt-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariant}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-12 md:gap-x-20 gap-y-8 text-[#594A42] font-clofie font-light text-lg leading-relaxed text-justify"
          >
            <div className="flex flex-col gap-6">
              <p>
                Los mejores equipos de trabajo no son aquellos que reúnen más talento individual o cuyos miembros tienen un mejor currículum. Son aquellos equipos que estructuran mejor su trabajo, retroalimentan la motivación y consiguen crear un marco de interacción entre todos sus miembros.
              </p>
              <p>
                El trabajo en equipo es fundamental para el crecimiento y un mejor desarrollo de los miembros de cada equipo. Se basa en una retroalimentación constante y mucho aprendizaje. 
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              <p>
                A la hora de crear equipos de trabajo, debemos basarnos en las fortalezas de cada integrante y los roles que cada uno tendrá que desarrollar. Contar con un buen equipo de trabajo mejora la productividad y nos ayuda como negocio a alcanzar nuestros objetivos en un menor periodo.
              </p>
              <p>
                Todo trabajo en equipo debe promover el aprendizaje y colaboración entre cada integrante. Para esto, es necesario mantener un buen ambiente laboral y trabajar en el bienestar de nuestros colaboradores, ya que esto influirá directamente en su productividad, desempeño y motivación diaria.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN G: Split 50/50 (Proyectos / Talento) */}
      <section className="w-full flex flex-col md:flex-row h-auto md:h-[60vh] overflow-hidden">
        
        {/* Bloque Izquierdo: PROYECTOS */}
        <div 
          onClick={() => navigate('/contacto')}
          className="flex-1 bg-[#2B341F] flex flex-col items-center justify-center text-center p-16 md:p-20 cursor-pointer group"
        >
          <motion.div
             initial={{ opacity: 0, y: 15 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="flex flex-col items-center gap-6"
          >
             <h2 className="font-godber text-4xl md:text-6xl font-normal tracking-[0.05em] uppercase text-[#ECE2D2] leading-tight">
               ¿TENÉS UN PROYECTO?
             </h2>
             <p className="font-outersans font-thin text-[14px] tracking-[0.4em] uppercase text-[#ECE2D2]/80">
               Queremos ayudarte a armar tu lugar.
             </p>
             <button className="mt-4 font-clofie font-bold italic text-[14px] uppercase tracking-widest px-8 py-4 border border-[#ECE2D2] text-[#ECE2D2] transition-colors duration-300 group-hover:bg-[#ECE2D2] group-hover:text-[#2B341F]">
               IR A CONTACTO
             </button>
          </motion.div>
        </div>

        {/* Bloque Derecho: TALENTO */}
        <div 
          onClick={() => navigate('/trabaja-con-nosotros')}
          className="relative flex-1 flex flex-col items-center justify-center text-center p-16 md:p-20 cursor-pointer group overflow-hidden"
        >
          {/* Overlay oscuro para legibilidad */}
          <div className="absolute inset-0 bg-[#2B341F]/60 z-10 transition-colors duration-700 group-hover:bg-[#2B341F]/50"></div>
          
          <img 
            src="/images/talento.webp" 
            alt="sumate al equipo gacela" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          
          <motion.div
             initial={{ opacity: 0, y: 15 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative z-20 flex flex-col items-center gap-6"
          >
             <h2 className="font-godber text-4xl md:text-6xl font-normal tracking-[0.05em] uppercase text-[#ECE2D2] leading-tight">
               SUMATE AL EQUIPO
             </h2>
             <p className="font-outersans font-thin text-[14px] tracking-[0.4em] uppercase text-[#ECE2D2]/80">
               Formá parte de la transformación 4.0.
             </p>
             <button className="mt-4 font-clofie font-bold italic text-[14px] uppercase tracking-widest px-8 py-4 bg-[#2B341F] text-[#ECE2D2] shadow-lg transition-colors duration-300 group-hover:bg-[#ECE2D2] group-hover:text-[#2B341F]">
               TRABAJÁ CON NOSOTROS
             </button>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Nosotros;
