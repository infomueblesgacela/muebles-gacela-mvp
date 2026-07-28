export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  content: string; // Markdown or HTML content
  date: string;
  author: string;
  category: string;
  tags: string[]; // For relating to Muebles Gacela product Lineas
  isFeatured?: boolean;
}
