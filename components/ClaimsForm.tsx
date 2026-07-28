
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, MessageSquare, Upload, CheckCircle, AlertCircle, MessageCircle, ArrowRight, FileText, X } from 'lucide-react';
import { sendEmail, uploadAttachment } from '../utils/email';

const ClaimsForm: React.FC = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    const asunto    = data.get('asunto')    as string || 'Sin especificar';
    const descripcion = data.get('descripcion') as string || '';

    try {
      let attachmentUrl = '';
      if (selectedFile) {
        // Subir el archivo temporalmente para obtener una URL pública
        attachmentUrl = await uploadAttachment(selectedFile);
      }

      const fileMessage = selectedFile 
        ? `Archivo adjunto: ${selectedFile.name} (${(selectedFile.size/1024).toFixed(1)} KB)\nURL de descarga: ${attachmentUrl}` 
        : 'Sin adjunto';

      await sendEmail({
        subject:        `Reclamo Post-Venta - ${asunto}`,
        from_name:      nombre,
        from_email:     email,
        attachment_url: attachmentUrl,
        message:        `RECLAMO POST-VENTA\n\nNombre: ${nombre}\nEmail: ${email}\nMotivo: ${asunto}\n\nDescripción:\n${descripcion}\n\n${fileMessage}`,
      }, true); // true triggers the claims template

      setFormStatus('success');
      setSelectedFile(null);
      form.reset();
    } catch (err: any) {
      console.error('[ClaimsForm] Error al enviar:', err);
      setFormStatus('error');
      setErrorMessage(err?.text || err?.message || 'No se pudo establecer conexión con el servidor de correos. Por favor, reintentá o contactanos directamente.');
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FAF8F5] pt-32 pb-24 min-h-screen"
    >
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="text-[14px] font-thin tracking-[0.5em] uppercase text-brand-support mb-4 font-outersans">Soporte Post-Venta</h2>
          <h1 className="text-4xl md:text-7xl font-normal tracking-[0.05em] uppercase text-brand-primary font-godber leading-tight">
            Estamos para <br/><span className="text-brand-support font-black">solucionarlo</span>
          </h1>
          <p className="mt-8 text-xl text-[#8C7A6B] font-clofie font-light leading-relaxed max-w-2xl mx-auto">
            Trabajamos bajo los estándares de control de calidad más rigurosos para que tu experiencia sea perfecta. Sin embargo, para tu total tranquilidad, ante cualquier eventualidad excepcional, nuestro equipo de respaldo garantiza una respuesta resolutiva en menos de 24 horas hábiles.
          </p>
        </div>

        <div className="space-y-12">
          {/* Main Form Area */}
          <div className="w-full">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-[#D9CDB8]/30">
              <AnimatePresence mode="wait">
                {formStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="text-green-500" size={40} />
                    </div>
                    <h3 className="text-3xl font-godber font-normal text-brand-primary uppercase mb-4 tracking-[0.05em]">¡Recibimos tu reclamo!</h3>
                    <p className="text-lg text-[#8C7A6B] font-clofie font-light max-w-sm mx-auto">
                      Un miembro de nuestro equipo de calidad se pondrá en contacto con vos dentro de las próximas 24 horas hábiles. Gracias por tu paciencia.
                    </p>
                    <button 
                      onClick={() => setFormStatus('idle')}
                      className="mt-8 font-clofie font-bold italic text-[14px] text-brand-support uppercase tracking-widest hover:underline"
                    >
                      Enviar otro reclamo
                    </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                          <User size={12} className="text-brand-support" /> Nombre completo*
                        </label>
                        <input 
                          required
                          name="nombre"
                          type="text" 
                          placeholder="Juan Pérez"
                          className="w-full bg-[#FAF8F5] border border-[#D9CDB8]/20 px-6 py-5 rounded-2xl focus:ring-2 focus:ring-brand-support/20 outline-none text-[#594A42] placeholder:text-[#A69785]/50 font-clofie font-light text-lg focus:bg-white transition-all shadow-inner shadow-black/[0.02]"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                          <Mail size={12} className="text-brand-support" /> Correo electrónico*
                        </label>
                        <input 
                          required
                          name="email"
                          type="email" 
                          placeholder="ejemplo@correo.com"
                          className="w-full bg-[#FAF8F5] border border-[#D9CDB8]/20 px-6 py-5 rounded-2xl focus:ring-2 focus:ring-brand-support/20 outline-none text-[#594A42] placeholder:text-[#A69785]/50 font-clofie font-light text-lg focus:bg-white transition-all shadow-inner shadow-black/[0.02]"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                        <AlertCircle size={12} className="text-brand-support" /> Asunto*
                      </label>
                      <div className="relative">
                        <select 
                          required
                          name="asunto"
                          className="w-full bg-[#FAF8F5] border border-[#D9CDB8]/20 px-6 py-5 rounded-2xl focus:ring-2 focus:ring-brand-support/20 outline-none text-[#594A42] appearance-none cursor-pointer font-clofie font-light text-lg focus:bg-white transition-all shadow-inner shadow-black/[0.02]"
                        >
                          <option value="">Seleccioná un motivo</option>
                          <option value="pieza-dañada">Pieza Dañada</option>
                          <option value="faltante-herrajes">Faltante de Herrajes</option>
                          <option value="error-instructivo">Error en Instructivo</option>
                          <option value="problema-envio">Problema con el Envío</option>
                          <option value="otros">Otros</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-brand-support/40">
                            <ArrowRight size={16} className="rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                        <MessageSquare size={12} className="text-brand-support" /> Descripción detallada
                      </label>
                      <textarea 
                        name="descripcion"
                        rows={5}
                        placeholder="Contanos qué pasó..."
                        className="w-full bg-[#FAF8F5] border border-[#D9CDB8]/20 px-6 py-5 rounded-2xl focus:ring-2 focus:ring-brand-support/20 outline-none text-[#594A42] placeholder:text-[#A69785]/50 font-clofie font-light text-lg resize-none focus:bg-white transition-all shadow-inner shadow-black/[0.02]"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 flex items-center gap-2">
                        <Upload size={12} className="text-brand-support" /> Archivo adjunto
                      </label>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {!selectedFile ? (
                        <div 
                          onClick={triggerFileInput}
                          className="border-2 border-dashed border-[#D9CDB8]/40 rounded-2xl p-10 text-center bg-[#FDFBF7] hover:bg-[#F9F7F2] hover:border-brand-support/40 transition-all cursor-pointer group"
                        >
                          <motion.div 
                            whileHover={{ y: -5 }}
                            className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#D9CDB8]/30 group-hover:shadow-brand-support/10 transition-all duration-500"
                          >
                            <Upload size={24} className="text-brand-support" />
                          </motion.div>
                          <p className="text-[#8C7A6B] font-clofie text-base font-bold">
                            Hacé clic para subir o arrastrá una imagen
                          </p>
                          <p className="font-outersans font-thin text-[14px] tracking-[0.4em] uppercase text-[#A69785] mt-4 opacity-60 leading-relaxed text-center">
                            Subí una foto de la pieza y de la etiqueta de la caja para acelerar la gestión
                          </p>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#FAF8F5] p-6 rounded-2xl border border-brand-support/20 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-[#D9CDB8]/30">
                              <FileText className="text-brand-support" size={20} />
                            </div>
                            <div>
                              <p className="font-clofie font-bold text-[#594A42] truncate max-w-[200px] md:max-w-md">
                                {selectedFile.name}
                              </p>
                              <p className="text-[14px] font-outersans font-thin uppercase text-[#A69785] tracking-[0.4em]">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={removeFile}
                            className="p-2 hover:bg-white rounded-full text-red-400 hover:text-red-500 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </motion.div>
                      )}
                    </div>

                    <AnimatePresence>
                      {formStatus === 'error' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 text-red-800 font-clofie"
                        >
                          <AlertCircle size={24} className="text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-base mb-1">Hubo un problema al enviar</h4>
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
                      className="w-full bg-brand-primary text-white py-7 rounded-2xl font-clofie font-bold italic text-base uppercase tracking-widest hover:bg-brand-support transition-all flex items-center justify-center gap-4 group shadow-xl shadow-brand-primary/10"
                    >
                      {formStatus === 'submitting' ? 'Enviando...' : 'Enviar reclamo'}
                      <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom WhatsApp CTA */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-8 bg-brand-support text-white p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden group flex flex-col md:flex-row items-center gap-8"
            >
              <div className="absolute -right-20 -top-20 text-[250px] opacity-10 font-bold group-hover:rotate-12 transition-transform duration-1000 select-none">W</div>
              <div className="relative z-10 flex-1 text-center md:text-left">
                <h4 className="text-3xl md:text-4xl font-godber font-normal uppercase tracking-[0.05em] mb-4 leading-tight">¿Buscás una solución <span className="text-[#ECE2D2]">inmediata</span>?</h4>
                <p className="text-lg text-white/80 font-clofie font-light leading-relaxed max-w-xl">
                  Iniciá un chat con nuestro asistente inteligente o un operador para acelerar tu gestión.
                </p>
              </div>
              <div className="relative z-10 shrink-0">
                <a 
                  href="https://wa.me/5493584329079" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-brand-support px-10 py-5 rounded-2xl font-clofie font-bold italic text-[14px] uppercase tracking-widest inline-flex items-center gap-4 hover:scale-105 transition-all shadow-xl shadow-black/10 group/btn"
                >
                  <MessageCircle size={22} />
                  WhatsApp Gacela
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-4 bg-white p-10 rounded-[2.5rem] border border-[#D9CDB8]/30 flex items-center justify-center text-center"
            >
              <p className="text-[#8C7A6B] font-clofie font-light text-lg italic leading-relaxed">
                "Nuestra fabricación industrial permite reponer cualquier pieza de inmediato. <br/><strong>Garantía de perfección Gacela.</strong>"
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClaimsForm;
