
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Wrench, Camera } from 'lucide-react';
import { Product } from '../types/product'; // Importa la interfaz Product

interface ProductDetailProps {
  product: Product;
  onBackClick: () => void;
  onStartAssembly: (product: Product) => void; // Nueva prop
  onStartAR: (product: Product) => void; // Nueva prop
}

// Mock de datos completos para un producto (similar a la estructura de la PDP)
const mockProductDetail: Product = {
  id: 1,
  title: 'Set de mesas OSLO', // Título actualizado
  rating: 5,
  image: 'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91369-bc36b6e0/Escena%20Art%20116.webp', // Imagen principal para la Home
  shortDescription: 'Además de decorar su sala, este producto también es muy funcional, es un óptimo apoyo para vasos, control de la TV y es un excelente soporte para servir visitas y ofrecer más confort al ambiente.', // Descripción ajustada
  longDescription: `
    El Set de mesas OSLO redefine la funcionalidad y el estilo en tu hogar. Inspirado en la simplicidad y la calidez del diseño nórdico, cada mesa es una pieza versátil que se adapta a tus necesidades. Fabricadas con la más alta calidad y acabados impecables, estas mesas no solo embellecen tu espacio, sino que también ofrecen durabilidad y resistencia. Su diseño apilable y ligero las hace ideales para espacios pequeños, permitiendo una fácil reconfiguración según la ocasión. Descubre la elegancia sutil y la practicidad que el Set OSLO aporta a tu sala de estar, creando un ambiente acogedor y moderno.
  `, // Descripción ajustada
  sku: 'GAC-OSLO-SM-001', // SKU ajustado
  assemblyTime: '30 minutos', // Tiempo de armado ajustado
  difficulty: 'Fácil', // Dificultad ajustada
  assemblyTools: [ // Herramientas de armado ajustadas
    { name: 'Martillo de carpintero', icon: 'Hammer', included: false }, // Nuevo: Martillo
    { name: 'Destornillador Phillips', icon: 'Wrench', included: false }, // Modificado: No incluido
    { name: 'Llave Allen', icon: 'Hexagon', included: true },
    { name: 'Manual de instrucciones', icon: 'BookOpen', included: true },
  ],
  mainImages: [ // Imágenes principales actualizadas
    'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91369-bc36b6e0/Escena%20Art%20116.webp',
    'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/29549-0ae220bf/116R%20Real%20gris%20FF.webp',
    'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/29550-7517ec64/116R%20Real%20FF.webp',
    'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/29551-6986a0d5/116R%20real%203.webp',
    'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/29581-1467c049/116R%20Real%20patas%20FF.webp',
  ],
  thumbnails: [ // Miniaturas actualizadas (usando las mismas mainImages por simplicidad)
    'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91369-bc36b6e0/Escena%20Art%20116.webp',
    'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/29549-0ae220bf/116R%20Real%20gris%20FF.webp',
    'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/29550-7517ec64/116R%20Real%20FF.webp',
    'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/29551-6986a0d5/116R%20real%203.webp',
    'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/29581-1467c049/116R%20Real%20patas%20FF.webp',
  ],
  technicalImage: 'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/29553-d31928df/Art%20116%20%28Roble%20Natural-Blanco%29%20-%20Cotas.webp', // Imagen técnica actualizada
  specs: [ // Campos obligatorios CSV-ready
    { label: 'Línea', value: 'Nordik' },
    { label: 'Ambiente', value: 'Sala de Estar' },
    { label: 'Dimensiones', value: 'Mesa Baja: 60cm ø x 30cm / Mesa Alta: 45cm ø x 63cm' },
    { label: 'Color', value: 'Blanco - Roble Miel' },
  ],
  inspirationImages: [],
  manualPdf: '#', // Mapeado al campo Manual_PDF del CSV
  assemblyUrl: '#', // Mapeado al campo Instructivo_Armado del CSV
  suggestedProducts: [ // Productos sugeridos actualizados
    { id: 201, title: 'Torre HELSINKI', rating: 4, image: 'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91372-597a4125/Escena%20Art%20322020.webp' },
    { id: 202, title: 'Torre TROMSO', rating: 5, image: 'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91367-b135e62f/Escena%20Art%20322021.webp' },
    { id: 203, title: 'Barra desayunadora VIKEN', rating: 4, image: 'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91374-1243c00e/Escena%20Art%20455090.webp' },
    { id: 204, title: 'Mesa de comedor LEIR', rating: 3, image: 'https://petit-muebles-gacela-srl-mueblesgacela-odoo-sh.odoo.com/web/image/91392-c9ad79ed/Escena%20%28combo%20comedor%20557%29.webp' },
  ],
};

