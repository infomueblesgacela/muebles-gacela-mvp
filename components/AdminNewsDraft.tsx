import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, LogOut, Plus, Edit2, Trash2, Copy, Eye, Layout, 
  Image as ImageIcon, Tag, User, Calendar, Save, CheckCircle, 
  AlertCircle, Search, Filter, Star, ArrowLeft, ExternalLink, 
  Download, Upload, Sparkles, Sliders, Type, Bold, Italic, 
  List, Quote, Link as LinkIcon, RefreshCw, X, Maximize2, Columns
} from 'lucide-react';
import { NewsPost } from '../types/news';
import { 
  checkAdminAuth, loginAdmin, logoutAdmin, getAllNews, 
  createNewsPost, updateNewsPost, deleteNewsPost, 
  processSmartCoverImage, exportNewsJSON 
} from '../services/newsService';
import { slugify } from '../utils/slugify';

const CATEGORIES = ['Lanzamientos', 'Tendencias', 'Proyectos', 'Institucional', 'Diseño'];
const TAG_SUGGESTIONS = ['Kyoto', 'Nordik', 'Curvalba', 'Clásica', 'Gamer', 'Infantil', 'Living', 'Dormitorio', 'Comedor', 'Oficina'];

const AdminNewsDraft: React.FC = () => {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState(false);

  // --- DASHBOARD STATE ---
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- FORM STATE ---
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<NewsPost, 'id'>>({
    title: '',
    slug: '',
    shortDescription: '',
    coverImage: '',
    focalPoint: 'center',
    content: '',
    date: new Date().toISOString().split('T')[0],
    author: 'Equipo Gacela',
    category: 'Lanzamientos',
    tags: [],
    isFeatured: false,
    status: 'published'
  });

  const [tagInput, setTagInput] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageSizeInfo, setImageSizeInfo] = useState<{ width: number; height: number; sizeKb: number } | null>(null);
  const [editorTab, setEditorTab] = useState<'split' | 'write' | 'preview'>('split');
  const [inlineImageModalOpen, setInlineImageModalOpen] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState('');
  const [inlineImageCaption, setInlineImageCaption] = useState('');

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize auth check and load posts
  useEffect(() => {
    const isAuth = checkAdminAuth();
    setIsAuthenticated(isAuth);
    if (isAuth) {
      loadPosts();
    }
  }, []);

  const loadPosts = async () => {
    const data = await getAllNews(true);
    setPosts(data);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- AUTH HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(passwordInput, rememberMe);
    if (success) {
      setIsAuthenticated(true);
      setLoginError(false);
      setPasswordInput('');
      loadPosts();
      showToast('¡Bienvenido al Panel de Novedades de Muebles Gacela!');
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  // Auto-generate slug when title changes (only on create mode)
  useEffect(() => {
    if (editorMode === 'create' && formData.title) {
      const generatedSlug = slugify(formData.title);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, editorMode]);

  // --- CRUD ACTIONS ---
  const handleStartCreate = () => {
    setCurrentPostId(null);
    setEditorMode('create');
    setFormData({
      title: '',
      slug: '',
      shortDescription: '',
      coverImage: '',
      focalPoint: 'center',
      content: '<h2>El equilibrio perfecto entre diseño y confort</h2>\n<p>Escribe aquí el contenido de la nota de lanzamiento...</p>',
      date: new Date().toISOString().split('T')[0],
      author: 'Equipo Gacela',
      category: 'Lanzamientos',
      tags: ['Lanzamientos'],
      isFeatured: false,
      status: 'published'
    });
    setImageSizeInfo(null);
    setCurrentView('editor');
  };

  const handleStartEdit = (post: NewsPost) => {
    setCurrentPostId(post.id);
    setEditorMode('edit');
    setFormData({
      title: post.title,
      slug: post.slug,
      shortDescription: post.shortDescription || '',
      coverImage: post.coverImage,
      focalPoint: post.focalPoint || 'center',
      content: post.content,
      date: post.date,
      author: post.author,
      category: post.category,
      tags: post.tags || [],
      isFeatured: Boolean(post.isFeatured),
      status: post.status || 'published'
    });
    setImageSizeInfo(null);
    setCurrentView('editor');
  };

  const handleDuplicate = async (post: NewsPost) => {
    const duplicatedData: Omit<NewsPost, 'id'> = {
      ...post,
      title: `${post.title} (Copia)`,
      slug: `${post.slug}-copia-${Math.floor(Math.random() * 1000)}`,
      status: 'draft',
      isFeatured: false,
      date: new Date().toISOString().split('T')[0]
    };
    await createNewsPost(duplicatedData);
    await loadPosts();
    showToast(`Nota duplicada como borrador: "${duplicatedData.title}"`);
  };

  const handleDelete = async (id: string) => {
    await deleteNewsPost(id);
    setDeleteConfirmId(null);
    await loadPosts();
    showToast('Nota eliminada correctamente.');
  };

  const handleToggleFeatured = async (post: NewsPost) => {
    await updateNewsPost(post.id, { isFeatured: !post.isFeatured });
    await loadPosts();
    showToast(post.isFeatured ? 'Nota desmarcada de destacados' : '⭐ Nota marcada como destacada');
  };

  const handleSavePost = async (targetStatus?: 'published' | 'draft') => {
    if (!formData.title.trim()) {
      alert('Por favor, ingresa el título de la nota.');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Por favor, ingresa una URL amigable (slug).');
      return;
    }

    const finalStatus = targetStatus || formData.status || 'published';
    const payload = {
      ...formData,
      status: finalStatus,
      shortDescription: formData.shortDescription || formData.content.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...'
    };

    if (editorMode === 'create') {
      await createNewsPost(payload);
      showToast('🎉 ¡Novedad creada y publicada con éxito!');
    } else if (currentPostId) {
      await updateNewsPost(currentPostId, payload);
      showToast('✅ Novedad actualizada correctamente.');
    }

    await loadPosts();
    setCurrentView('dashboard');
  };

  // --- SMART COVER IMAGE PROCESSING ---
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      const processed = await processSmartCoverImage(file, {
        maxWidth: 1600,
        maxHeight: 900,
        quality: 0.84,
        focalPoint: formData.focalPoint
      });

      setFormData(prev => ({ ...prev, coverImage: processed.dataUrl }));
      setImageSizeInfo({
        width: processed.width,
        height: processed.height,
        sizeKb: processed.sizeKb
      });
      showToast(`Imagen procesada con éxito (${processed.width}x${processed.height}px - ${processed.sizeKb} KB)`);
    } catch (err: any) {
      alert('Error procesando imagen: ' + err.message);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // --- RICH TEXT TOOLBAR INSERTERS ---
  const insertFormatting = (before: string, after: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end) || 'Texto aquí';

    const newText = previousText.substring(0, start) + before + selectedText + after + previousText.substring(end);
    setFormData(prev => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 50);
  };

  const handleInsertInlineImage = () => {
    if (!inlineImageUrl.trim()) return;
    const captionHtml = inlineImageCaption.trim() 
      ? `<figcaption style="text-align:center;font-size:0.875rem;color:#7A6E65;margin-top:0.75rem;font-style:italic;">${inlineImageCaption}</figcaption>`
      : '';
    const imgTag = `\n<figure style="margin:2.5rem 0;">\n  <img src="${inlineImageUrl.trim()}" alt="${inlineImageCaption || formData.title}" style="width:100%;border-radius:16px;object-fit:cover;max-height:520px;box-shadow:0 10px 30px rgba(0,0,0,0.06);" />\n  ${captionHtml}\n</figure>\n`;
    
    insertFormatting(imgTag, '');
    setInlineImageUrl('');
    setInlineImageCaption('');
    setInlineImageModalOpen(false);
    showToast('Imagen incrustada en el cuerpo de la nota');
  };

  // Tags handler
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  // Filtered posts in dashboard
  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'Todas' || p.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'published' && p.status !== 'draft') || 
                          (filterStatus === 'draft' && p.status === 'draft');
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // --- RENDER LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-24 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-[#EAE3D9]"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#2B341F] text-[#9B754E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Lock size={24} />
            </div>
            <span className="text-[11px] font-outersans font-thin tracking-[0.4em] uppercase text-brand-support block mb-1">Muebles Gacela</span>
            <h1 className="text-3xl font-godber uppercase text-[#2B341F] tracking-wide">Backoffice</h1>
            <p className="text-xs text-[#594A42]/70 font-clofie mt-2">Acceso exclusivo para el equipo de Muebles Gacela</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-clofie font-bold text-[#594A42] mb-2">
                Contraseña de Administrador
              </label>
              <input 
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError(false);
                }}
                placeholder="••••••••••••"
                className={`w-full bg-[#FAF8F5] border ${loginError ? 'border-red-400 focus:ring-red-400' : 'border-[#EAE3D9] focus:ring-[#9B754E]'} p-3.5 rounded-xl focus:outline-none focus:ring-2 text-[#2B341F] transition-all`}
                autoFocus
              />
              {loginError && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-xs text-red-500 font-clofie mt-2 flex items-center gap-1.5"
                >
                  <AlertCircle size={14} /> Contraseña incorrecta. Inténtalo de nuevo.
                </motion.p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-clofie text-[#594A42]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#EAE3D9] text-[#9B754E] focus:ring-[#9B754E]"
                />
                <span>Recordar sesión por 30 días</span>
              </label>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-[#2B341F] text-white rounded-xl font-clofie font-bold uppercase tracking-widest hover:bg-[#9B754E] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Ingresar al Sistema</span>
              <ArrowLeft size={16} className="rotate-180" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- RENDER MAIN BACKOFFICE ---
  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-24 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        
        {/* TOAST ALERT */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 bg-[#2B341F] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-[#9B754E]/40"
            >
              <CheckCircle size={18} className="text-[#9B754E]" />
              <span className="text-sm font-clofie font-medium">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ADMIN TOP NAVBAR */}
        <header className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2B341F] text-[#9B754E] rounded-xl flex items-center justify-center font-godber text-xl">
              MG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-godber uppercase text-[#2B341F] tracking-wide">Gestor de Novedades</h1>
                <span className="px-2.5 py-0.5 bg-[#9B754E]/10 text-[#9B754E] text-[10px] uppercase font-bold tracking-widest rounded-full">B2B Admin</span>
              </div>
              <p className="text-xs text-[#594A42]/70 font-clofie">Administración y publicación de notas, lanzamientos y tendencias</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <a 
              href="/novedades" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#FAF8F5] text-[#2B341F] text-xs font-clofie font-bold uppercase tracking-widest rounded-xl hover:bg-[#EAE3D9] transition-all flex items-center gap-2 border border-[#EAE3D9]"
            >
              <ExternalLink size={14} /> Ver Novedades Online
            </a>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 text-xs font-clofie font-bold uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </header>

        {/* VIEW 1: DASHBOARD LIST */}
        {currentView === 'dashboard' ? (
          <div>
            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-[#EAE3D9] shadow-sm">
                <span className="text-[11px] uppercase tracking-widest font-clofie text-[#7A6E65] block mb-1">Total Novedades</span>
                <span className="text-3xl font-godber text-[#2B341F]">{posts.length}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#EAE3D9] shadow-sm">
                <span className="text-[11px] uppercase tracking-widest font-clofie text-[#7A6E65] block mb-1">Publicadas</span>
                <span className="text-3xl font-godber text-emerald-700">{posts.filter(p => p.status !== 'draft').length}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#EAE3D9] shadow-sm">
                <span className="text-[11px] uppercase tracking-widest font-clofie text-[#7A6E65] block mb-1">Borradores</span>
                <span className="text-3xl font-godber text-amber-700">{posts.filter(p => p.status === 'draft').length}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#EAE3D9] shadow-sm">
                <span className="text-[11px] uppercase tracking-widest font-clofie text-[#7A6E65] block mb-1">Destacadas</span>
                <span className="text-3xl font-godber text-[#9B754E]">{posts.filter(p => p.isFeatured).length}</span>
              </div>
            </div>

            {/* ACTION & FILTER BAR */}
            <div className="bg-white p-5 rounded-2xl border border-[#EAE3D9] shadow-sm mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6E65]" />
                  <input 
                    type="text" 
                    placeholder="Buscar por título, slug o etiqueta..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D9] pl-10 pr-4 py-2.5 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                  />
                </div>

                {/* Category filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#FAF8F5] border border-[#EAE3D9] px-4 py-2.5 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                >
                  <option value="Todas">Todas las Categorías</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Status filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#FAF8F5] border border-[#EAE3D9] px-4 py-2.5 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="published">Solo Publicadas</option>
                  <option value="draft">Solo Borradores</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const json = exportNewsJSON();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `muebles-gacela-news-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    showToast('Backup JSON descargado');
                  }}
                  className="px-4 py-2.5 bg-[#FAF8F5] text-[#594A42] text-xs font-clofie font-bold uppercase tracking-wider rounded-xl hover:bg-[#EAE3D9] transition-all flex items-center gap-2 border border-[#EAE3D9]"
                  title="Descargar respaldo JSON de las notas"
                >
                  <Download size={15} /> Backup
                </button>

                <button 
                  onClick={handleStartCreate}
                  className="px-6 py-2.5 bg-[#2B341F] text-white text-xs font-clofie font-bold uppercase tracking-widest rounded-xl hover:bg-[#9B754E] transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Plus size={16} /> Nueva Novedad
                </button>
              </div>
            </div>

            {/* POSTS TABLE / CARDS */}
            <div className="bg-white rounded-2xl border border-[#EAE3D9] shadow-sm overflow-hidden">
              {filteredPosts.length === 0 ? (
                <div className="p-16 text-center text-[#7A6E65]">
                  <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-base font-clofie font-medium">No se encontraron novedades con los filtros seleccionados.</p>
                  <button 
                    onClick={handleStartCreate}
                    className="mt-4 px-6 py-2.5 bg-[#9B754E] text-white text-xs font-clofie font-bold uppercase tracking-widest rounded-xl inline-flex items-center gap-2"
                  >
                    <Plus size={16} /> Crear la Primera Novedad
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#EAE3D9]">
                  {filteredPosts.map(post => (
                    <div key={post.id} className="p-5 hover:bg-[#FAF8F5]/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Cover thumbnail with smart object-fit */}
                        <div className="w-20 h-16 rounded-xl overflow-hidden bg-[#EAE3D9] shrink-0 border border-[#EAE3D9]/60 shadow-inner relative">
                          <img 
                            src={post.coverImage || 'https://placehold.co/600x400/f2f2f2/1a1a1a?text=Sin+Portada'} 
                            alt={post.title} 
                            style={{ objectPosition: post.focalPoint || 'center' }}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/f2f2f2/1a1a1a?text=Sin+Portada'; }}
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-[#9B754E]/10 text-[#9B754E] text-[10px] font-bold uppercase tracking-wider rounded-md">
                              {post.category}
                            </span>
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${post.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {post.status === 'draft' ? 'Borrador' : 'Publicada'}
                            </span>
                            {post.isFeatured && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                                <Star size={10} className="fill-yellow-600 text-yellow-600" /> Destacada
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-godber uppercase text-[#2B341F] tracking-wide leading-tight">
                            {post.title}
                          </h3>
                          
                          <div className="flex items-center gap-4 text-xs font-clofie text-[#7A6E65]">
                            <span>📅 {post.date}</span>
                            <span>✍️ {post.author}</span>
                            <span className="text-[11px] text-[#9B754E]">/novedades/{post.slug}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button 
                          onClick={() => handleToggleFeatured(post)}
                          className={`p-2 rounded-xl border transition-all ${post.isFeatured ? 'bg-yellow-50 border-yellow-300 text-yellow-600' : 'bg-white border-[#EAE3D9] text-[#7A6E65] hover:bg-[#FAF8F5]'}`}
                          title={post.isFeatured ? 'Quitar de destacados' : 'Marcar como destacada'}
                        >
                          <Star size={16} className={post.isFeatured ? 'fill-yellow-600' : ''} />
                        </button>

                        <a 
                          href={`/novedades/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white border border-[#EAE3D9] text-[#7A6E65] hover:bg-[#FAF8F5] hover:text-[#2B341F] transition-all"
                          title="Ver en vivo"
                        >
                          <Eye size={16} />
                        </a>

                        <button 
                          onClick={() => handleDuplicate(post)}
                          className="p-2 rounded-xl bg-white border border-[#EAE3D9] text-[#7A6E65] hover:bg-[#FAF8F5] hover:text-[#2B341F] transition-all"
                          title="Duplicar nota"
                        >
                          <Copy size={16} />
                        </button>

                        <button 
                          onClick={() => handleStartEdit(post)}
                          className="px-3.5 py-2 bg-[#2B341F] text-white text-xs font-clofie font-bold uppercase tracking-wider rounded-xl hover:bg-[#9B754E] transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Edit2 size={14} /> Editar
                        </button>

                        {deleteConfirmId === post.id ? (
                          <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200">
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-bold rounded-lg hover:bg-red-700"
                            >
                              Sí, Borrar
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 text-xs text-gray-600 hover:text-black"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirmId(post.id)}
                            className="p-2 rounded-xl bg-white border border-[#EAE3D9] text-red-500 hover:bg-red-50 transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* VIEW 2: EDITOR / FORM VIEW */
          <div>
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 bg-white border border-[#EAE3D9] text-[#2B341F] text-xs font-clofie font-bold uppercase tracking-widest rounded-xl hover:bg-[#FAF8F5] transition-all flex items-center gap-2 shadow-sm"
              >
                <ArrowLeft size={16} /> Volver al Listado
              </button>

              {/* Editor Tabs: Write / Preview / Split */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EAE3D9] shadow-sm">
                <button 
                  onClick={() => setEditorTab('write')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-clofie font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${editorTab === 'write' ? 'bg-[#2B341F] text-white' : 'text-[#7A6E65] hover:bg-[#FAF8F5]'}`}
                >
                  <Type size={14} /> Solo Editor
                </button>
                <button 
                  onClick={() => setEditorTab('split')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-clofie font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${editorTab === 'split' ? 'bg-[#2B341F] text-white' : 'text-[#7A6E65] hover:bg-[#FAF8F5]'}`}
                >
                  <Columns size={14} /> Pantalla Dividida
                </button>
                <button 
                  onClick={() => setEditorTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-clofie font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${editorTab === 'preview' ? 'bg-[#2B341F] text-white' : 'text-[#7A6E65] hover:bg-[#FAF8F5]'}`}
                >
                  <Eye size={14} /> Vista Previa
                </button>
              </div>

              {/* Action Save Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSavePost('draft')}
                  className="px-4 py-2 bg-white border border-[#EAE3D9] text-[#594A42] text-xs font-clofie font-bold uppercase tracking-widest rounded-xl hover:bg-[#FAF8F5] transition-all"
                >
                  Guardar Borrador
                </button>
                <button 
                  onClick={() => handleSavePost('published')}
                  className="px-6 py-2 bg-[#2B341F] text-white text-xs font-clofie font-bold uppercase tracking-widest rounded-xl hover:bg-[#9B754E] transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Save size={15} /> {editorMode === 'create' ? 'Publicar Novedad' : 'Guardar Cambios'}
                </button>
              </div>
            </div>

            <div className={`grid gap-8 ${editorTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              
              {/* LEFT COLUMN: FORM CONTROLS */}
              {(editorTab === 'write' || editorTab === 'split') && (
                <div className="space-y-6">
                  {/* METADATA CARD */}
                  <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-sm space-y-4">
                    <h3 className="text-sm font-godber uppercase text-[#2B341F] tracking-wider border-b border-[#EAE3D9] pb-3">
                      1. Información Principal
                    </h3>

                    {/* Title */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-clofie font-bold text-[#594A42] mb-1.5">
                        Título de la Novedad *
                      </label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej: Muebles Gacela presenta su nueva línea Kyoto"
                        className="w-full bg-[#FAF8F5] border border-[#EAE3D9] p-3.5 rounded-xl text-sm font-medium text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-clofie font-bold text-[#594A42] mb-1.5">
                        URL Amigable (Slug) *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#7A6E65] font-mono bg-[#FAF8F5] px-3 py-3 rounded-xl border border-[#EAE3D9]">/novedades/</span>
                        <input 
                          type="text" 
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                          placeholder="mi-novedad-ejemplo"
                          className="flex-1 bg-[#FAF8F5] border border-[#EAE3D9] p-3 rounded-xl text-xs font-mono text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                        />
                      </div>
                    </div>

                    {/* Short Description (Copete) */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-clofie font-bold text-[#594A42] mb-1.5 flex items-center justify-between">
                        <span>Copete / Descripción Corta (para tarjetas de catálogo y SEO)</span>
                        <span className="text-[10px] text-[#7A6E65] font-mono">{(formData.shortDescription || '').length} caracteres</span>
                      </label>
                      <textarea 
                        rows={3}
                        value={formData.shortDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                        placeholder="Breve resumen de 1 o 2 oraciones para la vista previa..."
                        className="w-full bg-[#FAF8F5] border border-[#EAE3D9] p-3 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                      />
                    </div>

                    {/* Category, Author, Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] uppercase tracking-widest font-clofie font-bold text-[#594A42] mb-1.5">Categoría</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-[#FAF8F5] border border-[#EAE3D9] p-2.5 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-widest font-clofie font-bold text-[#594A42] mb-1.5">Autor</label>
                        <input 
                          type="text" 
                          value={formData.author}
                          onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                          className="w-full bg-[#FAF8F5] border border-[#EAE3D9] p-2.5 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-widest font-clofie font-bold text-[#594A42] mb-1.5">Fecha</label>
                        <input 
                          type="date" 
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-[#FAF8F5] border border-[#EAE3D9] p-2.5 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                        />
                      </div>
                    </div>

                    {/* Featured Checkbox */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#EAE3D9]">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                          className="rounded border-[#EAE3D9] text-[#9B754E] focus:ring-[#9B754E]"
                        />
                        <span className="text-xs font-clofie font-bold uppercase tracking-wider text-[#2B341F]">
                          Destacar en la portada principal (Home)
                        </span>
                      </label>

                      <div className="flex items-center gap-2 text-xs font-clofie">
                        <span className="text-[#7A6E65]">Estado:</span>
                        <span className={`font-bold uppercase tracking-wider ${formData.status === 'draft' ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {formData.status === 'draft' ? 'Borrador' : 'Publicada'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SMART COVER IMAGE ENGINE CARD */}
                  <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-3">
                      <h3 className="text-sm font-godber uppercase text-[#2B341F] tracking-wider flex items-center gap-2">
                        <ImageIcon size={16} className="text-[#9B754E]" /> 2. Motor de Imagen de Portada
                      </h3>
                      <span className="text-[11px] font-mono text-[#9B754E] bg-[#9B754E]/10 px-2 py-0.5 rounded">
                        Smart Cropping
                      </span>
                    </div>

                    {/* Visual Ideal Size Suggestion Banner */}
                    <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#9B754E]/30 flex items-start gap-3">
                      <Sparkles size={18} className="text-[#9B754E] shrink-0 mt-0.5" />
                      <div className="text-xs text-[#594A42]">
                        <p className="font-bold text-[#2B341F]">📐 Tamaño ideal recomendado: 1200 x 630 px (proporción 1.91:1)</p>
                        <p className="text-[11px] text-[#7A6E65] mt-0.5">
                          Si subes una foto con otra proporción o tamaño, nuestro motor la adaptará automáticamente sin deformarla gracias al encuadre inteligente.
                        </p>
                      </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* File Upload / Drag & Drop */}
                      <div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleCoverFileUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <button 
                          type="button"
                          disabled={isProcessingImage}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-4 px-4 border-2 border-dashed border-[#EAE3D9] hover:border-[#9B754E] rounded-xl bg-[#FAF8F5] hover:bg-white text-center transition-all flex flex-col items-center justify-center gap-1.5 group"
                        >
                          {isProcessingImage ? (
                            <RefreshCw size={20} className="animate-spin text-[#9B754E]" />
                          ) : (
                            <Upload size={20} className="text-[#7A6E65] group-hover:text-[#9B754E] transition-colors" />
                          )}
                          <span className="text-xs font-clofie font-bold uppercase tracking-wider text-[#2B341F]">
                            {isProcessingImage ? 'Procesando en Canvas...' : 'Subir desde dispositivo'}
                          </span>
                          <span className="text-[10px] text-[#7A6E65]">WebP, JPG o PNG</span>
                        </button>
                      </div>

                      {/* URL Input */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-clofie text-[#7A6E65] mb-1">O pegar enlace directo:</label>
                        <input 
                          type="text" 
                          value={formData.coverImage}
                          onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                          placeholder="https://... o /articulos-gacela-muebles-2026/..."
                          className="w-full bg-[#FAF8F5] border border-[#EAE3D9] p-3 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                        />
                        {imageSizeInfo && (
                          <p className="text-[10px] text-emerald-700 font-mono mt-1">
                            ✓ Optimizado: {imageSizeInfo.width}x{imageSizeInfo.height}px ({imageSizeInfo.sizeKb} KB)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Focal Point Alignment */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-clofie font-bold text-[#594A42] mb-2 flex items-center justify-between">
                        <span>Punto de Enfoque / Centrado (Focal Point)</span>
                        <span className="text-[10px] text-[#9B754E] lowercase font-mono">object-position: {formData.focalPoint}</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['top', 'center', 'bottom'] as const).map(fp => (
                          <button
                            key={fp}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, focalPoint: fp }))}
                            className={`py-2 px-3 rounded-xl text-xs font-clofie font-bold uppercase tracking-wider border transition-all ${formData.focalPoint === fp ? 'bg-[#2B341F] text-white border-[#2B341F]' : 'bg-[#FAF8F5] border-[#EAE3D9] text-[#594A42] hover:bg-white'}`}
                          >
                            {fp === 'top' ? 'Superior ⬆️' : fp === 'center' ? 'Centro 🎯' : 'Inferior ⬇️'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RICH BODY EDITOR WITH MULTIMEDIA */}
                  <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-3">
                      <h3 className="text-sm font-godber uppercase text-[#2B341F] tracking-wider flex items-center gap-2">
                        <Type size={16} className="text-[#9B754E]" /> 3. Cuerpo de la Nota Enriquecido
                      </h3>
                      <button 
                        type="button"
                        onClick={() => setInlineImageModalOpen(true)}
                        className="px-3 py-1 bg-[#9B754E]/10 text-[#9B754E] text-xs font-clofie font-bold uppercase tracking-wider rounded-lg hover:bg-[#9B754E] hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <ImageIcon size={14} /> + Incrustar Imagen
                      </button>
                    </div>

                    {/* FORMATTING TOOLBAR */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF8F5] p-2 rounded-xl border border-[#EAE3D9]">
                      <button 
                        type="button"
                        onClick={() => insertFormatting('<h2>', '</h2>')}
                        className="px-2.5 py-1 text-xs font-bold text-[#2B341F] hover:bg-white rounded border border-transparent hover:border-[#EAE3D9]"
                        title="Título de Sección (H2)"
                      >
                        H2
                      </button>
                      <button 
                        type="button"
                        onClick={() => insertFormatting('<h3>', '</h3>')}
                        className="px-2.5 py-1 text-xs font-bold text-[#2B341F] hover:bg-white rounded border border-transparent hover:border-[#EAE3D9]"
                        title="Subtítulo (H3)"
                      >
                        H3
                      </button>
                      <span className="h-4 w-px bg-[#EAE3D9] mx-1"></span>
                      <button 
                        type="button"
                        onClick={() => insertFormatting('<strong>', '</strong>')}
                        className="p-1.5 text-[#2B341F] hover:bg-white rounded border border-transparent hover:border-[#EAE3D9]"
                        title="Negrita"
                      >
                        <Bold size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => insertFormatting('<em>', '</em>')}
                        className="p-1.5 text-[#2B341F] hover:bg-white rounded border border-transparent hover:border-[#EAE3D9]"
                        title="Cursiva"
                      >
                        <Italic size={14} />
                      </button>
                      <span className="h-4 w-px bg-[#EAE3D9] mx-1"></span>
                      <button 
                        type="button"
                        onClick={() => insertFormatting('<blockquote>\n  <p>', '</p>\n</blockquote>')}
                        className="p-1.5 text-[#2B341F] hover:bg-white rounded border border-transparent hover:border-[#EAE3D9]"
                        title="Cita destacada"
                      >
                        <Quote size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n  <li>Elemento 2</li>\n</ul>')}
                        className="p-1.5 text-[#2B341F] hover:bg-white rounded border border-transparent hover:border-[#EAE3D9]"
                        title="Lista de viñetas"
                      >
                        <List size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => insertFormatting('<a href="/productos" style="color:#9B754E;text-decoration:underline;">', '</a>')}
                        className="p-1.5 text-[#2B341F] hover:bg-white rounded border border-transparent hover:border-[#EAE3D9]"
                        title="Enlace"
                      >
                        <LinkIcon size={14} />
                      </button>
                    </div>

                    {/* Content Textarea */}
                    <textarea 
                      ref={contentTextareaRef}
                      rows={14}
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Escribe aquí el contenido enriquecido de la nota..."
                      className="w-full bg-[#FAF8F5] border border-[#EAE3D9] p-4 rounded-xl text-sm text-[#2B341F] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                    />
                  </div>

                  {/* TAGS & CATALOG CROSS-SELLING */}
                  <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-sm space-y-4">
                    <h3 className="text-sm font-godber uppercase text-[#2B341F] tracking-wider border-b border-[#EAE3D9] pb-3 flex items-center gap-2">
                      <Tag size={16} className="text-[#9B754E]" /> 4. Etiquetas y Cruce con Catálogo
                    </h3>
                    <p className="text-xs text-[#7A6E65]">
                      Las etiquetas coinciden automáticamente con las Líneas o Ambientes de muebles para mostrar productos relacionados al final de la nota.
                    </p>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Escribir etiqueta y presionar Enter..."
                        className="flex-1 bg-[#FAF8F5] border border-[#EAE3D9] p-3 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                      />
                      <button 
                        type="button"
                        onClick={handleAddTag}
                        className="px-5 bg-[#2B341F] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#9B754E] transition-all"
                      >
                        Agregar
                      </button>
                    </div>

                    {/* Suggested tag badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-[#7A6E65] self-center mr-1">Sugeridas:</span>
                      {TAG_SUGGESTIONS.map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            if (!formData.tags.includes(st)) {
                              setFormData(prev => ({ ...prev, tags: [...prev.tags, st] }));
                            }
                          }}
                          className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EAE3D9] text-[#594A42] text-[11px] font-clofie rounded-lg border border-[#EAE3D9] transition-colors"
                        >
                          + {st}
                        </button>
                      ))}
                    </div>

                    {/* Active tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.tags.map(t => (
                        <span key={t} className="px-3 py-1.5 bg-[#9B754E]/10 text-[#9B754E] text-xs font-clofie font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 border border-[#9B754E]/20">
                          {t}
                          <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-red-600">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT COLUMN: LIVE REAL-TIME PREVIEWS */}
              {(editorTab === 'preview' || editorTab === 'split') && (
                <div className="space-y-6">
                  {/* PREVIEW 1: HERO VIEW (SINGLEPOST) */}
                  <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-3">
                      <h3 className="text-sm font-godber uppercase text-[#2B341F] tracking-wider">
                        Vista Previa 1: Hero Principal (Página de Nota)
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-mono text-[#7A6E65]">100% Responsive</span>
                    </div>

                    <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg bg-[#2B341F]">
                      <img 
                        src={formData.coverImage || 'https://placehold.co/1200x630/2B341F/FAF8F5?text=Portada+de+la+Novedad'} 
                        alt={formData.title} 
                        style={{ objectPosition: formData.focalPoint || 'center' }}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x630/2B341F/FAF8F5?text=Sin+Imagen'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 flex flex-col justify-end p-6 text-white">
                        <span className="text-[10px] uppercase tracking-[0.3em] font-outersans text-[#9B754E] mb-1 font-bold">
                          {formData.category}
                        </span>
                        <h2 className="text-xl md:text-2xl font-godber uppercase tracking-wide leading-tight mb-2">
                          {formData.title || 'Título de la Novedad'}
                        </h2>
                        <div className="flex items-center gap-4 text-[11px] text-white/80 font-clofie">
                          <span>✍️ {formData.author}</span>
                          <span>📅 {formData.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PREVIEW 2: HOME / CATALOG CARD PREVIEW */}
                  <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-3">
                      <h3 className="text-sm font-godber uppercase text-[#2B341F] tracking-wider">
                        Vista Previa 2: Tarjeta en Home / Magazzine
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-mono text-[#7A6E65]">Aspect Ratio 4/5</span>
                    </div>

                    <div className="max-w-xs mx-auto bg-white rounded-2xl overflow-hidden border border-[#EAE3D9] shadow-sm">
                      <div className="aspect-[4/5] overflow-hidden relative bg-[#FAF8F5]">
                        <img 
                          src={formData.coverImage || 'https://placehold.co/600x750/f2f2f2/1a1a1a?text=Tarjeta+Portada'} 
                          alt={formData.title} 
                          style={{ objectPosition: formData.focalPoint || 'center' }}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x750/f2f2f2/1a1a1a?text=Sin+Imagen'; }}
                        />
                        <div className="absolute top-3 left-3 bg-[#2B341F]/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-clofie font-bold">
                          {formData.category}
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-base font-godber uppercase text-[#2B341F] tracking-wide line-clamp-2 leading-tight">
                          {formData.title || 'Título de la Novedad'}
                        </h4>
                        <p className="text-xs text-[#594A42]/80 font-clofie line-clamp-2">
                          {formData.shortDescription || 'Copete o descripción corta del artículo...'}
                        </p>
                        <div className="pt-2 flex items-center justify-between text-[10px] text-[#7A6E65] font-clofie border-t border-[#EAE3D9]">
                          <span>{formData.date}</span>
                          <span className="text-[#9B754E] font-bold uppercase tracking-wider">Leer más →</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PREVIEW 3: BODY PROSE ARTICLE */}
                  <div className="bg-white p-6 rounded-2xl border border-[#EAE3D9] shadow-sm space-y-4">
                    <h3 className="text-sm font-godber uppercase text-[#2B341F] tracking-wider border-b border-[#EAE3D9] pb-3">
                      Vista Previa 3: Renderizado del Contenido
                    </h3>
                    <div 
                      className="prose prose-sm max-w-none prose-p:font-clofie prose-p:text-[#594A42] prose-headings:font-godber prose-headings:uppercase prose-headings:text-[#2B341F] p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9]/60"
                      dangerouslySetInnerHTML={{ __html: formData.content || '<p className="italic text-gray-400">Sin contenido escrito aún...</p>' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: INSERT INLINE IMAGE */}
        <AnimatePresence>
          {inlineImageModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-[#EAE3D9] space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-3">
                  <h3 className="text-base font-godber uppercase text-[#2B341F] tracking-wide flex items-center gap-2">
                    <ImageIcon size={18} className="text-[#9B754E]" /> Incrustar Imagen en la Nota
                  </h3>
                  <button onClick={() => setInlineImageModalOpen(false)} className="text-gray-400 hover:text-black">
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-clofie font-bold text-[#594A42] mb-1.5">
                    URL de la Imagen *
                  </label>
                  <input 
                    type="text" 
                    value={inlineImageUrl}
                    onChange={(e) => setInlineImageUrl(e.target.value)}
                    placeholder="https://... o /articulos-gacela-muebles-2026/..."
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D9] p-3 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-clofie font-bold text-[#594A42] mb-1.5">
                    Pie de Foto / Epígrafe (Opcional)
                  </label>
                  <input 
                    type="text" 
                    value={inlineImageCaption}
                    onChange={(e) => setInlineImageCaption(e.target.value)}
                    placeholder="Ej: Vista frontal del Centro de Entretenimiento KOBE"
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D9] p-3 rounded-xl text-xs text-[#2B341F] focus:outline-none focus:ring-2 focus:ring-[#9B754E]"
                  />
                </div>

                {inlineImageUrl && (
                  <div className="h-36 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#EAE3D9]">
                    <img src={inlineImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE3D9]">
                  <button 
                    type="button" 
                    onClick={() => setInlineImageModalOpen(false)}
                    className="px-4 py-2 text-xs font-clofie font-bold uppercase tracking-wider text-[#594A42] hover:bg-[#FAF8F5] rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    onClick={handleInsertInlineImage}
                    className="px-5 py-2 bg-[#2B341F] text-white text-xs font-clofie font-bold uppercase tracking-wider rounded-xl hover:bg-[#9B754E] transition-all"
                  >
                    Incrustar en el Texto
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default AdminNewsDraft;
