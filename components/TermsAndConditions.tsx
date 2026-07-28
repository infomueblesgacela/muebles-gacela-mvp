
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, FileText, ChevronRight, MapPin } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  const terms = [
    {
      title: "Aceptación de los términos",
      content: "Al utilizar este sitio web o realizar una compra con Petit Muebles Gacela S.R.L., usted acepta los presentes Términos y Condiciones. Si no está de acuerdo, le solicitamos abstenerse de utilizar el sitio."
    },
    {
      title: "Productos y precios",
      content: "Todos los precios están expresados en moneda local e incluyen impuestos vigentes, salvo aclaración en contrario. Las imágenes son ilustrativas y pueden presentar diferencias con el producto final. La disponibilidad de los productos está sujeta a stock."
    },
    {
      title: "Pedidos y pagos",
      content: "Al realizar una compra: El cliente se compromete a proporcionar información veraz y actualizada. Los pedidos se consideran confirmados una vez acreditado el pago. Los métodos de pago disponibles se informan en el sitio o al momento de realizar la compra."
    },
    {
      title: "Envíos y entregas",
      content: "Las entregas se coordinan con el cliente según la disponibilidad logística. Los plazos comunicados son estimados. El cliente debe verificar el estado del producto al momento de recibirlo."
    },
    {
      title: "Cambios y devoluciones",
      content: "Petit Muebles Gacela S.R.L. ofrece cambios o devoluciones bajo las siguientes condiciones: Piezas con defectos de fabricación serán reemplazados sin costo. Cambios por gusto o error del cliente pueden implicar costos adicionales. El producto debe encontrarse en óptimas condiciones, sin uso y con su embalaje original. Las solicitudes deben realizarse al correo hola@mueblesgacela.com.ar o vía WhatsApp Post Venta."
    },
    {
      title: "Garantía",
      content: "Todos los productos cuentan con garantía por fallas de fabricación dentro del período informado en la compra. La garantía no cubre desgaste natural, mal uso o daños ocasionados por terceros."
    },
    {
      title: "Uso del sitio web",
      content: "El usuario se compromete a: Utilizar el sitio de manera lícita. No intentar acceder a información privada o restringida. No realizar acciones que afecten la operatividad del sitio."
    },
    {
      title: "Propiedad intelectual",
      content: "Todo el contenido del sitio web, incluyendo imágenes, textos, diseños y logos, es propiedad de Petit Muebles Gacela S.R.L. y no puede ser utilizado sin autorización."
    },
    {
      title: "Limitación de responsabilidad",
      content: "Petit Muebles Gacela S.R.L. no se responsabiliza por: Interrupciones del servicio por causas técnicas o externas. Daños derivados del uso indebido del sitio. Errores involuntarios en la información publicada."
    },
    {
      title: "Modificación de los términos",
      content: "Nos reservamos el derecho de actualizar estos términos en cualquier momento. La versión vigente estará disponible en el sitio web."
    },
    {
      title: "Contacto",
      content: "Para consultas o reclamos: Email: hola@mueblesgacela.com.ar | Tel: +54 358 4622342 / 4643690 | WhatsApp: +54 9 358 4329079"
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
            Términos y <br/><span className="text-brand-support">Condiciones</span>
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
              <h4 className="text-[14px] font-outersans font-thin uppercase tracking-[0.4em] text-brand-primary/40 mb-8">Contenido</h4>
              <nav className="space-y-6">
                {terms.map((term, idx) => (
                  <a 
                    key={idx} 
                    href={`#section-${idx + 1}`}
                    className="flex items-center group text-[11px] uppercase tracking-[0.2em] text-[#8C7A6B] hover:text-brand-support transition-all font-clofie font-bold italic"
                  >
                    <span className="w-6 text-brand-support/40 group-hover:text-brand-support transition-colors">{idx + 1}</span>
                    <span className="group-hover:translate-x-1 transition-transform">{term.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-24">
            {terms.map((term, idx) => (
              <motion.section 
                key={idx}
                id={`section-${idx + 1}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="scroll-mt-40 group"
              >
                <div className="relative">
                  <span className="absolute -left-12 -top-8 text-8xl font-godber text-brand-support/5 select-none transition-colors group-hover:text-brand-support/10">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px w-8 bg-brand-support/30"></div>
                      <h3 className="text-2xl font-godber font-normal text-brand-primary uppercase tracking-[0.05em]">{term.title}</h3>
                    </div>
                    <div className="text-[#594A42] leading-relaxed font-clofie font-light text-lg whitespace-pre-line pl-12">
                      {term.content}
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

export default TermsAndConditions;
