import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import db from '../data/productos.json';
import { Product } from '../types/product';
import { slugify } from '../utils/slugify';
import { trackProductClick } from '../utils/analytics';

// Dynamically group products by Linea and export for other components (like Navbar)
const grouped: Record<string, any[]> = {};
db.products.forEach(p => {
  if (p.Linea) {
    if (!grouped[p.Linea]) grouped[p.Linea] = [];
    grouped[p.Linea].push(p);
  }
});

export const productData: Record<string, any[]> = {};
for (const [linea, prods] of Object.entries(grouped)) {
  productData[linea] = prods.slice(0, 4).map(p => ({
    id: p.SKU,
    title: p.Nombre_Comercial,
    image: p.Fotos_Mueble ? p.Fotos_Mueble.split(/[;,]\s*/)[0] : 'https://placehold.co/600x600/f2f2f2/1a1a1a?text=Pendiente',
    sku: p.SKU,
    linea: p.Linea,
  }));
}

interface PopularProductsProps {
  onProductClick: (product: Product) => void;
}

const PopularProducts: React.FC<PopularProductsProps> = ({ onProductClick }) => {
  // Sort lineas to have Clásica first if possible
  const lineas = Object.keys(productData).sort((a, b) => {
    if (a === 'Clásica') return -1;
    if (b === 'Clásica') return 1;
    return a.localeCompare(b);
  });

  const [activeTab, setActiveTab] = useState(lineas[0] || 'Clásica');

  return (
    <section className="pt-32 pb-24 bg-brand-bg transition-all duration-700">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-left mb-16">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[14px] font-thin tracking-[0.4em] uppercase text-brand-support mb-4 font-outersans"
          >
            Nuestra Colección
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-godber font-normal tracking-[0.05em] uppercase text-brand-primary leading-tight"
          >
            NUESTRAS LÍNEAS
          </motion.h3>
        </div>

        {/* Mini Menú de Filtro (Tabs) */}
        <div className="flex justify-center mb-16">
          <div className="flex flex-wrap gap-y-4 space-x-4 md:space-x-12 border-b border-gray-200 w-full md:w-auto justify-center">
            {lineas.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[14px] uppercase tracking-widest transition-all relative font-clofie font-bold italic ${
                  activeTab === tab ? 'text-brand-primary' : 'text-gray-400 hover:text-brand-primary'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-support"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Grilla de Productos con Animación */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            >
              {productData[activeTab]?.map((product) => {
                const lineaSlug = slugify(product.linea || 'producto');
                const productUrl = `/${lineaSlug}/${product.sku}`;
                return (
                  <Link 
                    to={productUrl}
                    key={product.id} 
                    className="group cursor-pointer block"
                    onClick={() => {
                      trackProductClick({
                        sku: product.sku,
                        title: product.title,
                        linea: product.linea,
                      }, 'Home - Productos Populares');
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-white mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                      <img 
                        src={product.image} 
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[10px] uppercase tracking-tight font-clofie font-bold italic">Ver Producto</span>
                      </div>
                    </div>
                      <h3 className="text-lg font-clofie font-light text-brand-primary/90 group-hover:text-brand-support transition-colors">{product.title}</h3>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Acceso a Colección */}
        <div className="mt-8 text-right">
          <Link 
            to={`/productos?linea=${slugify(activeTab)}`}
            className="inline-flex items-center text-[14px] uppercase tracking-widest text-[#9B754E] hover:text-[#594A42] transition-colors group font-clofie font-bold italic"
            onClick={() => window.scrollTo(0, 0)}
          >
            Ver toda la línea {activeTab}
            <motion.span 
              className="ml-2"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;