import { useParams, useNavigate } from 'react-router-dom';
import db from '../data/productos.json';
import VideoViewer from './VideoViewer';
import { slugify } from '../utils/slugify';

const getFolderAndLine = (product: any) => {
  let lineFolder = 'linea-clasica';
  const specLinea = product.specs?.find((s: any) => s.label === 'Línea')?.value || product.linea;
  if (specLinea) {
    const normalized = specLinea
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
    lineFolder = normalized.startsWith('linea-') ? normalized : `linea-${normalized}`;
  } else if (product.manualPdf) {
    const parts = product.manualPdf.split('/');
    const linePart = parts.find((p: string) => p.startsWith('linea-'));
    if (linePart) {
      lineFolder = linePart.toLowerCase();
    }
  }

  let folderName = '';
  if (product.manualPdf) {
    const filename = product.manualPdf.split('/').pop() || '';
    const match = filename.match(/^(a\d{6})/i);
    if (match) {
      folderName = match[1].toUpperCase();
    }
  }

  if (!folderName) {
    const skuStr = String(product.sku || product.id || '');
    const digits = skuStr.replace(/\D/g, '');
    if (digits) {
      folderName = 'A' + digits.padStart(6, '0');
    } else {
      folderName = 'A008395';
    }
  }

  // Handle Comedores mapping
  if (['557', '557-1', '557-2', '429090', '429091', '427091'].includes(String(product.sku || product.id))) {
    lineFolder = 'linea-comedores';
  }

  return { lineFolder, folderName };
};

