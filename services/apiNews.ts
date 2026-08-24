import { NewsPost } from '../types/news';
import { getAllNews, getNewsBySlug, getRecentNews } from './newsService';

export const fetchAllNews = async (): Promise<NewsPost[]> => {
  return getAllNews(false);
};

export const fetchNewsBySlug = async (slug: string): Promise<NewsPost | null> => {
  return getNewsBySlug(slug);
};

export const fetchRecentNews = async (limit: number = 3): Promise<NewsPost[]> => {
  return getRecentNews(limit);
};
