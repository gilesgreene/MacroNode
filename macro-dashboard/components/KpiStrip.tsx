'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { KpiData, IndicatorTag } from '@/lib/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KpiCardProps {
  label: string;
  data: KpiData | null;
  tag: IndicatorTag;
  isSelected?: boolean;
  onClick: () => void;
  loading?: boolean;
  unit?: string;
  isDelayed?: boolean;
}

function KpiCard({ label, data, tag, isSelected, onClick, loading, unit = '%', isDelayed }: KpiCardProps) {
  const directionColor = data?.direction === 'up' ? 'text-semantic-positive' : 
                         data?.direction === 'down' ? 'text-semantic-negative' : 
                         'text-semantic-neutral';
  
  const dotColor = data?.direction === 'up' ? 'bg-semantic-positive' : 
                   data?.direction === 'down' ? 'bg-semantic-negative' : 
                   'bg-semantic-neutral';

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex-1 bg-surface-card border-card rounded-card p-3 cursor-pointer transition-all",
        "hover:border-[#D1D5DB]",
        isSelected ? "border-[1.5px] border-accent-primary" : "border-[#E5E7EB]"
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-kpi-label text-text-tertiary uppercase tracking-wider">{label}</span>
        {isDelayed && (
          <span className="bg-tag-inflation-bg text-tag-inflation-text text-[9px] px-1.5 py-0.5 rounded-tag">
            DELAYED
          </span>
        )}
      </div>
      
      {loading ? (
        <div className="h-8 w-16 bg-surface-page animate-pulse rounded" />
      ) : data ? (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-kpi-value text-text-primary font-medium">
              {data.latest.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{unit}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
            <span className={cn("text-kpi-label", directionColor)}>
              {data.delta > 0 ? '+' : ''}
              {data.delta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {unit === 'K' ? 'K' : 'pts'}
            </span>
          </div>
        </div>
      ) : (
        <span className="text-kpi-label text-text-muted">No data</span>
      )}
    </div>
  );
}

interface KpiStripProps {
  items: {
    label: string;
    tag: IndicatorTag;
    data: KpiData | null;
    loading: boolean;
    unit?: string;
    isDelayed?: boolean;
  }[];
  selectedTag: IndicatorTag | null;
  onSelectTag: (tag: IndicatorTag) => void;
}

export default function KpiStrip({ items, selectedTag, onSelectTag }: KpiStripProps) {
  return (
    <div className="flex gap-2 w-full">
      {items.map((item) => (
        <KpiCard
          key={item.tag}
          label={item.label}
          tag={item.tag}
          data={item.data}
          loading={item.loading}
          unit={item.unit}
          isDelayed={item.isDelayed}
          isSelected={selectedTag === item.tag}
          onClick={() => onSelectTag(item.tag)}
        />
      ))}
    </div>
  );
}