const ProductDetail: React.FC<ProductDetailProps> = ({ product: propProduct, onBackClick, onStartAssembly, onStartAR }) => {
  const { linea, sku } = useParams();
  const navigate = useNavigate();

  // 1. Try to find the product in the local CMS DB by SKU
  const dbProduct = db.products.find(p => String(p.SKU) === String(sku));

  // 2. Map DB Product into Component format. DB fields: SKU, Nombre_Comercial, Linea, Ambiente, Medidas_Mueble, Medidas_Logistica, URLs_Fotos, Manual_PDF, Relacionados
  let parsedProduct = null;
  
  if (dbProduct) {
    const fotos = dbProduct.Fotos_Mueble ? dbProduct.Fotos_Mueble.split(/[;,]\s*/).filter(Boolean) : [];
    
    // Mandatory technical spec fields for CSV-ready structure
    let productSpecs = [
      { label: 'Línea', value: dbProduct.Linea || '-' },
      { label: 'Ambiente', value: dbProduct.Ambiente || '-' },
      { label: 'Dimensiones', value: dbProduct.Medidas_Mueble || '-' },
      { label: 'Color', value: (dbProduct as any).Color || '-' },
    ].filter(spec => spec.value !== '-');

    // Extra technical details like Materiales have been removed as requested.
    // Suggested products logic: find products by SKUs in "Relacionados" column
    const relatedSkus = dbProduct.Relacionados ? dbProduct.Relacionados.split(/[;,]\s*/).filter(sku => sku && sku !== dbProduct.SKU) : [];
    const suggestedFromDb = relatedSkus
      .map(sku => db.products.find(p => p.SKU === sku))
      .filter(Boolean)
      .map(p => ({
        id: p!.SKU,
        title: p!.Nombre_Comercial,
        image: p!.Fotos_Mueble ? p!.Fotos_Mueble.split(/[;,]\s*/)[0] : 'https://placehold.co/600x600/f2f2f2/1a1a1a?text=Pendiente',
        linea: p!.Linea
      }));

    // Fallback to 4 mock products if no related ones are found (as requested for reference)
    const fallbackSuggested = mockProductDetail.suggestedProducts || [];
    const finalSuggested = suggestedFromDb.length > 0 ? suggestedFromDb : fallbackSuggested;

    parsedProduct = {
      id: dbProduct.SKU, // use SKU as ID
      title: dbProduct.Nombre_Comercial,
      rating: 5,
      image: fotos.length > 0 ? fotos[0] : 'https://placehold.co/600x600/f2f2f2/1a1a1a?text=Pendiente',
      shortDescription: dbProduct.Descripcion_Corta || `${dbProduct.Linea || ''} - ${dbProduct.Ambiente || ''}. Medidas: ${dbProduct.Medidas_Mueble || 'N/A'}.`,
      longDescription: dbProduct.Descripcion_Larga || `Descubre la elegancia y funcionalidad de ${dbProduct.Nombre_Comercial}. Ideal para tu ${dbProduct.Ambiente || 'hogar'}.`,
      sku: dbProduct.SKU,
      assemblyTime: 'Pendiente',
      difficulty: 'Fácil',
      assemblyTools: [],
      mainImages: fotos.length > 0 ? fotos : ['https://placehold.co/600x600/f2f2f2/1a1a1a?text=Pendiente'],
      thumbnails: fotos.length > 0 ? fotos : ['https://placehold.co/600x600/f2f2f2/1a1a1a?text=Pendiente'],
      technicalImage: dbProduct.Foto_Medidas || '',
      specs: productSpecs,
      inspirationImages: [],
      suggestedProducts: finalSuggested,
      youtubeVideo: undefined,
      manualPdf: dbProduct.Manual_PDF || undefined,
      assemblyUrl: undefined,
    };
  }

  // Use parsed DB product, fallback to prop state (if clicked from Home PopularItems mock), fallback to mockProductDetail if ID is 1
  const product = parsedProduct || (propProduct?.id === 1 ? mockProductDetail : propProduct);

  if (!product) {
    return <div className="py-24 text-center">Producto no encontrado. <button onClick={() => navigate('/productos')} className="text-brand-support underline">Ver Portfolio</button></div>;
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [hasAssemblyGuide, setHasAssemblyGuide] = useState(false);

  useEffect(() => {
    if (!product || !product.sku) {
      setHasAssemblyGuide(false);
      return;
    }
    const { lineFolder, folderName } = getFolderAndLine(product);
    // Verificar si el archivo manifest.json existe y es un JSON válido (previene redirección SPA index.html)
    fetch(`/modelos_3d/${lineFolder}/${folderName}/manifest.json`)
      .then((res) => {
        if (!res.ok) throw new Error();
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error();
        }
        return res.json();
      })
      .then(() => {
        setHasAssemblyGuide(true);
      })
      .catch(() => {
        setHasAssemblyGuide(false);
      });
  }, [product?.sku]);

  const isKitchen = dbProduct?.Ambiente === "Cocina" || product.specs.some(s => s.label === "Ambiente" && s.value === "Cocina");

  // Definición de los 7 módulos para la cocina Lumo y Nordik
  const getKitchenModules = (line: string) => {
    const lineSuffix = line.toLowerCase() === "lumo" ? "lumo" : "nordik";
    const lineLabel = line.toLowerCase() === "lumo" ? "Lumo" : "Nordik";
    
    return [
      {
        sku: "101332",
        name: `Alacena de Cocina ${lineLabel} 1.20m`,
        measures: "120 x 31 x 63 cm",
        price: "$145.000",
        image: `/articulos-gacela-muebles-2026/linea-cocina/cocina-${lineSuffix}/Art-101332.webp`
      },
      {
        sku: "101338",
        name: `Alacena de Cocina ${lineLabel} 0.80m`,
        measures: "80 x 31 x 63 cm",
        price: "$115.000",
        image: `/articulos-gacela-muebles-2026/linea-cocina/cocina-${lineSuffix}/Art-101338.webp`
      },
      {
        sku: "104337",
        name: `Alacena Sobre-Extractor ${lineLabel} 71,5cm`,
        measures: "71.5 x 31 x 123 cm",
        price: "$85.000",
        image: `/articulos-gacela-muebles-2026/linea-cocina/cocina-${lineSuffix}/Art-104337.webp`
      },
      {
        sku: "106332",
        name: `Bajo Mesada ${lineLabel} 1.20m`,
        measures: "120 x 58 x 90 cm",
        price: "$210.000",
        image: `/articulos-gacela-muebles-2026/linea-cocina/cocina-${lineSuffix}/Art-106332.webp`
      },
      {
        sku: "106338",
        name: `Bajo Mesada ${lineLabel} 0.80m`,
        measures: "80 x 58 x 90 cm",
        price: "$160.000",
        image: `/articulos-gacela-muebles-2026/linea-cocina/cocina-${lineSuffix}/Art-106338.webp`
      },
      {
        sku: "137337",
        name: `Cristalero Despensero ${lineLabel}`,
        measures: "71.5 x 58 x 90 cm",
        price: "$245.000",
        image: `/articulos-gacela-muebles-2026/linea-cocina/cocina-${lineSuffix}/Art-137337.webp`
      },
      {
        sku: "138337",
        name: `Porta Microondas y Horno ${lineLabel}`,
        measures: "71.5 x 57 x 123 cm",
        price: "$225.000",
        image: `/articulos-gacela-muebles-2026/linea-cocina/cocina-${lineSuffix}/Art-138337.webp`
      }
    ];
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (product.mainImages?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (product.mainImages?.length || 1)) % (product.mainImages?.length || 1));
  };

  return (
    <div className="bg-brand-bg pt-12 pb-32 lg:pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Botón de Volver */}
        <motion.button
          onClick={onBackClick}
          className="mb-8 flex items-center text-brand-primary hover:text-brand-primary transition-colors text-sm font-semibold group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver a Productos
        </motion.button>

        {/* BLOQUE HERO DE PRODUCTO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24">
          {/* Izquierda: Galería de Imágenes */}
          <div className="flex flex-col">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={isKitchen
                ? "relative w-full rounded-xl overflow-hidden mb-6"
                : "relative aspect-square md:aspect-[5/4] w-full rounded-xl overflow-hidden bg-white shadow-lg mb-6 flex items-center justify-center"
              }
            >
              <img
                src={product.mainImages && product.mainImages.length > 0
                  ? product.mainImages[currentImageIndex]
                  : product.image}
                alt={`${product.title}`}
                className={isKitchen
                  ? "w-full h-auto object-contain rounded-xl"
                  : "w-full h-full object-cover"
                }
              />
              {product.mainImages && product.mainImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/70 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/70 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </motion.div>

            {/* Fila fija de 5 miniaturas */}
            <div className="grid grid-cols-5 gap-3 w-full">
              {Array.from({ length: 5 }).map((_, index) => {
                const photo = (product.thumbnails && product.thumbnails[index]) || 'https://placehold.co/100x100/f2f2f2/f2f2f2';
                const isSelected = currentImageIndex === index;
                const hasPhoto = index < (product.thumbnails?.length || 0);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={isKitchen
                      ? `relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected && hasPhoto ? 'border-brand-support shadow-sm' : 'border-gray-300'
                        } ${!hasPhoto ? 'cursor-default opacity-50' : 'hover:border-brand-support/40'}`
                      : `relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected && hasPhoto ? 'border-brand-support shadow-sm' : 'border-gray-100'
                        } ${!hasPhoto ? 'cursor-default opacity-50' : 'hover:border-brand-support/40'}`
                    }
                    onClick={() => hasPhoto && setCurrentImageIndex(index)}
                  >
                    <img
                      src={photo}
                      alt={`Miniatura ${index + 1}`}
                      className={isKitchen ? "w-full h-full object-contain" : "w-full h-full object-cover"}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Derecha: Info Rápida y Botones */}
          <div className="flex flex-col justify-center max-w-xl">
            <div className="mb-10">
              {(() => {
                const titleParts = product.title.split('(');
                const mainTitle = titleParts[0].trim();
                const colorPart = titleParts.length > 1 ? titleParts[1].replace(')', '').trim() : '';

                return (
                  <>
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-xl md:text-[28px] font-godber font-normal tracking-[0.03em] uppercase text-brand-primary mb-2 leading-[1.2]"
                    >
                      {mainTitle}
                    </motion.h1>
                    
                    {colorPart && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="text-[11px] uppercase tracking-[0.2em] text-brand-support font-clofie font-bold italic mb-6 flex items-center gap-2"
                      >
                        Color: {colorPart}
                      </motion.div>
                    )}
                  </>
                );
              })()}

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base md:text-lg text-[#594A42]/80 font-clofie font-light leading-relaxed max-w-md"
              >
                {product.shortDescription}
              </motion.p>
            </div>

            {/* Botonera de Soporte */}
            <div className="flex flex-col gap-4 w-full sm:max-w-md">
              {product.manualPdf && product.manualPdf !== '#' && (
                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  href={product.manualPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-7 py-3.5 bg-brand-support text-brand-bg rounded-md text-[13px] uppercase tracking-widest hover:bg-brand-support-hover transition-all shadow-lg hover:shadow-xl font-clofie font-bold italic w-full"
                >
                  <Download size={17} className="mr-2.5 shrink-0" />
                  Descargar Manual PDF
                </motion.a>
              )}
              
              {product.sku && hasAssemblyGuide && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  onClick={() => onStartAssembly(product)}
                  className="flex items-center justify-center px-7 py-3.5 bg-brand-primary text-brand-bg rounded-md text-[13px] uppercase tracking-widest hover:bg-brand-primary/95 transition-all shadow-lg hover:shadow-xl font-clofie font-bold italic w-full"
                >
                  <Wrench size={17} className="mr-2.5 shrink-0" />
                  Armado Guiado
                </motion.button>
              )}

              {(['839-5-BR', '839-5-B', '902-2-BR', '902-2-B', '902-2-C', '828-5-B', '828-5-BR', '320-12', '708-15', '221150', '710150', '234094', '321021', '331330', '334026', '334093', '405330', '446330', '716330', '732330', '742332', '742334', '742336', '322250', '326250', '331250', '334250', '353250', '446250', '760250', '334271', '334272', '353270', '405270', '446270', '732270', '742270', '742272', '742273'].includes(product.sku)) && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  onClick={() => onStartAR(product)}
                  className="flex items-center justify-center px-7 py-3.5 bg-brand-accent text-brand-bg rounded-md text-[13px] uppercase tracking-widest hover:bg-brand-accent/95 transition-all shadow-lg hover:shadow-xl font-clofie font-bold italic w-full mt-3"
                >
                  <Camera size={17} className="mr-2.5 shrink-0" />
                  Ver en mi espacio (AR)
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* BLOQUE DE DESCRIPCIÓN ESTÉTICA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="my-20 max-w-3xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="block h-px w-12 bg-brand-support/50" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-brand-support font-clofie font-semibold">Filosofía de Diseño</span>
            <span className="block h-px w-12 bg-brand-support/50" />
          </div>
          <blockquote>
            <p className="text-base md:text-lg text-[#594A42]/80 font-clofie font-light italic leading-[2]">
              {product.longDescription}
            </p>
          </blockquote>
        </motion.div>

        {/* DESGLOSE DE MÓDULOS (PDP MEGA-EXTENDIDA) */}
        {isKitchen && (
          <div className="my-24 border-t border-brand-support/20 pt-16">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="block h-px w-12 bg-brand-support/50" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-brand-support font-clofie font-semibold">Configuración Modular</span>
                <span className="block h-px w-12 bg-brand-support/50" />
              </div>
              <h2 className="text-2xl md:text-4xl font-godber font-normal tracking-[0.05em] uppercase text-brand-primary text-center">
                Desglose de Módulos
              </h2>
              <p className="mt-4 text-[#594A42]/80 font-clofie font-light max-w-2xl mx-auto">
                Armá la cocina a tu medida combinando los siguientes módulos independientes. Cada uno ha sido diseñado para maximizar el espacio y brindar durabilidad superior.
              </p>
            </div>

            <div className="space-y-20 lg:space-y-32">
              {getKitchenModules(product.specs.find(s => s.label === "Línea")?.value || "Lumo").map((mod, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <motion.div
                    key={mod.sku}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6 }}
                    className={`flex flex-col lg:flex-row gap-12 lg:gap-16 items-center max-w-5xl mx-auto ${isEven ? '' : 'lg:flex-row-reverse'}`}
                  >
                    {/* Imagen del Módulo */}
                    <div className="w-full lg:w-1/2 aspect-[4/3] flex items-center justify-center group">
                      <img
                        src={mod.image}
                        alt={mod.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Información del Módulo */}
                    <div className="w-full lg:w-1/2 space-y-6">
                      <h3 className="text-xl md:text-2xl font-godber uppercase text-brand-primary tracking-wide">
                        {mod.name}
                      </h3>

                      <div className="border-t border-[#D9CDB8]/35 pt-4 grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-brand-primary/50 font-clofie font-bold mb-1">
                            Medidas (Ancho x Prof x Alto)
                          </p>
                          <p className="text-base text-[#594A42] font-clofie font-light">
                            {mod.measures}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-brand-primary/50 font-clofie font-bold mb-1">
                            SKU del Módulo
                          </p>
                          <p className="text-base text-[#594A42] font-clofie font-light">
                            {mod.sku}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ESPECIFICACIONES TÉCNICAS */}
        <div className="my-24">
          <h3 className="text-xl md:text-3xl font-godber font-normal tracking-[0.05em] uppercase text-brand-primary text-center mb-16">
            Especificaciones Técnicas
          </h3>
          
          {(() => {
            const showTechnicalImage = product.technicalImage && !isKitchen;
            return (
              <div className={showTechnicalImage ? "grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center" : "max-w-2xl mx-auto"}>
                {showTechnicalImage ? (
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-brand-support mb-4 font-clofie font-bold">Referencia de Medidas</div>
                    <img
                      src={product.technicalImage}
                      alt="Plano técnico del producto"
                      className="w-full max-w-lg h-auto object-contain bg-white p-6 rounded-xl shadow-sm border border-gray-50"
                    />
                  </motion.div>
                ) : null}

                <motion.div
                  initial={{ opacity: 0, x: showTechnicalImage ? 50 : 0, y: showTechnicalImage ? 0 : 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true }}
                  className="space-y-0 w-full"
                >
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0">
                    {product.specs.map((spec, index) => (
                      <div key={index} className="py-4 border-b border-gray-100 last:border-b-0">
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-brand-primary/50 font-clofie font-bold mb-1">{spec.label}</dt>
                        <dd className="text-[14px] md:text-base text-[#594A42] font-clofie font-light leading-snug">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              </div>
            );
          })()}
        </div>

        {/* DIÁLOGO DE VIDEO */}
        {product.youtubeVideo && (
          <VideoViewer 
            videoUrl={isVideoOpen ? product.youtubeVideo : null} 
            onClose={() => setIsVideoOpen(false)} 
          />
        )}

        {/* PRODUCTOS RELACIONADOS */}
        {product.suggestedProducts && product.suggestedProducts.length > 0 && (
          <div className="my-24">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
              className="text-xl md:text-2xl font-godber font-normal tracking-[0.05em] uppercase text-brand-primary text-center leading-tight mb-10"
            >
              PRODUCTOS RELACIONADOS
            </motion.h2>
            <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory">
              {product.suggestedProducts.slice(0, 4).map((suggested, index) => (
                <motion.div
                  key={suggested.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group cursor-pointer shrink-0 w-[72vw] sm:w-[48vw] md:w-auto snap-start"
                  onClick={() => {
                    const lineaSlug = suggested.linea ? slugify(suggested.linea) : 'producto';
                    navigate(`/${lineaSlug}/${suggested.id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-white mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                    <img
                      src={suggested.image}
                      alt={suggested.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base md:text-lg font-godber text-brand-primary group-hover:text-brand-support transition-colors">{suggested.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
