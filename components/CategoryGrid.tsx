
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  {
    title: 'Dormitorio',
    image: 'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91135-30a549cc/Recurso%2010.webp',
    description: 'Confort y descanso'
  },
  {
    title: 'Oficina',
    image: 'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91133-3072fc92/Cl%C3%A1sica%20221150.webp',
    description: 'Productividad y estilo'
  },
  {
    title: 'Living',
    image: 'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91423-81fc70c8/Escena%20Art%20326250.webp',
    description: 'Espacios para compartir'
  },
  {
    title: 'Comedor',
    image: 'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91375-c9bd100f/Escena%20Combo%20Art%20429091%20%28sillas%20blancas%29.webp',
    description: 'Momentos únicos'
  },
  {
    title: 'Cocina',
    image: '/images/Cocina.webp',
    description: 'Sabores e inspiración'
  }
];

const CategoryGrid: React.FC = () => {
  const [dragWidth, setDragWidth] = React.useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const calculateWidth = () => {
      if (carouselRef.current) {
        setDragWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
      }
    };

    calculateWidth();
    // Un pequeño timeout por si el renderizado de fuentes o elementos se retrasa ligeramente
    const timer = setTimeout(calculateWidth, 200);

    window.addEventListener('resize', calculateWidth);
    return () => {
      window.removeEventListener('resize', calculateWidth);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Título de la Sección - Ahora alineado a la izquierda */}
        <div className="text-left mb-16">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[14px] font-thin tracking-[0.4em] uppercase text-brand-support mb-4 font-outersans"
          >
            Explora Ambientes
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-godber font-normal tracking-[0.05em] uppercase text-brand-primary leading-tight"
          >
            BUSCAR POR CATEGORÍA
          </motion.h3>
        </div>

        {/* Layout Desktop: Grid */}
        <div className="hidden md:grid grid-cols-5 gap-4 lg:gap-8">
          {categories.map((cat, idx) => (
            <motion.div 
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <Link to={`/productos?ambiente=${encodeURIComponent(cat.title)}`} onClick={() => window.scrollTo(0, 0)} className="block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-4 bg-brand-bg">
                  <motion.img 
                    src={cat.image} 
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>
                <h4 className="text-[14px] tracking-widest uppercase text-brand-primary text-left transition-colors group-hover:text-brand-support font-clofie font-bold italic mt-4">
                  {cat.title}
                </h4>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Layout Mobile: Carrusel Interactivo */}
        <div className="md:hidden">
          <motion.div 
            ref={carouselRef}
            drag="x"
            dragConstraints={{ right: 0, left: -dragWidth }}
            className="flex space-x-6 cursor-grab active:cursor-grabbing"
          >
            {categories.map((cat) => (
              <div key={cat.title} className="min-w-[75%] sm:min-w-[50%]">
                <Link to={`/productos?ambiente=${encodeURIComponent(cat.title)}`} onClick={() => window.scrollTo(0, 0)} className="block group">
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl mb-4 shadow-sm">
                    <img 
                      src={cat.image} 
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <h4 className="text-[14px] tracking-widest uppercase text-brand-primary font-clofie font-bold italic mt-4 group-hover:text-brand-support transition-colors">
                    {cat.title}
                  </h4>
                </Link>
              </div>
            ))}
          </motion.div>
          <div className="mt-8 flex justify-start space-x-2">
            <div className="w-8 h-[2px] bg-brand-support" />
            <div className="w-8 h-[2px] bg-gray-200" />
            <div className="w-8 h-[2px] bg-gray-200" />
            <div className="w-8 h-[2px] bg-gray-200" />
            <div className="w-8 h-[2px] bg-gray-200" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
