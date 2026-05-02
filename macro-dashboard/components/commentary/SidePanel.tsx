'use client';

import React from 'react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useMacroNews, NewsArticle } from '@/hooks/useMacroNews';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Clock, RefreshCw, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TOPICS = [
  { id: 'economy_macro', label: 'All Macro' },
  { id: 'finance', label: 'Finance' },
  { id: 'retail_wholesale', label: 'Retail' },
  { id: 'energy_transportation', label: 'Energy' },
];

interface NewsCardProps {
  article: NewsArticle;
}

function NewsCard({ article }: NewsCardProps) {
  const sentimentColor = 
    article.overall_sentiment_label.includes('Bullish') ? 'text-semantic-positive' :
    article.overall_sentiment_label.includes('Bearish') ? 'text-semantic-negative' :
    'text-text-tertiary';

  const SentimentIcon = article.overall_sentiment_label.includes('Bullish') ? TrendingUp : TrendingDown;

  return (
    <a 
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-surface-card border border-[#E5E7EB] rounded-[12px] p-4 space-y-3 group hover:shadow-md hover:border-accent-primary/30 transition-all cursor-pointer relative"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider">{article.source}</span>
            <span className="text-[10px] text-text-tertiary flex items-center gap-1">
              <Clock size={10} />
              {format(parseISO(article.time_published), 'MMM d, h:mm a')}
            </span>
          </div>
          <h3 className="text-[13px] font-medium text-text-primary leading-snug group-hover:text-accent-primary transition-colors">
            {article.title}
          </h3>
        </div>
        {article.banner_image && (
          <Image 
            src={article.banner_image} 
            alt="" 
            width={64}
            height={64}
            className="w-16 h-16 rounded-md object-cover border border-[#F1F5F9] shrink-0" 
            unoptimized
          />
        )}
      </div>

      <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed font-light">
        {article.summary}
      </p>

      <div className="flex items-center justify-between pt-1">
        <div className={cn("flex items-center gap-1.5 text-[10px] font-medium", sentimentColor)}>
          <SentimentIcon size={12} />
          {article.overall_sentiment_label}
        </div>
        <div className="text-[10px] font-medium text-text-tertiary group-hover:text-accent-primary transition-colors flex items-center gap-1">
          Read Article <ExternalLink size={12} />
        </div>
      </div>
    </a>
  );
}

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidePanel({ isOpen }: SidePanelProps) {
  const { articles, loading, error, topic, setTopic, refresh } = useMacroNews();

  if (!isOpen) return null;

  return (
    <aside className="w-[360px] bg-surface-panel border-l border-[#E5E7EB] flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="h-12 px-4 border-b border-[#E5E7EB] flex items-center justify-between bg-surface-nav shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent-primary/10 dark:bg-[#020617] rounded-md border border-transparent dark:border-white/10">
            <Newspaper size={18} className="news-logo-icon text-accent-primary" />
          </div>
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Macro News</h2>
        </div>
        <button 
          onClick={refresh}
          disabled={loading}
          className="p-1.5 text-text-tertiary hover:text-accent-primary hover:bg-surface-hover rounded-md transition-all disabled:opacity-50"
          title="Refresh Feed"
        >
          <RefreshCw size={16} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="px-4 py-3 border-b border-[#E5E7EB] bg-surface-page/50 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={12} className="text-text-tertiary" />
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Filter by Topic</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => setTopic(t.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border",
                topic === t.id 
                  ? "bg-accent-primary text-white border-accent-primary shadow-sm" 
                  : "bg-surface-card text-text-secondary border-[#E5E7EB] hover:border-accent-primary/50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-page/30">
        {loading && articles.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-surface-card border border-[#F1F5F9] rounded-[12px] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-semantic-negative bg-semantic-negative/5 p-3 rounded-lg border border-semantic-negative/10">
              {error}
            </p>
            <button 
              onClick={refresh}
              className="text-[11px] font-medium text-accent-primary hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-text-tertiary text-xs italic">
            No recent articles found for this topic.
          </div>
        ) : (
          articles.map((article, idx) => (
            <NewsCard key={`${article.url}-${idx}`} article={article} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#E5E7EB] bg-surface-nav text-center">
        <p className="text-[9px] text-text-tertiary font-medium tracking-tight">
          POWERED BY ALPHAVANTAGE INTELLIGENCE
        </p>
      </div>
    </aside>
  );
}
