import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, Code, ArrowLeft, Image as ImageIcon, Tag, User, Calendar, Layout } from 'lucide-react';
import { NewsPost } from '../types/news';

const AdminNewsDraft: React.FC = () => {
  const [post, setPost] = useState<Partial<NewsPost>>({
    title: '',
    slug: '',
    coverImage: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    author: 'Equipo Gacela',
    category: 'Novedades',
    tags: [],
    isFeatured: false
  });

  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedJSON, setGeneratedJSON] = useState('');

  // Auto-generate slug from title
  useEffect(() => {
    if (post.title) {
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setPost(prev => ({ ...prev, slug }));
    }
  }, [post.title]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setPost(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTag = () => {
    if (tagInput && !post.tags?.includes(tagInput)) {
      setPost(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateJSONOutput = () => {
    const finalPost = {
      ...post,
      id: Date.now().toString()
    };
    setGeneratedJSON(JSON.stringify(finalPost, null, 2));
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif text-[#2B341F] mb-2 italic">Panel de Carga: Novedades</h1>
            <p className="text-[#2B341F]/60">Prepará tus notas para el catálogo B2B de Muebles Gacela.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="px-6 py-2 border border-[#2B341F] text-[#2B341F] rounded-full hover:bg-[#2B341F] hover:text-white transition-all flex items-center gap-2"
            >
              {showPreview ? <Layout size={18} /> : <Eye size={18} />}
              {showPreview ? 'Volver al Editor' : 'Ver Previa'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Editor Form */}
          {!showPreview ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-[#ECE2D2]"
            >
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#9B754E] font-bold mb-2">Título de la nota</label>
                  <input 
                    type="text" 
                    name="title"
                    value={post.title}
                    onChange={handleInputChange}
                    placeholder="Ej: Nueva Línea Kyoto"
                    className="w-full bg-[#F8F5F1] border-none p-4 rounded-lg focus:ring-2 focus:ring-[#9B754E] text-[#2B341F]"
                  />
                </div>

                {/* Slug display */}
                <div className="flex items-center gap-2 text-xs text-[#2B341F]/40 font-mono">
                  <span>URL Amigable: /novedades/</span>
                  <span className="text-[#9B754E]">{post.slug}</span>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#9B754E] font-bold mb-2 flex items-center gap-2">
                      <User size={14} /> Autor
                    </label>
                    <input 
                      type="text" 
                      name="author"
                      value={post.author}
                      onChange={handleInputChange}
                      className="w-full bg-[#F8F5F1] border-none p-4 rounded-lg focus:ring-2 focus:ring-[#9B754E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#9B754E] font-bold mb-2 flex items-center gap-2">
                       <Calendar size={14} /> Fecha
                    </label>
                    <input 
                      type="date" 
                      name="date"
                      value={post.date}
                      onChange={handleInputChange}
                      className="w-full bg-[#F8F5F1] border-none p-4 rounded-lg focus:ring-2 focus:ring-[#9B754E]"
                    />
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#9B754E] font-bold mb-2 flex items-center gap-2">
                    <ImageIcon size={14} /> URL Imagen de Portada
                  </label>
                  <input 
                    type="text" 
                    name="coverImage"
                    value={post.coverImage}
                    onChange={handleInputChange}
                    placeholder="/images/nombre-imagen.webp"
                    className="w-full bg-[#F8F5F1] border-none p-4 rounded-lg focus:ring-2 focus:ring-[#9B754E]"
                  />
                  <p className="mt-2 text-[10px] text-[#2B341F]/40 italic">Para usar imágenes externas, pegá el link completo (https://...)</p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#9B754E] font-bold mb-2 flex items-center gap-2">
                    Cuerpo de la nota (HTML permitido)
                  </label>
                  <textarea 
                    name="content"
                    value={post.content}
                    onChange={handleInputChange}
                    rows={10}
                    placeholder="<h2>Subtítulo</h2><p>Contenido aquí...</p>"
                    className="w-full bg-[#F8F5F1] border-none p-4 rounded-lg focus:ring-2 focus:ring-[#9B754E] font-sans"
                  />
                </div>

                {/* Tags & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#9B754E] font-bold mb-2 flex items-center gap-2">
                      <Tag size={14} /> Categoría
                    </label>
                    <select 
                      name="category"
                      value={post.category}
                      onChange={handleInputChange}
                      className="w-full bg-[#F8F5F1] border-none p-4 rounded-lg focus:ring-2 focus:ring-[#9B754E]"
                    >
                      <option value="Lanzamientos">Lanzamientos</option>
                      <option value="Tendencias">Tendencias</option>
                      <option value="Proyectos">Proyectos</option>
                      <option value="Institucional">Institucional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#9B754E] font-bold mb-2 flex items-center gap-2">
                      Etiquetas (Cruce con Productos)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        placeholder="Ej: Living"
                        className="flex-1 bg-[#F8F5F1] border-none p-4 rounded-lg focus:ring-2 focus:ring-[#9B754E]"
                      />
                      <button 
                        onClick={addTag}
                        className="px-4 bg-[#2B341F] text-white rounded-lg"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-[#ECE2D2] text-[#2B341F] text-xs rounded-full flex items-center gap-1">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit / Generate */}
                <button 
                  onClick={generateJSONOutput}
                  className="w-full py-4 bg-[#9B754E] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#866342] transition-colors flex items-center justify-center gap-3 mt-6 shadow-lg"
                >
                  <Code size={20} /> Generar Código para Cargar
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#2B341F] text-white p-8 rounded-2xl shadow-xl flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif italic flex items-center gap-2">
                   <Code className="text-[#9B754E]" /> Código Generado
                </h3>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedJSON);
                    alert('Código copiado al portapapeles. ¡Pasaselo a Antigravity!');
                  }}
                  className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition-all"
                >
                  Copiar Código
                </button>
              </div>
              <pre className="flex-1 bg-black/30 p-6 rounded-lg font-mono text-sm overflow-auto text-[#9B754E]">
                {generatedJSON || '// Completá el formulario para generar el código'}
              </pre>
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/70 italic flex items-center gap-2">
                   ℹ️ Copiá este código y pegalo en el chat. Yo me encargaré de subirlo a la base de datos de Muebles Gacela.
                </p>
              </div>
            </motion.div>
          )}

          {/* Right Column: Visual Preview Help */}
          <div className="hidden lg:block">
            <div className="sticky top-40 bg-white p-8 rounded-2xl border border-[#ECE2D2] shadow-sm">
              <h3 className="text-sm uppercase tracking-widest text-[#9B754E] font-bold mb-6">Guía de Estilo Gacela</h3>
              <ul className="space-y-4 text-[#2B341F]/80">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#9B754E] shrink-0">1</div>
                  <p className="text-sm"><strong>Títulos Cortos:</strong> Mantenelos por debajo de 60 caracteres para mejor lectura.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#9B754E] shrink-0">2</div>
                  <p className="text-sm"><strong>Etiquetas clave:</strong> Usá nombres de Ambientes (Living, Comedor) o Líneas (Kyoto, Lumo) para que el sistema le muestre productos relacionados al cliente.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#9B754E] shrink-0">3</div>
                  <p className="text-sm"><strong>HTML en Contenido:</strong> Podés usar <code>&lt;h2&gt;</code> para subtítulos y <code>&lt;strong&gt;</code> para resaltar beneficios.</p>
                </li>
              </ul>

              <div className="mt-12 pt-8 border-t border-[#ECE2D2]">
                <p className="text-[10px] text-[#2B341F]/30 uppercase tracking-[0.2em] font-bold">Estado del Sistema</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-[#2B341F]/60">Motor de Renderizado Listo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsDraft;
