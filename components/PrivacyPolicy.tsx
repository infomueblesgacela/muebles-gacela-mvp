
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, ShieldCheck, MapPin } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: "Introducción",
      content: "En Petit Muebles Gacela S.R.L. valoramos y protegemos la privacidad de nuestros clientes. Este Aviso de Privacidad explica qué datos recopilamos, cómo los utilizamos y cuáles son sus derechos conforme a la legislación vigente en Argentina, incluyendo la Ley 25.326 de Protección de Datos Personales."
    },
    {
      title: "Datos que recopilamos",
      content: "Podemos recopilar y procesar los siguientes tipos de datos:\n\n• Información de identificación (nombre, apellido, DNI, empresa).\n• Datos de contacto (dirección, teléfono, WhatsApp, correo electrónico).\n• Información de pedidos, facturación y entregas.\n• Consultas realizadas a través de nuestro sitio web, redes sociales o WhatsApp.\n• Información técnica básica (cookies, IP, navegador), para mejorar la funcionalidad del sitio web."
    },
    {
      title: "Uso de la información",
      content: "Los datos personales se utilizan exclusivamente para:\n\n• Gestionar compras, pedidos y entregas.\n• Procesar pagos y generar comprobantes fiscales.\n• Brindar soporte y atención post venta.\n• Enviar comunicaciones relacionadas con el estado del pedido y novedades.\n• Mejorar nuestros productos, servicios y la experiencia del usuario en el sitio web.\n\nNo vendemos, alquilamos ni transferimos datos personales a terceros ajenos a nuestra actividad, salvo obligación legal o proveedores estrictamente necesarios (por ejemplo: transporte, logística o sistemas de cobro)."
    },
    {
      title: "Derechos del titular de los datos",
      content: "Usted tiene derecho a:\n\n• Acceder a sus datos.\n• Rectificarlos si son incorrectos.\n• Actualizarlos o solicitar su supresión.\n• Oponerse al uso de sus datos con fines comerciales.\n\nPara ejercer sus derechos puede escribirnos a hola@mueblesgacela.com.ar."
    },
    {
      title: "Seguridad de los datos",
      content: "Implementamos medidas técnicas y administrativas para garantizar la seguridad y confidencialidad de la información."
    },
    {
      title: "Cookies",
      content: "Nuestro sitio puede utilizar cookies para mejorar la navegación y recordar preferencias. El usuario puede deshabilitarlas desde su navegador."
    },
    {
      title: "Modificaciones al Aviso de Privacidad",
      content: "Podemos actualizar este Aviso en cualquier momento. La versión vigente estará siempre disponible en este sitio web."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FAF8F5] pt-32 pb-24"
    >
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        <div className="mb-20 text-left border-b border-[#D9CDB8] pb-12">
          <h2 className="text-[14px] font-thin tracking-[0.4em] uppercase text-brand-support mb-4 font-outersans">Información Legal</h2>
          <h1 className="text-4xl md:text-6xl font-normal tracking-[0.05em] uppercase text-brand-primary font-godber leading-tight">
            Aviso de <br/><span className="text-brand-support">Privacidad</span>
          </h1>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-base text-[#8C7A6B] font-clofie font-light">
            <div className="space-y-4">
              <p className="font-clofie font-bold italic text-brand-primary text-base uppercase tracking-widest">Petit Muebles Gacela S.R.L.</p>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-support shrink-0" />
                <p>Sobremonte 3236, Río Cuarto, Córdoba,<br/>CP 5800, Argentina</p>
              </div>
            </div>
            <div className="space-y-3 md:text-right flex flex-col md:items-end">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-support" />
                <p>+54 358 4622342 / 4643690</p>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-brand-support" />
                <p>WhatsApp: +54 9 358 4329079</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-support" />
                <a href="mailto:hola@mueblesgacela.com.ar" className="text-brand-support underline hover:text-brand-primary transition-colors">hola@mueblesgacela.com.ar</a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-4 sticky top-40 h-fit">
            <div className="bg-white p-8 rounded-3xl border border-[#D9CDB8]/30 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="w-5 h-5 text-brand-support" />
                <h4 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40">Privacidad</h4>
              </div>
              <nav className="space-y-6">
                {sections.map((section, idx) => (
                  <a 
                    key={idx} 
                    href={`#section-${idx}`}
                    className="flex items-center group text-[11px] uppercase tracking-[0.2em] text-[#8C7A6B] hover:text-brand-support transition-all font-clofie font-bold italic"
                  >
                    <span className="w-6 text-brand-support/40 group-hover:text-brand-support transition-colors">{idx}</span>
                    <span className="group-hover:translate-x-1 transition-transform">{section.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-24">
            {sections.map((section, idx) => (
              <motion.section 
                key={idx}
                id={`section-${idx}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="scroll-mt-40 group"
              >
                <div className="relative">
                   <span className="absolute -left-12 -top-8 text-8xl font-godber text-brand-support/5 select-none transition-colors group-hover:text-brand-support/10">
                    {idx.toString().padStart(2, '0')}
                  </span>
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px w-8 bg-brand-support/30"></div>
                      <h3 className="text-2xl font-godber font-normal text-brand-primary uppercase tracking-[0.05em]">{section.title}</h3>
                    </div>
                    <div className="text-[#594A42] leading-relaxed font-clofie font-light text-lg whitespace-pre-line pl-12">
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
