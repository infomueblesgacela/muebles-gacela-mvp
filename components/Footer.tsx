
import React from 'react';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './Icons';
import { Mail, Phone, MessageCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-support text-brand-bg font-sans">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h4 className="text-[14px] mb-6 font-outersans font-thin uppercase tracking-[0.4em] text-brand-bg/80">Nuestras Líneas</h4>
            <ul className="space-y-3 text-base text-[#ECE2D2]/80 font-clofie font-light">
              <li><a href="#" className="hover:text-white transition-colors">Clásica</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kyoto</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Curvalba</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Lumo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Nordik</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Infantil</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gamer</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] mb-6 font-outersans font-thin uppercase tracking-[0.4em] text-brand-bg/80">Enlaces Útiles</h4>
            <ul className="space-y-3 text-base text-[#ECE2D2]/80 font-clofie font-light">
              <li><Link to="/terminos-y-condiciones" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/politica-de-privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/politica-de-garantia" className="hover:text-white transition-colors">Política de Garantía</Link></li>
              <li><Link to="/preguntas-frecuentes" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link to="/formulario-de-reclamos" className="hover:text-white transition-colors">Formulario de Reclamos</Link></li>
              <li><Link to="/trabaja-con-nosotros" className="hover:text-white transition-colors underline decoration-brand-support/30 underline-offset-4">Trabajá con nosotros</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] mb-6 font-outersans font-thin uppercase tracking-[0.4em] text-brand-bg/80">Contacto</h4>
            <ul className="space-y-3 text-base text-[#ECE2D2]/80 font-clofie font-light">
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4" />
                <a href="mailto:hola@mueblesgacela.com.ar" className="hover:text-white transition-colors">hola@mueblesgacela.com.ar</a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4" />
                <a href="tel:3584622342" className="hover:text-white transition-colors">(358) 4622342</a>
              </li>
              <li className="flex items-center space-x-3">
                <MessageCircle className="h-4 w-4" />
                <a href="https://wa.me/5493584329079" className="hover:text-white transition-colors">3584 32-9079</a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <span className="hover:text-white transition-colors cursor-default">Sobremonte 3236, Río Cuarto</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] mb-6 font-outersans font-thin uppercase tracking-[0.4em] text-brand-bg/80">Redes Sociales</h4>
            <div className="flex space-x-4 mb-6">
              <a href="https://www.facebook.com/petitmuebles.gacela" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/gacelamuebles/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="https://www.youtube.com/@gacela_muebles" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <YoutubeIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="container mx-auto px-6 py-8 text-sm text-brand-bg/60 text-center md:text-left font-clofie font-light">
          <p>&copy; 2026 Gacela Muebles. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
