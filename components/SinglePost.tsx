import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { NewsPost } from '../types/news';
import { fetchNewsBySlug } from '../services/apiNews';
import db from '../data/productos.json';
import { slugify } from '../utils/slugify';

const SinglePost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await fetchNewsBySlug(slug);
      setPost(data);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };

    loadPost();
  }, [slug]);

  // Related products logic: Match tags with Linea or Ambiente
  const relatedProducts = useMemo(() => {
    if (!post || !post.tags) return [];
    const tagsLower = post.tags.map(t => t.toLowerCase());
    
    return db.products.filter(p => {
       const linea = (p.Linea as string)?.toLowerCase() || '';
       const ambiente = (p.Ambiente as string)?.toLowerCase() || '';
       return tagsLower.includes(linea) || tagsLower.includes(ambiente);
    }).slice(0, 4); // Limit to 4 related products
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
         <div className="w-16 h-16 border-4 border-brand-support border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-godber text-brand-primary mb-4">Post no encontrado</h1>
        <p className="text-lg font-clofie text-[#594A42] mb-8">No pudimos encontrar el artículo que buscabas.</p>
        <button 
          onClick={() => navigate('/novedades')}
          className="bg-brand-primary text-white px-8 py-3 rounded-full font-clofie font-bold uppercase tracking-widest hover:bg-brand-support transition-colors"
        >
          Volver a Novedades
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen pb-32">
      {/* HEADER HERO */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-end justify-center pb-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 max-w-4xl text-center">
          <button 
            onClick={() => navigate('/novedades')}
            className="absolute top-[-40vh] md:top-[-50vh] left-6 text-white/80 hover:text-white flex items-center gap-2 font-clofie font-light tracking-widest uppercase text-sm border-b border-white/30 pb-1 hover:border-white transition-colors"
          >
            <ChevronLeft size={16} /> Volver
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-1.5 bg-brand-support/90 backdrop-blur-md text-white text-[11px] font-outersans font-thin uppercase tracking-[0.3em] rounded-full mb-6">
                {post.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-godber font-normal uppercase tracking-[0.05em] text-white leading-tight mb-8">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 font-clofie font-light text-sm">
                <div className="flex items-center gap-2">
                    <User size={16} className="text-brand-support" />
                    <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-brand-support" />
                    <span>{new Date(post.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RICH TEXT CONTENT */}
      <section className="py-20 px-6">
          <div className="container mx-auto max-w-3xl">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="prose prose-lg prose-p:font-clofie prose-p:font-light prose-p:text-[#594A42] prose-p:leading-relaxed prose-p:text-lg prose-headings:font-godber prose-headings:uppercase prose-headings:text-brand-primary prose-headings:tracking-wide w-full max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              {/* TAGS */}
              {post.tags && post.tags.length > 0 && (
                  <div className="mt-16 pt-8 border-t border-[#EAE3D9] flex flex-wrap items-center gap-3">
                      <Tag size={18} className="text-[#A69785]" />
                      {post.tags.map(tag => (
                          <span key={tag} className="px-4 py-1.5 bg-[#EAE3D9] text-[#594A42] text-[12px] font-clofie font-bold tracking-widest uppercase rounded-full hover:bg-brand-support hover:text-white transition-colors cursor-pointer">
                              {tag}
                          </span>
                      ))}
                  </div>
              )}
          </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
          <section className="pt-16 px-6 pb-24">
              <div className="container mx-auto max-w-7xl border-t border-[#D9CDB8]/40 pt-20">
                  <div className="text-center mb-14">
                      <h2 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-support mb-4">Catálogo Relacionado</h2>
                      <h3 className="text-3xl md:text-5xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary">Productos Destacados</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
                      {relatedProducts.map((product, idx) => {
                          const fotos = product.Fotos_Mueble ? (product.Fotos_Mueble as string).split(/[;,]\s*/).filter(Boolean) : [];
                          const mainPhoto = fotos.length > 0 ? fotos[0] : 'https://placehold.co/600x800/f2f2f2/1a1a1a?text=Foto+Pendiente';
                          const lineaSlug = product.Linea ? slugify(product.Linea as string) : 'producto';
                          const productUrl = `/${lineaSlug}/${product.SKU}`;
                          
                          return (
                              <motion.div
                                  key={product.SKU}
                                  initial={{ opacity: 0, y: 24 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: idx * 0.08 }}
                                  className="group flex flex-col cursor-pointer"
                              >
                                  <Link to={productUrl} onClick={() => window.scrollTo(0,0)} className="block w-full">
                                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-white shadow-sm group-hover:shadow-md transition-all duration-300">
                                          <img
                                              src={mainPhoto}
                                              alt={product.Nombre_Comercial as string}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                              onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x800/f2f2f2/1a1a1a?text=Foto+Pendiente'; }}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                          <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                              <span className="inline-flex items-center gap-1.5 text-white text-[10px] font-clofie font-bold uppercase tracking-widest">
                                                  Ver Detalles <ArrowRight size={10} />
                                              </span>
                                          </div>
                                      </div>
                                      <span className="inline-block px-2 py-0.5 bg-[#EAE3D9] text-[#8C7A6B] text-[9px] font-outersans font-thin uppercase tracking-[0.2em] rounded-full mb-1.5">
                                          {product.Linea as string} · {product.Ambiente as string}
                                      </span>
                                      <h3 className="text-sm font-godber uppercase text-brand-primary tracking-wide group-hover:text-brand-support transition-colors leading-tight">
                                          {product.Nombre_Comercial as string}
                                      </h3>
                                  </Link>
                              </motion.div>
                          );
                      })}
                  </div>

                  <div className="mt-14 text-center">
                      <Link
                          to="/productos"
                          onClick={() => window.scrollTo(0,0)}
                          className="inline-flex items-center gap-3 px-8 py-3.5 border border-brand-primary text-brand-primary text-[12px] font-clofie font-bold uppercase tracking-[0.2em] rounded-full hover:bg-brand-primary hover:text-white transition-all duration-300"
                      >
                          Ver Catálogo Completo <ArrowRight size={14} />
                      </Link>
                  </div>
              </div>
          </section>
      )}

    </div>
  );
};

export default SinglePost;
