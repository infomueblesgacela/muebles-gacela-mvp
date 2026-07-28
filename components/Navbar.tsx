import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BedDouble,
  Bot,
  MessageCircle,
  Users,
  Search,
  Instagram,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Phone,
  HelpCircle,
  FileText,
  Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Product } from '../types/product';
import { productData } from './PopularProducts';
import db from '../data/productos.json';

// Custom icons to visually represent specific pieces of furniture
const TvStandIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="4" width="14" height="10" rx="1" />
    <path d="M9 14v4" />
    <path d="M15 14v4" />
    <rect x="3" y="18" width="18" height="4" rx="1" />
  </svg>
);

const DiningTableIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Table top */}
    <rect x="2" y="10" width="20" height="3" rx="1" />
    {/* Table legs */}
    <path d="M4 13v8" />
    <path d="M20 13v8" />
    {/* Chair behind table */}
    <path d="M12 10V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v6" />
    <path d="M12 10V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6" />
  </svg>
);

const KitchenCabinetIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="3" width="16" height="18" rx="1" />
    <path d="M4 11h16" />
    <path d="M12 11v10" />
    <circle cx="10" cy="16" r="1" />
    <circle cx="14" cy="16" r="1" />
    <path d="M8 7h8" />
  </svg>
);

const DeskIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="11" width="20" height="3" rx="1" />
    <path d="M4 14v7" />
    <path d="M20 14v7" />
    {/* Monitor */}
    <rect x="7" y="3" width="10" height="6" rx="1" />
    <path d="M12 9v2" />
  </svg>
);

const megamenuData = {
  lineas: ['Clásica', 'Curvalba', 'Gamer', 'Infantil', 'Kyoto', 'Lumo', 'Nordik', 'Cocina Lumo', 'Cocina Nordik'],
  ambientes: [
    { name: 'Living', icon: TvStandIcon, lineas: ['Clásica', 'Curvalba', 'Kyoto', 'Lumo', 'Nordik'] },
    { name: 'Comedor', icon: DiningTableIcon, lineas: ['Clásica'] },
    { name: 'Dormitorio', icon: BedDouble, lineas: ['Clásica', 'Curvalba', 'Infantil', 'Lumo', 'Nordik'] },
    { name: 'Cocina', icon: KitchenCabinetIcon, lineas: ['Cocina Lumo', 'Cocina Nordik'] },
    { name: 'Oficina', icon: DeskIcon, lineas: ['Clásica', 'Curvalba', 'Gamer', 'Kyoto', 'Lumo', 'Nordik'] }
  ]
};

const topNavItems = ['Productos', 'Nosotros', 'Novedades', 'Aberturas', 'Contacto'];

