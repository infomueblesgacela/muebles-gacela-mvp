import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, HelpCircle, AlertCircle, Briefcase, ChevronRight, FileText, ShieldCheck, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendEmail } from '../utils/email';
const Contacto: React.FC = () => {
  const quickLinks = [
    { name: 'Preguntas Frecuentes', path: '/preguntas-frecuentes', icon: HelpCircle, description: 'Respuestas a consultas generales y sobre la gestión de tus pedidos.' },
    { name: 'Formulario de Reclamos', path: '/formulario-de-reclamos', icon: AlertCircle, description: 'Servicio post-venta. Gestionamos rápidamente cualquier inconveniente.' },
    { name: 'Trabajá con nosotros', path: '/trabaja-con-nosotros', icon: Briefcase, description: 'Sumate a la transformación 4.0 del diseño de muebles.' },
    { name: 'Política de Garantía', path: '/politica-de-garantia', icon: ShieldCheck, description: 'Conocé la cobertura de los desperfectos de fábrica.' },
    { name: 'Términos y Condiciones', path: '/terminos-y-condiciones', icon: FileText, description: 'Políticas generales de la web de Muebles Gacela.' },
    { name: 'Política de Privacidad', path: '/politica-de-privacidad', icon: FileText, description: 'Cómo protegemos tus datos y cuidamos tu privacidad.' },
  ];

  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage(null);
    const form = formRef.current;
    if (!form) return;
    
    const data = new FormData(form);
    const nombre   = data.get('nombre') as string || '';
    const telefono = data.get('telefono') as string || 'No provisto';
    const email    = data.get('email') as string || '';
    const empresa  = data.get('empresa') as string || 'No provista';
    const asunto   = data.get('asunto') as string || 'Consulta Web';
    const consulta = data.get('consulta') as string || '';

    try {
      await sendEmail({
        subject:    `Consulta Web de Contacto - ${asunto}`,
        from_name:  nombre,
        from_email: email,
        message:    `CONSULTA DESDE PÁGINA DE CONTACTO\n\nNombre: ${nombre}\nEmail: ${email}\nTeléfono: +54 ${telefono}\nEmpresa: ${empresa}\n\nAsunto: ${asunto}\n\nMensaje:\n${consulta}`,
      }, false); // false forces the contact template (default)

      setFormStatus('success');
      form.reset();
    } catch (err: any) {
      console.error('[Contacto] Error al enviar:', err);
      setFormStatus('error');
      setErrorMessage(err?.text || err?.message || 'Hubo una falla de red o configuración en el envío de correos. Reintentá en unos momentos.');
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FAF8F5] pt-32 pb-24 min-h-screen"
    >
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-support mb-4">Muebles Gacela</h2>
          <h1 className="text-4xl md:text-7xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary leading-tight">
            Estamos en <span className="text-brand-support">Contacto</span>
          </h1>
          <p className="mt-8 text-lg text-[#8C7A6B] font-clofie font-light max-w-2xl mx-auto leading-relaxed">
            Nuestra fábrica y oficinas centrales se encuentran en Río Cuarto, Córdoba. Somos una empresa de alcance nacional. Escribinos para lo que necesites, estamos de tu lado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-stretch">
          
          {/* Main Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#D9CDB8]/30 flex-1">
              <h3 className="text-2xl font-godber font-normal text-brand-primary uppercase tracking-[0.05em] mb-8">Nuestros Canales</h3>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/5 flex items-center justify-center shrink-0 border border-brand-primary/10">
                    <Mail className="text-brand-support" size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 mb-1">Email Comercial</p>
                    <a href="mailto:hola@mueblesgacela.com.ar" className="text-[#594A42] font-clofie font-bold text-lg hover:text-brand-support transition-colors">
                      hola@mueblesgacela.com.ar
                    </a>
                  </div>
                </li>
                
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/5 flex items-center justify-center shrink-0 border border-brand-primary/10">
                    <MessageCircle className="text-[#25D366]" size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 mb-1">WhatsApp de Atención</p>
                    <a href="https://wa.me/5493584329079" target="_blank" rel="noopener noreferrer" className="text-[#594A42] font-clofie font-bold text-lg hover:text-[#25D366] transition-colors">
                      3584 32-9079
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/5 flex items-center justify-center shrink-0 border border-brand-primary/10">
                    <Phone className="text-brand-support" size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 mb-1">Teléfono Directo</p>
                    <a href="tel:3584622342" className="text-[#594A42] font-clofie font-bold text-lg hover:text-brand-support transition-colors">
                      (358) 4622342
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/5 flex items-center justify-center shrink-0 border border-brand-primary/10">
                    <MapPin className="text-brand-support" size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 mb-1">Planta Industrial</p>
                    <p className="text-[#594A42] font-clofie font-bold text-lg">
                      Sobremonte 3236, Río Cuarto
                    </p>
                    <p className="text-[#8C7A6B] font-clofie font-light text-sm mt-1">Provincia de Córdoba, Argentina</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#EAE2D2]/30 p-8 rounded-[2.5rem] border border-[#D9CDB8]/30 space-y-6">
              <div className="space-y-4">
                <h4 className="text-xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary flex items-center gap-3">
                  <HelpCircle size={20} className="text-brand-support" /> ¿Dudas Rápidas?
                </h4>
                <p className="text-[#594A42] font-clofie font-light text-base leading-relaxed">
                  Tenemos a tu disposición nuestro portal de preguntas frecuentes para resolver las dudas más habituales sobre entregas y calidad.
                </p>
                <Link to="/preguntas-frecuentes" className="inline-block text-[12px] font-clofie font-bold italic uppercase tracking-widest text-brand-support hover:underline">
                  Ir a Preguntas Frecuentes
                </Link>
              </div>
              <div className="w-full h-px bg-[#D9CDB8]/30"></div>
              <div className="space-y-4">
                <h4 className="text-xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary flex items-center gap-3">
                  <AlertCircle size={20} className="text-brand-support" /> Soporte Post-Venta
                </h4>
                <p className="text-[#594A42] font-clofie font-light text-base leading-relaxed">
                  ¿Tuviste algún inconveniente? Completá el Formulario de Reclamos y nos encargamos de inmediato.
                </p>
                <Link to="/formulario-de-reclamos" className="inline-block text-[12px] font-clofie font-bold italic uppercase tracking-widest text-brand-support hover:underline">
                  Abrir Reclamo
                </Link>
              </div>
              <div className="w-full h-px bg-[#D9CDB8]/30"></div>
              <div className="space-y-4">
                <h4 className="text-xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary flex items-center gap-3">
                  <Briefcase size={20} className="text-brand-support" /> Sumate al equipo
                </h4>
                <p className="text-[#594A42] font-clofie font-light text-base leading-relaxed">
                  Buscamos talento para seguir creciendo. Visitá la sección Trabajá con nosotros y envianos tu CV.
                </p>
                <Link to="/trabaja-con-nosotros" className="inline-block text-[12px] font-clofie font-bold italic uppercase tracking-widest text-brand-support hover:underline">
                  Envianos tu CV
                </Link>
              </div>
            </div>
          </div>

          {/* Map and Image */}
          <div className="lg:col-span-7 flex flex-col rounded-[2.5rem] overflow-hidden shadow-xl border border-[#D9CDB8]/40 bg-white">
            <div className="h-48 md:h-64 overflow-hidden relative">
              <img 
                src="/images/Fábrica.webp" 
                alt="Fábrica Muebles Gacela" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1565153213190-2e40049be9d9?q=80&w=2670&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-brand-primary/10 flex items-center justify-center p-8 text-center ring-1 ring-white/20 inset-1 rounded-t-[2rem]">
                 <h3 className="text-2xl md:text-3xl font-godber font-normal uppercase tracking-[0.05em] text-white drop-shadow-lg">Nuestra Planta de Producción</h3>
              </div>
            </div>
            <div className="flex-1 w-full relative min-h-[350px]">
              <iframe
                title="Google Maps Muebles Gacela"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3353.486663248663!2d-64.364402624467!3d-33.111831873111424!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d2008e31006e81%3A0xe6bf446c820b3310!2sSobremonte%203236%2C%20R%C3%ADo%20Cuarto%2C%20C%C3%B3rdoba!5e0!3m2!1ses-419!2sar!4v1709230000000!5m2!1ses-419!2sar"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>

        {/* Useful Links Grid */}
        <div className="mb-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary mb-4">Enlaces Útiles</h3>
            <p className="text-lg text-[#8C7A6B] font-clofie font-light">¿Buscás algo específico? Accedé rápidamente.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, idx) => (
              <Link 
                key={idx} 
                to={link.path}
                className="bg-white p-8 rounded-3xl border border-[#D9CDB8]/30 shadow-sm hover:shadow-xl hover:border-brand-support/40 transition-all group flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-[#FAF8F5] rounded-2xl flex items-center justify-center group-hover:bg-brand-support group-hover:text-white text-brand-primary transition-colors">
                    <link.icon size={24} />
                  </div>
                  <ChevronRight className="text-[#A69785] group-hover:text-brand-support transition-transform group-hover:translate-x-2" size={20} />
                </div>
                <h4 className="text-xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary mb-3">
                  {link.name}
                </h4>
                <p className="text-sm font-clofie font-light text-[#8C7A6B] leading-relaxed flex-1">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Formulario de Contacto */}
        <div className="mt-24 max-w-4xl mx-auto bg-white p-8 md:p-14 rounded-[2.5rem] border border-[#D9CDB8]/40 shadow-xl relative overflow-hidden">
          {/* Fondo sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-support/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-support mb-4">Atención Personalizada</h2>
            <h3 className="text-4xl md:text-5xl font-godber font-normal uppercase tracking-[0.05em] text-brand-primary">Ponete en Contacto</h3>
            <p className="mt-4 text-base text-[#8C7A6B] font-clofie font-light max-w-lg mx-auto">Dejanos tus datos y tu consulta. Nuestro equipo comercial se comunicará a la brevedad.</p>
          </div>

          <AnimatePresence mode="wait">
            {formStatus === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center relative z-10"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-500" size={40} />
                </div>
                <h3 className="text-3xl font-godber font-normal text-brand-primary uppercase mb-4 tracking-[0.05em]">¡Mensaje Enviado!</h3>
                <p className="text-lg text-[#8C7A6B] font-clofie font-light max-w-sm mx-auto">
                  Hemos recibido tu consulta correctamente. Nuestro equipo comercial se pondrá en contacto con vos a la brevedad.
                </p>
                <button 
                  onClick={() => setFormStatus('idle')}
                  className="mt-8 font-clofie font-bold italic text-[14px] text-brand-support uppercase tracking-widest hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </motion.div>
            ) : (
              <motion.form 
                ref={formRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 relative z-10" 
                onSubmit={handleSubmit}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Nombre */}
                  <div>
                    <label className="block text-[12px] font-clofie font-bold uppercase tracking-widest text-[#594A42] mb-2" htmlFor="nombre">Nombre <span className="text-brand-support">*</span></label>
                    <input type="text" id="nombre" name="nombre" required className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl px-4 py-3.5 text-[#594A42] font-clofie focus:outline-none focus:border-brand-support focus:ring-1 focus:ring-brand-support transition-all" placeholder="Tu nombre y apellido" />
                  </div>
                  
                  {/* Teléfono */}
                  <div>
                    <label className="block text-[12px] font-clofie font-bold uppercase tracking-widest text-[#594A42] mb-2" htmlFor="telefono">Número de Teléfono</label>
                    <div className="flex">
                      <span className="inline-flex items-center justify-center px-4 bg-[#EAE3D9] border border-r-0 border-[#EAE3D9] rounded-l-xl text-[#594A42] font-clofie font-bold text-sm">
                        +54
                      </span>
                      <input type="tel" id="telefono" name="telefono" className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-r-xl px-4 py-3.5 text-[#594A42] font-clofie focus:outline-none focus:border-brand-support focus:ring-1 focus:ring-brand-support transition-all" placeholder="Cod. área + número" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[12px] font-clofie font-bold uppercase tracking-widest text-[#594A42] mb-2" htmlFor="email">Email <span className="text-brand-support">*</span></label>
                    <input type="email" id="email" name="email" required className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl px-4 py-3.5 text-[#594A42] font-clofie focus:outline-none focus:border-brand-support focus:ring-1 focus:ring-brand-support transition-all" placeholder="tu@email.com" />
                  </div>

                  {/* Tu empresa */}
                  <div>
                    <label className="block text-[12px] font-clofie font-bold uppercase tracking-widest text-[#594A42] mb-2" htmlFor="empresa">Tu empresa</label>
                    <input type="text" id="empresa" name="empresa" className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl px-4 py-3.5 text-[#594A42] font-clofie focus:outline-none focus:border-brand-support focus:ring-1 focus:ring-brand-support transition-all" placeholder="Nombre de tu empresa (opcional)" />
                  </div>
                </div>

                {/* Asunto */}
                <div>
                  <label className="block text-[12px] font-clofie font-bold uppercase tracking-widest text-[#594A42] mb-2" htmlFor="asunto">Asunto <span className="text-brand-support">*</span></label>
                  <input type="text" id="asunto" name="asunto" required className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl px-4 py-3.5 text-[#594A42] font-clofie focus:outline-none focus:border-brand-support focus:ring-1 focus:ring-brand-support transition-all" placeholder="¿Sobre qué nos escribís?" />
                </div>

                {/* Consulta */}
                <div>
                  <label className="block text-[12px] font-clofie font-bold uppercase tracking-widest text-[#594A42] mb-2" htmlFor="consulta">Consulta <span className="text-brand-support">*</span></label>
                  <textarea id="consulta" name="consulta" required rows={5} className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl px-4 py-3.5 text-[#594A42] font-clofie focus:outline-none focus:border-brand-support focus:ring-1 focus:ring-brand-support transition-all resize-none" placeholder="Escribí tu mensaje detallado acá..."></textarea>
                </div>

                <AnimatePresence>
                  {formStatus === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start gap-3 text-red-800 font-clofie text-left"
                    >
                      <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm mb-1">Ocurrió un error al enviar</h4>
                        <p className="text-[13px] text-red-700/90 leading-relaxed">
                          {errorMessage}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-6 text-center">
                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className="inline-flex items-center justify-center px-12 py-4 bg-brand-primary text-[#ECE2D2] rounded-xl text-[14px] uppercase tracking-[0.2em] hover:bg-brand-support transition-all font-clofie font-bold italic shadow-md hover:shadow-xl hover:-translate-y-1 w-full md:w-auto disabled:opacity-70"
                  >
                    {formStatus === 'submitting' ? 'Enviando...' : formStatus === 'error' ? 'Error al enviar. Reintentar' : 'Enviar Mensaje'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>


      </div>
    </motion.div>
  );
};

export default Contacto;
