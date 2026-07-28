/**
 * Generates an SEO-friendly, accent-free slug from a string.
 * e.g. "Clásica" -> "clasica"
 */
export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD') // Split accented characters into base character + accent
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars (letters/numbers/hyphen only)
    .replace(/\-\-+/g, '-'); // Replace multiple consecutive hyphens with a single one
};
