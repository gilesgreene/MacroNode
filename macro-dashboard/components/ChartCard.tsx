'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  timeframe: '1Y' | '5Y' | '10Y';
  onTimeframeChange: (range: '1Y' | '5Y' | '10Y') => void;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export default function ChartCard({
  title,
  subtitle,
  timeframe,
  onTimeframeChange,
  loading,
  error,
  children,
}: Omit<ChartCardProps, 'onAddNote'>) {
  return (
    <div className="card flex flex-col h-[340px] gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-section text-text-primary">{title}</h3>
          {subtitle && <p className="text-chart-sub text-text-tertiary">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-page p-0.5 rounded-tab">
            {(['1Y', '5Y', '10Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => onTimeframeChange(range)}
                className={cn(
                  "px-3 py-1 text-kpi-label rounded-tab transition-all",
                  timeframe === range 
                    ? "bg-surface-card shadow-sm text-text-primary font-medium" 
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-card/50">
            <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-kpi-label text-semantic-negative">
            {error}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
