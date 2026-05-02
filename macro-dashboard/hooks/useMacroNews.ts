'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NewsArticle {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  overall_sentiment_label: string;
}

export function useMacroNews(initialTopic: string = 'economy_macro') {
  const [topic, setTopic] = useState(initialTopic);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CACHE_KEY = `macro_news_${topic}`;
  const CACHE_TIME = 6 * 60 * 60 * 1000; // 6 hours

  const fetchNews = useCallback(async (force: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check Cache
      if (!force) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TIME) {
            setArticles(data);
            setLoading(false);
            return;
          }
        }
      }

      const res = await fetch(`/api/news?topic=${topic}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.feed) {
        setArticles(data.feed);
        // Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: data.feed,
          timestamp: Date.now()
        }));
      } else {
        setArticles([]);
      }
    } catch (err) {
      setError('Failed to load news feed');
    } finally {
      setLoading(false);
    }
  }, [topic]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, topic, setTopic, refresh: () => fetchNews(true) };
}
