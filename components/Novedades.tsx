import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { NewsPost } from '../types/news';
import { fetchAllNews } from '../services/apiNews';

const Novedades: React.FC = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  
  // For pagination / Load more
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchAllNews();
      setPosts(data);
      setLoading(false);
    };

    loadData();
    window.scrollTo(0, 0);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category));
    return ['Todas', ...Array.from(cats)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'Todas') {
      return posts;
    }
    return posts.filter(p => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-brand-support font-outersans font-thin uppercase tracking-[0.4em] text-sm mb-4 block">Magazzine</span>
          <h1 className="text-4xl md:text-6xl font-godber font-normal tracking-[0.05em] uppercase text-[#2B341F] mb-6 leading-tight">Novedades</h1>
          <p className="text-lg text-[#594A42] font-clofie font-light leading-relaxed max-w-2xl mx-auto">
            Descubrí las últimas noticias, lanzamientos y tendencias en diseño de interiores de Muebles Gacela.
          </p>
        </motion.div>

        {/* CONTROLS (FILTERS) */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-16 gap-4">
          <div className="flex flex-wrap justify-center gap-3">
             {categories.map(cat => (
               <button
                 key={cat}
                 onClick={() => {
                   setSelectedCategory(cat);
                   setVisibleCount(6); // Reset visible count on filter
                 }}
                 className={`px-6 py-2 rounded-full font-clofie font-medium text-sm tracking-widest uppercase transition-colors border ${
                   selectedCategory === cat 
                   ? 'bg-brand-primary text-white border-brand-primary' 
                   : 'bg-white text-[#594A42] border-[#EAE3D9] hover:border-brand-support'
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>

        {/* CONTENT GRID */}
        {loading ? (
             <div className="flex justify-center items-center py-24">
                 <div className="w-12 h-12 border-4 border-brand-support border-t-transparent rounded-full animate-spin"></div>
             </div>
        ) : (
             <>
                 <motion.div 
                     layout
                     className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                 >
                     <AnimatePresence>
                         {displayedPosts.map((post) => (
                             <motion.article
                                 layout
                                 key={post.id}
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.95 }}
                                 transition={{ duration: 0.4 }}
                                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#EAE3D9] flex flex-col group cursor-pointer"
                             >
                                 <Link to={`/novedades/${post.slug}`} className="flex flex-col h-full">
                                     <div className="relative h-64 overflow-hidden">
                                         <img 
                                             src={post.coverImage} 
                                             alt={post.title}
                                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                         />
                                         <div className="absolute top-4 left-4 bg-brand-support text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm bg-opacity-90">
                                             {post.category}
                                         </div>
                                     </div>
                                     <div className="p-8 flex flex-col flex-grow">
                                         <span className="text-[#A69785] text-[11px] font-outersans font-bold tracking-widest uppercase mb-3 block">
                                             {new Date(post.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                         </span>
                                         <h3 className="text-2xl font-godber uppercase text-brand-primary mb-4 leading-tight group-hover:text-brand-support transition-colors">
                                             {post.title}
                                         </h3>
                                         <div className="mt-auto pt-6 border-t border-[#EAE3D9] flex items-center justify-between text-[#8C7A6B] font-clofie text-xs uppercase tracking-widest font-bold">
                                             <span>Leer Nota Completa</span>
                                             <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                         </div>
                                     </div>
                                 </Link>
                             </motion.article>
                         ))}
                     </AnimatePresence>
                 </motion.div>

                 {/* LOAD MORE BUTTON */}
                 {visibleCount < filteredPosts.length && (
                     <div className="flex justify-center items-center mt-16">
                         <button 
                             onClick={handleLoadMore}
                             className="bg-transparent border border-brand-primary text-brand-primary font-clofie font-bold uppercase tracking-widest px-10 py-3 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                         >
                             Cargar más
                         </button>
                     </div>
                 )}

                 {filteredPosts.length === 0 && (
                     <div className="text-center py-20">
                         <p className="text-lg text-[#594A42] font-clofie font-light">No hay novedades publicadas en esta categoría aún.</p>
                     </div>
                 )}
             </>
        )}
      </div>
    </div>
  );
};

export default Novedades;