const MegaMenu: React.FC<{ active: boolean, onMouseLeave: () => void }> = ({ active, onMouseLeave }) => {
  const [activeAmbiente, setActiveAmbiente] = useState(megamenuData.ambientes[0]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full bg-[#ECE2D2] shadow-2xl border-t border-[#D9CDB8] overflow-hidden z-[200]"
          onMouseLeave={onMouseLeave}
        >
          <div className="container mx-auto px-6 lg:px-12 py-10 flex gap-8 xl:gap-12 justify-center max-w-[1200px]">
            {/* LÍNEAS */}
            <div className="w-[200px]">
              <h3 className="text-[14px] font-outersans font-thin text-[#8C7A6B] uppercase mb-6 tracking-[0.4em]">Líneas</h3>
              <ul className="space-y-4">
                {megamenuData.lineas.map(linea => (
                  <li key={linea}>
                    <Link to={`/productos?linea=${encodeURIComponent(linea)}`} onClick={onMouseLeave} className="text-base text-[#594A42] hover:text-[#2B341F] transition-all truncate block font-clofie font-light">{linea}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* AMBIENTES */}
            <div className="w-[220px]">
              <h3 className="text-[14px] font-outersans font-thin text-[#8C7A6B] uppercase mb-6 tracking-[0.4em]">Ambientes</h3>
              <ul className="space-y-2">
                {megamenuData.ambientes.map(amb => {
                  const isHovered = activeAmbiente.name === amb.name;
                  return (
                    <li key={amb.name}>
                      <Link
                        to={`/productos?ambiente=${encodeURIComponent(amb.name)}`}
                        onClick={onMouseLeave}
                        onMouseEnter={() => setActiveAmbiente(amb)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all font-clofie font-light text-base ${isHovered ? 'bg-[#FDFBF7] shadow-sm text-[#2B341F]' : 'text-[#8C7A6B] hover:bg-[#E2D8CC]'}`}
                      >
                        <amb.icon size={18} className={`mr-3 ${isHovered ? 'opacity-100' : 'opacity-70'}`} />
                        {amb.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* LÍNEAS EN AMBIENTE */}
            <div className="w-[200px] relative px-6">
              <h3 className="text-[14px] font-outersans font-thin text-[#8C7A6B] uppercase mb-6 tracking-[0.4em] truncate">Líneas en {activeAmbiente.name}</h3>
              <div className="absolute left-0 top-14 bottom-0 w-[1px] bg-[#D9CDB8]"></div>
              <ul className="space-y-4">
                {activeAmbiente.lineas.map(linea => (
                  <li key={linea}>
                    <Link to={`/productos?linea=${encodeURIComponent(linea)}&ambiente=${encodeURIComponent(activeAmbiente.name)}`} onClick={onMouseLeave} className="text-base font-clofie font-light text-[#594A42] hover:text-[#2B341F] hover:font-medium transition-all block">{linea}</Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-[12px] font-clofie font-light text-[#A69785] leading-relaxed pr-4">
                Estas líneas cuentan con piezas diseñadas específicamente para el ambiente {activeAmbiente.name}.
              </div>
            </div>

            {/* CONTACTO */}
            <div className="w-[300px] pl-6 flex flex-col justify-start">
              <h3 className="text-[14px] font-outersans font-thin text-[#8C7A6B] uppercase mb-6 tracking-[0.4em]">Contacto</h3>
              
              <div className="space-y-1">
                <Link to="/contacto" onClick={onMouseLeave} className="w-full flex items-center px-4 py-2.5 hover:bg-[#E2D8CC] rounded-xl transition-colors text-[#594A42] hover:text-[#2B341F] group">
                  <Mail size={16} className="mr-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[14px] font-clofie font-light">Contacto</span>
                </Link>
                <Link to="/trabaja-con-nosotros" onClick={onMouseLeave} className="w-full flex items-center px-4 py-2.5 hover:bg-[#E2D8CC] rounded-xl transition-colors text-[#594A42] hover:text-[#2B341F] group">
                  <Users size={16} className="mr-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[14px] font-clofie font-light">Trabajá con nosotros</span>
                </Link>
                <Link to="/preguntas-frecuentes" onClick={onMouseLeave} className="w-full flex items-center px-4 py-2.5 hover:bg-[#E2D8CC] rounded-xl transition-colors text-[#594A42] hover:text-[#2B341F] group">
                  <HelpCircle size={16} className="mr-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[14px] font-clofie font-light">Preguntas frecuentes</span>
                </Link>
                <Link to="/reclamos" onClick={onMouseLeave} className="w-full flex items-center px-4 py-2.5 hover:bg-[#E2D8CC] rounded-xl transition-colors text-[#594A42] hover:text-[#2B341F] group">
                  <FileText size={16} className="mr-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[14px] font-clofie font-light">Formulario de reclamos</span>
                </Link>
                
                <div className="my-3 border-t border-[#EAE3D9]"></div>
                
                <a href="tel:+543584622342" className="w-full flex items-center px-4 py-2.5 hover:bg-[#E2D8CC] rounded-xl transition-colors text-[#594A42] hover:text-[#2B341F] group">
                  <Phone size={16} className="mr-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[14px] font-clofie font-light">Teléfono (358) 4622342</span>
                </a>
                <a href="https://wa.me/5493584329079" target="_blank" rel="noopener noreferrer" className="w-full flex items-center px-4 py-2.5 hover:bg-[#E2D8CC] rounded-xl transition-colors text-[#594A42] hover:text-[#2B341F] group">
                  <MessageCircle size={16} className="mr-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[14px] font-clofie font-light">Whatsapp 3584 32-9079</span>
                </a>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


interface NavbarProps {
  onLogoClick: () => void;
  onProductClick: (product: Product) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogoClick, onProductClick }) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductosOpen, setIsMobileProductosOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 2) {
      const lowerValue = value.toLowerCase();
      // Función para quitar tildes/acentos
      const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const searchTerms = removeAccents(lowerValue).split(' ').filter(term => term.length > 0);

      // Búsqueda inteligente a través de toda la base de datos de productos
      const allFiltered = db.products.filter(p => {
        // Combinamos los campos relevantes y le quitamos tildes
        const rawText = `${p.SKU || ''} ${p.Nombre_Comercial || ''} ${p.Linea || ''} ${p.Ambiente || ''} ${p.Descripcion_Corta || ''} ${p.Descripcion_Larga || ''}`.toLowerCase();
        const searchableText = removeAccents(rawText);
        
        // El producto debe tener una coincidencia con TODOS los términos que escriba el usuario
        return searchTerms.every(term => searchableText.includes(term));
      });
      
      setTotalSearchResults(allFiltered.length);
      
      const limitedResults = allFiltered.slice(0, 6).map((p: any, index: number) => ({
        id: index, // Usamos el índice como ID temporal ya que el SKU es string
        title: p.Nombre_Comercial,
        shortDescription: `${p.Linea} | ${p.Ambiente}`,
        image: p.Fotos_Mueble ? p.Fotos_Mueble.split(';')[0].trim() : '/images/placeholder.webp',
        sku: p.SKU,
        linea: p.Linea, // Importante para que el router sepa adónde dirigir el click
        rating: 5,
        longDescription: p.Descripcion_Larga || '',
        assemblyTime: '',
        difficulty: '',
        assemblyTools: [],
        mainImages: [],
        thumbnails: [],
        technicalImage: '',
        specs: [],
        inspirationImages: [],
        suggestedProducts: []
      } as Product));

      setSuggestions(limitedResults);
    } else {
      setSuggestions([]);
      setTotalSearchResults(0);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    onProductClick(product);
    setSearchQuery('');
    setSuggestions([]);
    setIsSearchExpanded(false);
  };

  return (
    <nav
      className="sticky top-0 left-0 right-0 z-[100] bg-[#FAF8F5] border-b border-[#EAE3D9] py-3 shadow-sm"
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">

        {/* Logo */}
        <div className="flex-shrink-0">
          <button onClick={onLogoClick} className="block group cursor-pointer">
            <img
              src="https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/website/1/logo/Muebles%20Gacela?unique=c3c510b"
              alt="Gacela"
              className="h-9 md:h-11 w-auto object-contain transition-transform group-hover:scale-105 duration-500"
            />
          </button>
        </div>

        {/* Menú Desktop Principal */}
        <div className="hidden lg:flex items-center space-x-6">
          {topNavItems.map((item) => (
            <div
              key={item}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item)}
            >
              {item === 'Productos' ? (
                <Link 
                  to="/productos"
                  onClick={() => setActiveDropdown(null)}
                  className={`flex items-center py-2 text-[14px] uppercase tracking-widest transition-colors group font-clofie font-bold italic ${activeDropdown === item ? 'text-[#2B341F]' : 'text-[#8C7A6B] hover:text-[#594A42]'}`}
                >
                  {item}
                  <ChevronDown size={14} className={`ml-1.5 transition-transform duration-300 ${activeDropdown === item ? 'rotate-180 text-[#2B341F]' : 'text-[#A69785]'}`} strokeWidth={2} />
                </Link>
              ) : (
                <Link to={item === 'Nosotros' ? '/nosotros' : item === 'Novedades' ? '/novedades' : item === 'Contacto' ? '/contacto' : item === 'Aberturas' ? '/aberturas' : '#'}
                  className={`flex items-center py-2 text-[14px] uppercase tracking-widest transition-colors group font-clofie font-bold italic ${activeDropdown === item ? 'text-[#2B341F]' : 'text-[#8C7A6B] hover:text-[#594A42]'}`}
                >
                  {item}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Mega Menu Dropdown */}
        <MegaMenu 
          active={activeDropdown === 'Productos'} 
          onMouseLeave={() => setActiveDropdown(null)} 
        />

        {/* Search Overlay flotante */}
        <AnimatePresence>
          {isSearchExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[500] flex flex-col items-center pt-24 px-4"
              style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', backgroundColor: 'rgba(250,248,245,0.85)' }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsSearchExpanded(false);
                  setSearchQuery('');
                  setSuggestions([]);
                }
              }}
            >
              {/* Input centrado */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="w-full max-w-xl relative"
              >
                <div className="flex items-center bg-white border border-[#D9CDB8] rounded-2xl shadow-2xl px-5 py-4 gap-3">
                  <Search size={20} strokeWidth={1.5} className="text-[#A69785] flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="¿Qué buscás para tu hogar?"
                    className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#2B341F] placeholder:text-[#A69785] font-clofie font-light"
                  />
                  <button
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    className="text-[#A69785] hover:text-[#2B341F] transition-colors flex-shrink-0 p-1"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Sugerencias */}
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 w-full bg-white rounded-2xl shadow-xl border border-[#EAE3D9] overflow-hidden flex flex-col"
                    >
                      <div className="px-5 py-2.5 bg-[#FDFBF7] text-[10px] uppercase tracking-widest font-bold text-[#A69785] border-b border-[#EAE3D9]">
                        Sugerencias para vos
                      </div>
                      <div className="max-h-[55vh] overflow-y-auto">
                        {suggestions.map((product) => (
                          <button
                            type="button"
                            key={product.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSuggestionClick(product);
                              setIsSearchExpanded(false);
                            }}
                            className="flex items-center p-4 hover:bg-[#FDFBF7] group transition-colors text-left w-full border-b border-[#EAE3D9] last:border-0 cursor-pointer"
                          >
                            <img src={product.image} alt="" className="w-12 h-12 rounded-xl object-cover mr-4 border border-[#EAE3D9] flex-shrink-0" />
                            <div>
                              <p className="text-[13px] font-bold text-[#2B341F] group-hover:text-[#594A42] transition-colors">{product.title}</p>
                              <p className="text-[11px] text-[#8C7A6B] line-clamp-1 mt-0.5">{product.shortDescription}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      {totalSearchResults > 6 && (
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/productos?search=${encodeURIComponent(searchQuery)}`);
                            setSearchQuery('');
                            setSuggestions([]);
                            setIsSearchExpanded(false);
                          }}
                          className="w-full p-4 bg-[#2B341F] text-[#ECE2D2] text-[12px] font-clofie font-bold uppercase tracking-widest hover:bg-[#594A42] transition-colors text-center"
                        >
                          Ver los {totalSearchResults} resultados →
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hint cuando no hay texto */}
                {searchQuery.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[12px] text-[#A69785] font-clofie font-light mt-5 tracking-wide"
                  >
                    Buscá por nombre, línea o ambiente
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Acciones Derecha */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="flex items-center">
            <button
              onClick={() => {
                setIsSearchExpanded(!isSearchExpanded);
                if (isSearchExpanded) {
                  setSuggestions([]);
                  setSearchQuery('');
                }
              }}
              className="p-2 text-[#8C7A6B] hover:text-[#2B341F] transition-colors"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
          </div>

          <a href="https://www.instagram.com/gacelamuebles/" target="_blank" rel="noopener noreferrer" className="hidden md:block p-2 text-[#8C7A6B] hover:text-[#2B341F] transition-colors">
            <Instagram size={18} strokeWidth={1.5} />
          </a>

          <button
            className="lg:hidden p-2 text-[#2B341F]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Menú Móvil Rediseñado */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[300] bg-[#FAF8F5] flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-[#EAE3D9] bg-white">
              <img
                src="https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/website/1/logo/Muebles%20Gacela?unique=c3c510b"
                alt="Gacela"
                className="h-8 w-auto"
              />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#594A42]">
                <X size={28} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 flex flex-col space-y-6">
               <h2 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-[#A69785] border-b border-[#EAE3D9] pb-3 mb-2">Menú Principal</h2>
               {topNavItems.map(item => {
                 if (item === 'Productos') {
                   return (
                     <div key={item} className="flex flex-col">
                       <button
                         onClick={() => setIsMobileProductosOpen(!isMobileProductosOpen)}
                         className="flex items-center justify-between font-godber text-2xl text-[#2B341F] active:text-[#594A42] uppercase tracking-[0.05em] text-left w-full"
                       >
                         {item}
                         <ChevronDown size={24} className={`transition-transform duration-300 ${isMobileProductosOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                       </button>
                       <AnimatePresence>
                         {isMobileProductosOpen && (
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="overflow-hidden flex flex-col gap-2 mt-4"
                           >
                             <div className="p-4 bg-white/50 rounded-xl border border-[#EAE3D9]/50">
                               <h3 className="text-[10px] font-outersans font-thin uppercase tracking-[0.2em] text-[#A69785] mb-3">Filtrar por Ambiente</h3>
                               <div className="grid grid-cols-2 gap-2 mb-6">
                                 {megamenuData.ambientes.map((ambiente) => (
                                   <Link
                                     key={ambiente.name}
                                     to={`/productos?ambiente=${encodeURIComponent(ambiente.name)}`}
                                     onClick={() => setIsMobileMenuOpen(false)}
                                     className="flex flex-col items-center justify-center p-3 bg-white border border-[#EAE3D9] rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                   >
                                     <div className="text-[#8C7A6B] mb-2 transform scale-75">
                                       <ambiente.icon size={24} />
                                     </div>
                                     <span className="text-[10px] font-clofie font-bold uppercase tracking-widest text-[#594A42] text-center leading-tight">
                                       {ambiente.name}
                                     </span>
                                   </Link>
                                 ))}
                               </div>

                               <h3 className="text-[10px] font-outersans font-thin uppercase tracking-[0.2em] text-[#A69785] mb-3">Filtrar por Línea</h3>
                               <div className="flex flex-wrap gap-2 mb-6">
                                 {megamenuData.lineas.map(linea => (
                                   <Link
                                     key={linea}
                                     to={`/productos?linea=${encodeURIComponent(linea)}`}
                                     onClick={() => setIsMobileMenuOpen(false)}
                                     className="px-4 py-2 bg-white border border-[#EAE3D9] shadow-sm rounded-full text-[12px] uppercase tracking-widest font-clofie text-[#594A42]"
                                   >
                                     {linea}
                                   </Link>
                                 ))}
                               </div>

                               <Link
                                 to="/productos"
                                 onClick={() => setIsMobileMenuOpen(false)}
                                 className="flex items-center justify-center w-full py-3.5 bg-[#2B341F] text-[#ECE2D2] rounded-lg text-[12px] uppercase tracking-widest font-clofie font-bold italic shadow-md"
                               >
                                 Ver Catálogo Completo
                               </Link>
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                   );
                 }
                 
                 return (
                   <Link
                     key={item}
                     to={item === 'Nosotros' ? '/nosotros' : item === 'Novedades' ? '/novedades' : item === 'Contacto' ? '/contacto' : item === 'Aberturas' ? '/aberturas' : '#'}
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="font-godber text-2xl text-[#2B341F] active:text-[#594A42] uppercase tracking-[0.05em]"
                   >
                     {item}
                   </Link>
                 );
               })}

               <div className="mt-8 pt-6 border-t border-[#EAE3D9]">
                 <div className="flex flex-col">
                   <a 
                     href="https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/shop" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="flex items-center justify-between py-4 border-b border-[#EAE3D9] text-[#2B341F]" 
                     onClick={() => setIsMobileMenuOpen(false)}
                   >
                     <div className="flex items-center">
                       <Briefcase size={20} className="mr-4 text-[#8C7A6B]" strokeWidth={1.5} />
                       <span className="text-base font-clofie font-light">Compra mayorista</span>
                     </div>
                     <ChevronRight size={20} className="text-[#8C7A6B]" strokeWidth={1.5} />
                   </a>
                   
                   <a href="tel:3584622342" className="flex items-center justify-between py-4 border-b border-[#EAE3D9] text-[#2B341F]">
                     <div className="flex items-center">
                       <Phone size={20} className="mr-4 text-[#8C7A6B]" strokeWidth={1.5} />
                       <span className="text-base font-clofie font-light">Llamanos</span>
                     </div>
                     <ChevronRight size={20} className="text-[#8C7A6B]" strokeWidth={1.5} />
                   </a>

                   <a href="https://wa.me/5493584329079" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-4 text-[#2B341F]">
                     <div className="flex items-center">
                       <MessageCircle size={20} className="mr-4 text-[#8C7A6B]" strokeWidth={1.5} />
                       <span className="text-base font-clofie font-light">WhatsApp</span>
                     </div>
                     <ChevronRight size={20} className="text-[#8C7A6B]" strokeWidth={1.5} />
                   </a>
                 </div>

                 <div className="mt-6 pt-6 border-t border-[#EAE3D9]">
                   <h4 className="text-[11px] font-clofie font-bold uppercase tracking-widest text-[#2B341F] mb-1">ATENCIÓN AL CLIENTE</h4>
                   <p className="text-[13px] font-clofie font-light text-[#594A42]">Lunes a viernes de 7 a 17 hs.</p>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
