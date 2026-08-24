export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  coverImage: string;
  focalPoint?: 'center' | 'top' | 'bottom';
  content: string; // Markdown or HTML content
  date: string;
  updatedAt?: string;
  author: string;
  category: string;
  tags: string[]; // For relating to Muebles Gacela product Lineas/Ambientes
  isFeatured?: boolean;
  status?: 'published' | 'draft';
}
