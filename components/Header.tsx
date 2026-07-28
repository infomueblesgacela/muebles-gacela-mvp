
import React from 'react';
import { SearchIcon, CartIcon, ChevronDownIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-bg/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <a href="#" className="flex items-center group">
            <img 
              src="https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/website/1/logo/Muebles%20Gacela?unique=c3c510b" 
              alt="Gacela Muebles Logo" 
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </a>
        </div>
        
        <nav className="hidden lg:flex items-center space-x-10 text-[15px] font-medium text-brand-primary">
          <a href="#" className="hover:text-brand-primary transition-colors">Inicio</a>
          <a href="#" className="hover:text-brand-primary transition-colors">Nosotros</a>
          <a href="#" className="hover:text-brand-primary transition-colors">Novedades</a>
          <a href="#" className="flex items-center hover:text-brand-primary transition-colors">
            Productos <ChevronDownIcon className="ml-1.5 h-4 w-4" />
          </a>
        </nav>
        
        <div className="flex items-center space-x-5">
          <button className="text-brand-primary hover:text-brand-primary transition-colors p-2">
            <SearchIcon className="h-5 w-5" />
          </button>
          <button className="flex items-center bg-brand-support text-brand-bg px-5 py-2 rounded-md hover:bg-opacity-90 transition-all shadow-sm">
            <CartIcon className="h-5 w-5" />
            <span className="ml-2 text-sm font-semibold hidden sm:inline">Carrito</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
