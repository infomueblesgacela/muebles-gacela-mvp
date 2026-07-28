import newsData from '../data/news.json';
import { NewsPost } from '../types/news';

// Mock service for Phase 1. In Phase 2, this will be replaced with Supabase / Odoo / CMS fetch logic.

export const fetchAllNews = async (): Promise<NewsPost[]> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(newsData.posts);
    }, 400);
  });
};

export const fetchNewsBySlug = async (slug: string): Promise<NewsPost | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const post = newsData.posts.find(p => p.slug === slug);
      resolve(post || null);
    }, 400);
  });
};

export const fetchRecentNews = async (limit: number = 3): Promise<NewsPost[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Sort by date descending
      const sorted = [...newsData.posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resolve(sorted.slice(0, limit));
    }, 400);
  });
};
