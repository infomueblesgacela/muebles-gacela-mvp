import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import db from '../data/productos.json';
import { slugify } from '../utils/slugify';

const Catalog: React.FC = () => {
  const [selectedLinea, setSelectedLinea] = useState<string>('');
  const [selectedAmbiente, setSelectedAmbiente] = useState<string>('');
  const [selectedSearch, setSelectedSearch] = useState<string>('');
  const location = useLocation();

  const ALL_LINEAS = ["Clásica", "Kyoto", "Curvalba", "Lumo", "Nordik", "Infantil", "Gamer"];
  const ALL_AMBIENTES = ["Living", "Comedor", "Dormitorio", "Cocina", "Oficina"];

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lineaParam = params.get('linea');
    const ambienteParam = params.get('ambiente');
    
    // Find the original case matched value from arrays or default to empty
    // so the selects can correctly reflect the active filter
    if (lineaParam) {
      const matchedLinea = ALL_LINEAS.find(l => slugify(l) === slugify(lineaParam));
      setSelectedLinea(matchedLinea || '');
    } else {
      setSelectedLinea('');
    }
    
    if (ambienteParam) {
      const matchedAmbiente = ALL_AMBIENTES.find(a => a.toLowerCase() === ambienteParam.toLowerCase());
      setSelectedAmbiente(matchedAmbiente || '');
    } else {
      setSelectedAmbiente('');
    }
    
    const searchParam = params.get('search');
    setSelectedSearch(searchParam || '');
  }, [location.search]);

  const prodsWithSearch = useMemo(() => {
    let prods = db.products;
    if (selectedSearch) {
      const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const searchTerms = removeAccents(selectedSearch.toLowerCase()).split(' ').filter(term => term.length > 0);
      prods = prods.filter(p => {
        const rawText = `${p.SKU || ''} ${p.Nombre_Comercial || ''} ${p.Linea || ''} ${p.Ambiente || ''} ${p.Descripcion_Corta || ''} ${p.Descripcion_Larga || ''}`.toLowerCase();
        const searchableText = removeAccents(rawText);
        return searchTerms.every(term => searchableText.includes(term));
      });
    }
    return prods;
  }, [selectedSearch]);

  const availableLineas = useMemo(() => {
    let prods = prodsWithSearch;
    if (selectedAmbiente) {
      prods = prods.filter(p => p.Ambiente === selectedAmbiente);
    }
    const validLines = new Set(prods.map(p => p.Linea));
    return ALL_LINEAS.filter(l => validLines.has(l));
  }, [selectedAmbiente, prodsWithSearch]);

  const availableAmbientes = useMemo(() => {
    let prods = prodsWithSearch;
    if (selectedLinea) {
      prods = prods.filter(p => p.Linea === selectedLinea);
    }
    const validAmbs = new Set(prods.map(p => p.Ambiente));
    return ALL_AMBIENTES.filter(a => validAmbs.has(a));
  }, [selectedLinea, prodsWithSearch]);

  const handleLineaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLinea = e.target.value;
    setSelectedLinea(newLinea);
    if (newLinea && selectedAmbiente) {
      const validAmbs = new Set(prodsWithSearch.filter(p => p.Linea === newLinea).map(p => p.Ambiente));
      if (!validAmbs.has(selectedAmbiente)) {
        setSelectedAmbiente('');
      }
    }
  };

  const handleAmbienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAmbiente = e.target.value;
    setSelectedAmbiente(newAmbiente);
    if (newAmbiente && selectedLinea) {
      const validLines = new Set(prodsWithSearch.filter(p => p.Ambiente === newAmbiente).map(p => p.Linea));
      if (!validLines.has(selectedLinea)) {
        setSelectedLinea('');
      }
    }
  };

  const filteredProducts = useMemo(() => {
    return prodsWithSearch.filter(p => {
      const matchLinea = selectedLinea ? p.Linea === selectedLinea : true;
      const matchAmbiente = selectedAmbiente ? p.Ambiente === selectedAmbiente : true;
      return matchLinea && matchAmbiente;
    });
  }, [selectedLinea, selectedAmbiente, prodsWithSearch]);

  return (
    <div className="bg-brand-bg min-h-screen">
      {/* HERO SECTION */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-home.webp" 
            alt="Portfolio Gacela" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-primary/40"></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-8xl font-godber font-normal uppercase tracking-[0.05em] text-white mb-6 drop-shadow-lg"
          >
            Nuestro Portfolio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl text-white font-clofie tracking-wider font-light italic"
          >
            Mobiliario que refleja el equilibrio perfecto entre diseño y funcionalidad.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-20 max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-godber font-normal text-brand-primary tracking-wide mb-12">
                Portfolio
            </h2>

            {/* FILTERS SECTION - DOS DESPLEGABLES */}
            <div className="flex flex-col md:flex-row gap-6 justify-center max-w-3xl mx-auto">
                <div className="w-full md:w-1/2 text-left">
                    <label className="block text-[12px] font-outersans font-thin text-[#A69785] mb-2 tracking-[0.4em] uppercase ml-2 text-center">Filtrar por Línea</label>
                    <div className="relative">
                        <select 
                            className="w-full bg-[#FAF8F5] border border-[#EAE3D9] text-[#594A42] font-clofie font-light text-[15px] px-6 py-4 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-support appearance-none cursor-pointer transition-all hover:bg-white shadow-sm"
                            value={selectedLinea}
                            onChange={handleLineaChange}
                        >
                            <option value="">Todas las líneas</option>
                            {availableLineas.map(linea => (
                                <option key={linea as string} value={linea as string}>{linea as string}</option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#A69785]">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>
                
                <div className="w-full md:w-1/2 text-left">
                    <label className="block text-[12px] font-outersans font-thin text-[#A69785] mb-2 tracking-[0.4em] uppercase ml-2 text-center">Filtrar por Ambiente</label>
                    <div className="relative">
                        <select 
                            className="w-full bg-[#FAF8F5] border border-[#EAE3D9] text-[#594A42] font-clofie font-light text-[15px] px-6 py-4 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-support appearance-none cursor-pointer transition-all hover:bg-white shadow-sm"
                            value={selectedAmbiente}
                            onChange={handleAmbienteChange}
                        >
                            <option value="">Todos los ambientes</option>
                            {availableAmbientes.map(ambiente => (
                                <option key={ambiente as string} value={ambiente as string}>{ambiente as string}</option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#A69785]">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Grid de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 text-brand-support">
            <p className="text-xl font-clofie font-light">No hay productos que coincidan con tu búsqueda.</p>
            <button 
              onClick={() => { setSelectedLinea(''); setSelectedAmbiente(''); }}
              className="mt-6 text-[14px] font-clofie font-bold italic tracking-widest uppercase border-b border-brand-support hover:opacity-70"
            >
              Ver todo el portfolio
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-10 md:gap-y-16 max-w-7xl mx-auto">
            <AnimatePresence>
                {filteredProducts.map((product, idx) => {
                const fotos = product.Fotos_Mueble ? product.Fotos_Mueble.split(/[;,]\s*/).filter(Boolean) : [];
                const mainPhoto = fotos.length > 0 ? fotos[0] : 'https://placehold.co/600x600/f2f2f2/1a1a1a?text=Foto+Pendiente';
                
                return (
                    <motion.div
                        layout
                        key={product.SKU}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="group flex flex-col cursor-pointer"
                    >
                    <Link to={`/${slugify(product.Linea || 'producto')}/${product.SKU}`} className="block w-full">
                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-6 bg-white shadow-sm group-hover:shadow-md transition-all duration-500">
                            <img 
                                src={mainPhoto} 
                                alt={product.Nombre_Comercial as string} 
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600/f2f2f2/1a1a1a?text=Foto+Invalida'; }}
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <span className="text-[10px] uppercase tracking-widest font-clofie font-bold italic text-brand-primary">Ver Producto</span>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className="text-lg font-godber uppercase text-brand-primary tracking-wider group-hover:text-brand-support transition-colors leading-tight">
                                {product.Nombre_Comercial as string}
                            </h3>
                            
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-[11px] font-clofie font-normal tracking-[0.2em] uppercase text-brand-support/70">
                                    {(product.Linea as string) || 'Gacela'}
                                </p>
                                {product.Precio && (
                                    <p className="text-[14px] font-clofie font-bold italic text-brand-accent">${product.Precio}</p>
                                )}
                            </div>
                        </div>
                    </Link>
                    </motion.div>
                );
                })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
