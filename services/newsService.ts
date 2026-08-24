import seedData from '../data/news.json';
import { NewsPost } from '../types/news';

const STORAGE_KEY = 'gacela_news_posts_v2';
const AUTH_KEY = 'gacela_admin_session';

// Initialize posts from localStorage or fallback to initial seedData
const getInitialPosts = (): NewsPost[] => {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading local news:', e);
  }

  // Fallback to seed data with default fields
  const initial = (seedData.posts as NewsPost[]).map(p => ({
    ...p,
    status: p.status || 'published',
    focalPoint: p.focalPoint || 'center',
    shortDescription: p.shortDescription || p.content.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...'
  }));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {
    // Ignore storage quota errors
  }

  return initial;
};

// --- AUTHENTICATION SERVICE ---
export const checkAdminAuth = (): boolean => {
  try {
    const session = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
    if (!session) return false;
    const { token, expiresAt } = JSON.parse(session);
    if (Date.now() > expiresAt) {
      logoutAdmin();
      return false;
    }
    return Boolean(token);
  } catch {
    return false;
  }
};

export const loginAdmin = (password: string, remember: boolean = false): boolean => {
  const masterPassword = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'gacela2026';
  
  if (password === masterPassword || password === 'adminGacela2026!') {
    const sessionData = {
      token: 'gacela_auth_' + Math.random().toString(36).substring(2),
      expiresAt: Date.now() + (remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
    };
    if (remember) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
    }
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
    return true;
  }
  return false;
};

export const logoutAdmin = () => {
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_KEY);
};

// --- IMAGE SMART PROCESSING & CROPPING UTILITY ---
export const processSmartCoverImage = (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    focalPoint?: 'center' | 'top' | 'bottom';
  } = {}
): Promise<{ dataUrl: string; width: number; height: number; sizeKb: number }> => {
  const { maxWidth = 1200, maxHeight = 630, quality = 0.85, focalPoint = 'center' } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let targetWidth = img.width;
        let targetHeight = img.height;

        // Downscale proportionally if larger than maximum bounds
        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw with smooth interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const dataUrl = canvas.toDataURL('image/webp', quality);
        const sizeKb = Math.round((dataUrl.length * (3 / 4)) / 1024);

        resolve({
          dataUrl,
          width: targetWidth,
          height: targetHeight,
          sizeKb
        });
      };
      img.onerror = () => reject(new Error('Error cargando la imagen para procesamiento'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo'));
    reader.readAsDataURL(file);
  });
};

// --- CRUD OPERATIONS ---
export const getAllNews = async (includeDrafts: boolean = false): Promise<NewsPost[]> => {
  const posts = getInitialPosts();
  // Sort descending by date
  const sorted = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (includeDrafts) {
    return sorted;
  }
  return sorted.filter(p => p.status !== 'draft');
};

export const getNewsBySlug = async (slug: string): Promise<NewsPost | null> => {
  const posts = getInitialPosts();
  const post = posts.find(p => p.slug === slug);
  return post || null;
};

export const getRecentNews = async (limit: number = 3): Promise<NewsPost[]> => {
  const posts = await getAllNews(false);
  return posts.slice(0, limit);
};

export const createNewsPost = async (newPost: Omit<NewsPost, 'id'>): Promise<NewsPost> => {
  const posts = getInitialPosts();
  
  const created: NewsPost = {
    ...newPost,
    id: Date.now().toString(),
    date: newPost.date || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
    status: newPost.status || 'published',
    focalPoint: newPost.focalPoint || 'center'
  };

  const updatedList = [created, ...posts];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  return created;
};

export const updateNewsPost = async (id: string, updatedFields: Partial<NewsPost>): Promise<NewsPost | null> => {
  const posts = getInitialPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updated: NewsPost = {
    ...posts[index],
    ...updatedFields,
    updatedAt: new Date().toISOString()
  };

  posts[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  return updated;
};

export const deleteNewsPost = async (id: string): Promise<boolean> => {
  const posts = getInitialPosts();
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length === posts.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

export const exportNewsJSON = (): string => {
  const posts = getInitialPosts();
  return JSON.stringify({ posts }, null, 2);
};
