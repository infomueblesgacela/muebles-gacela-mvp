
export interface Product {
  id: number;
  title: string;
  rating: number;
  image: string; // Imagen principal para las cards de la Home
  
  // Campos específicos de la PDP
  shortDescription: string;
  longDescription: string;
  sku: string;
  assemblyTime: string; // Nuevo campo: Tiempo estimado de armado
  difficulty: string; // Nuevo campo: Nivel de dificultad del armado
  assemblyTools: { name: string; icon: string; included: boolean }[]; // Nuevo campo: Herramientas para el armado
  mainImages: string[]; // Para la galería del hero de la PDP
  thumbnails: string[]; // Para las miniaturas de la galería
  technicalImage: string; // Para la sección de especificaciones técnicas
  specs: { label: string; value: string }[];
  inspirationImages: string[];
  suggestedProducts: Pick<Product, 'id' | 'title' | 'rating' | 'image'>[]; // Productos sugeridos, simplificados
  youtubeVideo?: string; // Nuevo campo: URL del video de YouTube
  manualPdf?: string;    // Mapeado al campo Manual_PDF del CSV
  assemblyUrl?: string;  // Mapeado al campo Instructivo_Armado del CSV
}