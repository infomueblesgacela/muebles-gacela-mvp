import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { NewsPost } from '../types/news';
import { fetchRecentNews } from '../services/apiNews';

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragWidth, setDragWidth] = useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      const data = await fetchRecentNews(4);
      setNews(data);
      setLoading(false);
    };

    loadNews();
  }, []);

  useEffect(() => {
    const calculateWidth = () => {
      if (carouselRef.current) {
        setDragWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
      }
    };

    if (!loading) {
      calculateWidth();
      const timer = setTimeout(calculateWidth, 200);
      window.addEventListener('resize', calculateWidth);
      return () => {
        window.removeEventListener('resize', calculateWidth);
        clearTimeout(timer);
      };
    }
  }, [loading, news]);

  const renderCardContent = (item: NewsPost) => (
    <Link to={`/novedades/${item.slug}`} className="flex flex-col h-full">    
      <div className="h-64 overflow-hidden relative">
        <img 
          src={item.coverImage} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          draggable="false"
        />
        <div className="absolute top-4 left-4 bg-brand-support text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm bg-opacity-90">
           {item.category}
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <span className="text-[#A69785] text-[11px] font-outersans font-bold tracking-widest uppercase mb-3 block">
            {new Date(item.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        <h3 className="text-xl font-godber uppercase text-[#2B341F] mb-4 group-hover:text-brand-support transition-colors">{item.title}</h3>
        <p className="text-lg text-[#594A42] font-clofie font-light leading-relaxed flex-grow line-clamp-3 mb-6" dangerouslySetInnerHTML={{ __html: item.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' }} />
        <div className="mt-auto pt-6 border-t border-[#EAE3D9] flex items-center justify-between text-[#8C7A6B] font-clofie text-xs uppercase tracking-widest font-bold">
            <span>Leer Nota</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </Link>    
  );

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-left mb-16 flex justify-between items-end">
          <div>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-[14px] font-thin tracking-[0.4em] uppercase text-brand-support mb-4 font-outersans"
              >
                Editorial & Tendencias
              </motion.h2>
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-godber font-normal tracking-[0.05em] uppercase text-brand-primary leading-tight"
              >
                NOVEDADES
              </motion.h3>
          </div>
          <div className="hidden md:block">
              <Link 
                to="/novedades"
                className="inline-block px-8 py-3 border border-brand-primary text-brand-primary text-[12px] tracking-[0.2em] uppercase rounded-full hover:bg-brand-primary hover:text-white transition-all duration-300 font-clofie font-bold"
              >
                Ver Todas
              </Link>
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-brand-support border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : (
          <>
            {/* Desktop View (Grid) */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
              {news.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-[#EAE3D9] overflow-hidden flex flex-col group cursor-pointer transition-all"
                >
                  {renderCardContent(item)}
                </motion.article>
              ))}
            </div>

            {/* Mobile View (Swipeable Carousel) */}
            <div className="md:hidden mb-12">
              <motion.div 
                ref={carouselRef}
                drag="x"
                dragConstraints={{ right: 0, left: -dragWidth }}
                className="flex space-x-6 cursor-grab active:cursor-grabbing"
              >
                {news.map((item) => (
                  <div 
                    key={item.id} 
                    className="min-w-[85%] bg-white rounded-2xl border border-[#EAE3D9] overflow-hidden flex flex-col group"
                  >
                    {renderCardContent(item)}
                  </div>
                ))}
              </motion.div>
            </div>
          </>
        )}

        <div className="text-center md:hidden">
          <Link 
            to="/novedades"
            className="inline-block px-10 py-4 bg-brand-primary text-white text-[14px] tracking-[0.2em] uppercase rounded-full hover:bg-brand-support transition-all duration-300 font-clofie font-bold"
          >
            Ver todas las novedades
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
