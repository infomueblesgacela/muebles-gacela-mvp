
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, FileText, Upload, Send, MessageCircle, X, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { sendRRHHEmail, uploadAttachment } from '../utils/email';

const WorkWithUs: React.FC = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCV, setSelectedCV] = useState<File | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage(null);
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const nombre    = data.get('nombre')    as string || '';
    const email     = data.get('email')     as string || '';
    const telefono  = data.get('telefono')  as string || 'No provisto';
    const ubicacion = data.get('ubicacion') as string || 'No provista';
    const area      = data.get('area')      as string || 'Sin especificar';
    const presentacion = data.get('presentacion') as string || '';

    try {
      let attachmentUrl = '';
      if (selectedCV) {
        // Subir el archivo temporalmente para obtener una URL pública para el mail
        attachmentUrl = await uploadAttachment(selectedCV);
      }

      const fileMessage = selectedCV 
        ? `CV Adjunto: ${selectedCV.name} (${(selectedCV.size/1024).toFixed(1)} KB)\nURL de descarga: ${attachmentUrl}` 
        : 'Sin adjunto';

      await sendRRHHEmail({
        from_name:      nombre,
        from_email:     email,
        phone:          telefono,
        city:           ubicacion,
        interest_area:  area,
        message:        presentacion,
        attachment_url: attachmentUrl,
      });

      setFormStatus('success');
      setSelectedCV(null);
      form.reset();
    } catch (err: any) {
      console.error('[WorkWithUs] Error al enviar postulación:', err);
      setFormStatus('error');
      setErrorMessage(err?.text || err?.message || 'Hubo un fallo en el servicio de correos. Por favor revisá que el archivo sea menor a 10MB o reintentá.');
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedCV(e.target.files[0]);
    }
  };

  const removeCV = () => {
    setSelectedCV(null);
    if (cvInputRef.current) cvInputRef.current.value = '';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FAF8F5] pt-32 pb-24 min-h-screen overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Content & Hero Area */}
          <div className="lg:col-span-6 space-y-12">
            <div className="space-y-6">
              <h2 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-support">Únete a nosotros</h2>
              <h1 className="text-4xl md:text-7xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary leading-tight">
                Sumate al <br/><span className="text-brand-support">Equipo Gacela</span>
              </h1>
              <p className="text-xl md:text-2xl text-[#8C7A6B] font-clofie font-light leading-relaxed">
                Formá parte de la transformación 4.0.
              </p>
            </div>

            <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl shadow-brand-primary/10 aspect-[4/3] lg:aspect-auto h-[400px] lg:h-[500px]">
               <img 
                 src="/images/talento.webp" 
                 alt="Gacela Team transformation 4.0"
                 className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 to-transparent flex items-end p-12">
                 <p className="text-white text-lg font-clofie font-light italic leading-relaxed opacity-90">
                   "Somos una familia que crece con tecnología, diseño e innovación, y buscamos personas que compartan nuestra pasión por crear espacios que representen a personas reales."
                 </p>
               </div>
            </div>

            <div className="bg-[#EAE2D2]/30 p-10 rounded-[2.5rem] border border-[#D9CDB8]/30">
              <p className="text-[#594A42] font-clofie font-light text-lg italic leading-relaxed">
                "En Gacela, los mejores equipos no son aquellos que reúnen más talento individual, sino los que estructuran mejor su trabajo y consiguen crear un marco de interacción entre todos sus miembros."
              </p>
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-[3.5rem] p-8 md:p-14 shadow-2xl shadow-brand-primary/5 border border-[#D9CDB8]/30 relative">
              <AnimatePresence mode="wait">
                {formStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 text-center space-y-8"
                  >
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <CheckCircle className="text-green-500" size={48} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl font-godber font-normal text-brand-primary uppercase tracking-[0.05em]">¡Éxito en tu postulación!</h3>
                      <p className="text-[#8C7A6B] font-clofie font-light text-xl max-w-sm mx-auto leading-relaxed">
                        ¡Gracias por postularte! Si querés conocer más sobre nuestra cultura industrial, podés chatear con GaciBot.
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setFormStatus('idle')}
                      className="inline-flex items-center gap-3 text-brand-support font-clofie font-bold italic text-[14px] uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      Volver al formulario <ArrowRight size={14} />
                    </button>

                    <div className="pt-12 border-t border-[#D9CDB8]/30">
                       <a 
                        href="https://wa.me/5493584329079" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-[#25D366] text-white px-10 py-5 rounded-2xl font-clofie font-bold italic text-[14px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#25D366]/20 inline-flex items-center gap-4"
                      >
                        <MessageCircle size={22} />
                        Consultar a GaciBot
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form 
                    ref={formRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                             Nombre y Apellido*
                          </label>
                          <input 
                            required
                            name="nombre"
                            type="text" 
                            className="w-full bg-[#FAF8F5] border border-[#D9CDB8]/20 px-6 py-5 rounded-2xl focus:ring-4 focus:ring-brand-support/10 outline-none text-[#594A42] placeholder:text-[#A69785]/40 font-clofie font-light text-lg transition-all"
                            placeholder="Ej: Sofía González"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                             Correo electrónico*
                          </label>
                          <input 
                            required
                            name="email"
                            type="email" 
                            className="w-full bg-[#FAF8F5] border border-[#D9CDB8]/20 px-6 py-5 rounded-2xl focus:ring-4 focus:ring-brand-support/10 outline-none text-[#594A42] placeholder:text-[#A69785]/40 font-clofie font-light text-lg transition-all"
                            placeholder="ejemplo@gmail.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                             Teléfono de contacto
                          </label>
                          <input 
                            name="telefono"
                            type="tel" 
                            className="w-full bg-[#FAF8F5] border border-[#D9CDB8]/20 px-6 py-5 rounded-2xl focus:ring-4 focus:ring-brand-support/10 outline-none text-[#594A42] placeholder:text-[#A69785]/40 font-clofie font-light text-lg transition-all"
                            placeholder="Ej: 358 1234567"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                             Provincia / Ciudad
                          </label>
                          <input 
                            name="ubicacion"
                            type="text" 
                            className="w-full bg-[#FAF8F5] border border-[#D9CDB8]/20 px-6 py-5 rounded-2xl focus:ring-4 focus:ring-brand-support/10 outline-none text-[#594A42] placeholder:text-[#A69785]/40 font-clofie font-light text-lg transition-all"
                            placeholder="Ej: Córdoba, Río Cuarto"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                           Área de interés*
                        </label>
                        <div className="relative">
                          <select 
                            required
                            name="area"
                            className="w-full bg-[#FAF8F5] border border-[#D9CDB8]/20 px-6 py-5 rounded-2xl focus:ring-4 focus:ring-brand-support/10 outline-none text-[#594A42] font-clofie font-light text-lg appearance-none cursor-pointer overflow-hidden transition-all"
                          >
                            <option value="">Seleccioná un área</option>
                            <option value="Producción">Producción</option>
                            <option value="Diseño y Producto">Diseño y Producto</option>
                            <option value="Administración">Administración</option>
                            <option value="Ventas">Ventas</option>
                            <option value="Logística">Logística</option>
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-brand-support opacity-40">
                             <ChevronRight className="rotate-90" size={18} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                           Breve presentación
                        </label>
                        <textarea 
                          name="presentacion"
                          rows={4}
                          className="w-full bg-[#FAF8F5] border border-[#D9CDB8]/20 px-6 py-5 rounded-2xl focus:ring-4 focus:ring-brand-support/10 outline-none text-[#594A42] placeholder:text-[#A69785]/40 font-clofie font-light text-lg resize-none transition-all"
                          placeholder="Contanos por qué te gustaría sumarte a Gacela..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                           Subí tu CV (PDF/Word)*
                        </label>
                        <input 
                          required
                          type="file" 
                          ref={cvInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                        />
                        
                        {!selectedCV ? (
                          <div 
                            onClick={() => cvInputRef.current?.click()}
                            className="border-2 border-dashed border-[#D9CDB8]/40 rounded-3xl p-10 text-center bg-[#FDFBF7] hover:bg-[#F9F7F2] hover:border-brand-support/60 transition-all cursor-pointer group"
                          >
                            <motion.div 
                              whileHover={{ y: -5 }}
                              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#D9CDB8]/20 group-hover:scale-110 group-hover:shadow-brand-support/10 transition-all duration-500"
                            >
                              <Upload size={22} className="text-brand-support" />
                            </motion.div>
                            <p className="text-[#8C7A6B] font-clofie font-bold text-base">
                              Arrastrá tu CV aquí o hacé clic
                            </p>
                            <p className="font-outersans font-thin text-[12px] uppercase tracking-[0.4em] text-[#A69785] mt-2 opacity-50">
                              Formato PDF o Word permitido
                            </p>
                          </div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-brand-primary/10 shadow-sm">
                                <FileText className="text-brand-support" size={22} />
                              </div>
                              <div className="text-left">
                                <p className="font-clofie font-bold text-brand-primary truncate max-w-[200px]">
                                  {selectedCV.name}
                                </p>
                                <p className="font-outersans font-thin text-[12px] uppercase tracking-[0.4em] text-brand-primary/40">
                                  {(selectedCV.size / 1024).toFixed(0)} KB • Listo para enviar
                                </p>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={removeCV}
                              className="p-2 hover:bg-white rounded-full text-red-400 hover:text-red-500 transition-all hover:rotate-90 duration-300"
                            >
                              <X size={20} />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {formStatus === 'error' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 text-red-800 font-clofie text-left"
                        >
                          <AlertCircle size={24} className="text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-base mb-1">Error en la postulación</h4>
                            <p className="text-sm text-red-700/90 leading-relaxed">
                              {errorMessage}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button 
                      type="submit"
                      disabled={formStatus === 'submitting'}
                      className="w-full bg-brand-primary text-white py-8 rounded-[2rem] font-clofie font-bold italic text-base uppercase tracking-widest hover:bg-brand-support transition-all flex items-center justify-center gap-5 group shadow-2xl shadow-brand-primary/20 relative overflow-hidden disabled:opacity-70"
                    >
                      <motion.div 
                        initial={false}
                        animate={formStatus === 'submitting' ? { width: '100%' } : { width: '0%' }}
                        className="absolute inset-0 bg-brand-support z-0 pointer-events-none"
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                      />
                      <span className="relative z-10 flex items-center gap-4">
                        {formStatus === 'submitting' ? 'Enviando postulación...' : formStatus === 'error' ? 'Error al enviar. Reintentar' : 'Enviar mi postulación'}
                        <Send size={20} className={formStatus === 'submitting' ? 'animate-pulse' : 'group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform'} />
                      </span>
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ChevronRight = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default WorkWithUs;
