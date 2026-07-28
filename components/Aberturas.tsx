import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home as HomeIcon, Layout, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageViewer from './ImageViewer';

const Aberturas: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const galleryImages = [
        "/images/aberturas_obras/20161025_145010.webp",
        "/images/aberturas_obras/470191124_1106952170877088_8938724384557469885_n.webp",
        "/images/aberturas_obras/475082741_608613485253160_1745073460008066477_n.webp",
        "/images/aberturas_obras/Capello 2.webp",
        "/images/aberturas_obras/Insignia-360-Insignia-360-.webp",
        "/images/aberturas_obras/Sin título-1.webp",
        "/images/aberturas_obras/WhatsApp Image 2025-07-17 at 3.08.42 PM (1).webp",
        "/images/aberturas_obras/WhatsApp Image 2025-09-16 at 10.07.51.webp",
        "/images/aberturas_obras/WhatsApp Image 2025-09-16 at 10.07.52.webp",
        "/images/aberturas_obras/WhatsApp Image 2025-11-05 at 16.02.42.webp",
        "/images/aberturas_obras/WhatsApp Image 2025-11-13 at 07.58.39 (1).webp",
        "/images/aberturas_obras/WhatsApp Image 2025-11-13 at 07.58.40 (1).webp",
        "/images/aberturas_obras/WhatsApp Image 2025-11-13 at 07.58.41.webp",
    ];

    const clientLogos = [
        "/images/clientes/Recurso 4.webp",
        "/images/clientes/Recurso 5.webp",
        "/images/clientes/Recurso 6.webp",
        "/images/clientes/Recurso 7.webp",
    ];

    const projectTypes = ["Edificio", "Residencia", "Oficinas", "Otros"];

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            
            let newScrollLeft = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            
            // Loop functionality for manual scroll
            if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - 5) {
                newScrollLeft = 0;
            } else if (direction === 'left' && scrollLeft <= 5) {
                newScrollLeft = scrollWidth - clientWidth;
            }

            scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        }
    };

    // Auto-play effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                scroll('right');
            }, 4000); // Change image every 4 seconds
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-brand-bg min-h-screen"
        >
            {/* HERO SECTION */}
            <section className="pt-32 pb-16 md:pt-44 md:pb-24 px-6">
                <div className="container mx-auto max-w-6xl text-center">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-support mb-4"
                    >
                        Proyectos y Equipamiento
                    </motion.h2>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-7xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary mb-8 md:mb-12 leading-tight"
                    >
                        PROYECTOS Y EQUIPAMIENTO
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-4xl mx-auto text-lg md:text-xl font-clofie font-light text-brand-primary/80 leading-relaxed"
                    >
                        Respaldados por más de 40 años de trayectoria en la industria, nos especializamos en el equipamiento integral de edificios y residencias privadas. Brindamos soluciones completas que abarcan desde la provisión de mobiliario interior hasta la instalación técnica de aberturas de aluminio y barandas para balcones y terrazas.
                    </motion.p>
                </div>
            </section>

            {/* HORIZONTAL CAROUSEL GALLERY */}
            <section 
                className="pb-24 px-6 overflow-hidden"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
            >
                <div className="container mx-auto max-w-[1600px] relative">
                    <div className="flex justify-between items-end mb-8 px-4">
                        <div>
                           <h2 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-support mb-2">Portfolio</h2>
                           <h3 className="text-3xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary">Obras Realizadas</h3>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    scroll('left');
                                    setIsAutoPlaying(false);
                                }}
                                className="w-12 h-12 rounded-full border border-[#D9CDB8] flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all bg-white shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                onClick={() => {
                                    scroll('right');
                                    setIsAutoPlaying(false);
                                }}
                                className="w-12 h-12 rounded-full border border-[#D9CDB8] flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all bg-white shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                    
                    <div 
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Ensure no scrollbar
                    >
                        {galleryImages.map((url, index) => (
                            <div
                                key={index}
                                className="flex-none w-[85%] sm:w-[50%] md:w-[35%] lg:w-[25%] snap-start"
                            >
                                <div 
                                    className="relative aspect-video rounded-[2rem] overflow-hidden border border-[#D9CDB8] shadow-md cursor-pointer group bg-white"
                                    onClick={() => setSelectedImage(url)}
                                >
                                    <img 
                                        src={url} 
                                        alt={`Obra ${index + 1}`} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <div className="bg-white p-4 rounded-full text-brand-primary transform scale-90 group-hover:scale-100 transition-transform shadow-xl">
                                            <ArrowRight size={20} />
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INFINITE LOGO LOOP */}
            <section className="py-16 bg-[#FAF8F5] overflow-hidden border-y border-[#D9CDB8]/30">
                <div className="mb-10 text-center px-6">
                    <h2 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary mb-4">Empresas que confían</h2>
                    <h3 className="text-2xl md:text-3xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary opacity-90">NUESTROS CLIENTES</h3>
                </div>
                <div className="flex w-fit relative">
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ 
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 25,
                                ease: "linear"
                            } 
                        }}
                        className="flex items-center space-x-24 px-12"
                    >
                        {[...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos].map((logo, i) => (
                            <div key={i} className="flex-shrink-0 transition-transform duration-500 hover:scale-110">
                                <img src={logo} alt="Logo Cliente" className="h-16 w-auto object-contain" />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* B2B FORM */}
            <section className="py-24 px-6 bg-brand-bg">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                        <div className="space-y-12">
                            <div className="space-y-6 text-center lg:text-left">
                                <h2 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-support italic">Solicitá una Cotización</h2>
                                <h3 className="text-4xl md:text-6xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary leading-tight">
                                    ¿TENÉS UNA OBRA <br className="hidden md:block" /> EN MARCHA?
                                </h3>
                                <p className="text-lg md:text-xl font-clofie font-light text-[#594A42] leading-relaxed max-w-lg mx-auto lg:mx-0">
                                    Nuestro equipo técnico se encargará de analizar tu proyecto para brindarte la mejor solución en equipamiento y aberturas.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 max-w-md mx-auto lg:mx-0">
                                <div className="flex items-start gap-6 border-l-2 border-brand-support/20 pl-8 relative">
                                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-brand-support text-white flex items-center justify-center text-[10px] font-godber">01</div>
                                    <div className="space-y-1">
                                        <h4 className="font-godber font-normal uppercase tracking-widest text-[#2B341F]">Escala Industrial</h4>
                                        <p className="font-clofie font-light text-sm text-[#8C7A6B]">Producción serializada para alta disponibilidad en obras de gran escala.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6 border-l-2 border-brand-support/20 pl-8 relative">
                                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-brand-support text-white flex items-center justify-center text-[10px] font-godber">02</div>
                                    <div className="space-y-1">
                                        <h4 className="font-godber font-normal uppercase tracking-widest text-[#2B341F]">Montaje Especializado</h4>
                                        <p className="font-clofie font-light text-sm text-[#8C7A6B]">Personal propio capacitado para la colocación de piezas y aberturas.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6 border-l-2 border-brand-support/20 pl-8 relative">
                                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-brand-support text-white flex items-center justify-center text-[10px] font-godber">03</div>
                                    <div className="space-y-1">
                                        <h4 className="font-godber font-normal uppercase tracking-widest text-[#2B341F]">Calidad Certificada</h4>
                                        <p className="font-clofie font-light text-sm text-[#8C7A6B]">Materiales de alta durabilidad respaldados por décadas de fabricación.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-[#D9CDB8]/40">
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-outersans font-thin uppercase tracking-[0.2em] text-[#A69785] block ml-2">Nombre y Apellido / Empresa *</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-[#FAF8F5] border border-[#EAE3D9] px-6 py-4 rounded-xl focus:ring-1 focus:ring-brand-support outline-none font-clofie font-light text-brand-primary placeholder-[#A69785]/50"
                                        placeholder="Ingrese sus datos"
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[12px] font-outersans font-thin uppercase tracking-[0.2em] text-[#A69785] block ml-2">Correo electrónico *</label>
                                    <input 
                                        type="email" 
                                        className="w-full bg-[#FAF8F5] border border-[#EAE3D9] px-6 py-4 rounded-xl focus:ring-1 focus:ring-brand-support outline-none font-clofie font-light text-brand-primary placeholder-[#A69785]/50"
                                        placeholder="email@ejemplo.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[12px] font-outersans font-thin uppercase tracking-[0.2em] text-[#A69785] block ml-2">Teléfono *</label>
                                    <input 
                                        type="tel" 
                                        className="w-full bg-[#FAF8F5] border border-[#EAE3D9] px-6 py-4 rounded-xl focus:ring-1 focus:ring-brand-support outline-none font-clofie font-light text-brand-primary placeholder-[#A69785]/50"
                                        placeholder="Cod. Área + Número"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[12px] font-outersans font-thin uppercase tracking-[0.2em] text-[#A69785] block ml-2">Tipo de Proyecto *</label>
                                    <div className="relative">
                                        <select className="w-full bg-[#FAF8F5] border border-[#EAE3D9] px-6 py-4 rounded-xl focus:ring-1 focus:ring-brand-support outline-none font-clofie font-light text-brand-primary appearance-none cursor-pointer">
                                            {projectTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A69785]">
                                            <ChevronRight size={14} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[12px] font-outersans font-thin uppercase tracking-[0.2em] text-[#A69785] block ml-2">Mensaje / Consulta</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full bg-[#FAF8F5] border border-[#EAE3D9] px-6 py-4 rounded-xl focus:ring-1 focus:ring-brand-support outline-none font-clofie font-light text-brand-primary placeholder-[#A69785]/50"
                                        placeholder="Contanos brevemente sobre la escala de tu proyecto..."
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-brand-primary text-white py-5 rounded-xl font-clofie font-bold italic tracking-widest hover:bg-brand-support transition-all flex items-center justify-center group uppercase text-sm shadow-sm"
                                >
                                    SOLICITAR ASESORAMIENTO TÉCNICO
                                    <ArrowRight size={18} className="ml-3 transition-transform group-hover:translate-x-1" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* LIGHTBOX */}
            <ImageViewer 
                imageUrl={selectedImage} 
                onClose={() => setSelectedImage(null)} 
            />
        </motion.div>
    );
};

export default Aberturas;
