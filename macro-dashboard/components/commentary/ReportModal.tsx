'use client';

import React from 'react';
import { Note, IndicatorTag } from '@/lib/types';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReportModalProps {
  report: Note | null;
  onClose: () => void;
}

const tagStyles: Record<IndicatorTag, string> = {
  Inflation: "bg-tag-inflation-bg text-tag-inflation-text",
  GDP: "bg-tag-gdp-bg text-tag-gdp-text",
  Unemployment: "bg-tag-unemployment-bg text-tag-unemployment-text",
  Yields: "bg-tag-yields-bg text-tag-yields-text",
  Payrolls: "bg-tag-payrolls-bg text-tag-payrolls-text",
  General: "bg-tag-general-bg text-tag-general-text",
};

export default function ReportModal({ report, onClose }: ReportModalProps) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface-page w-full max-w-2xl max-h-[80vh] rounded-[16px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-start bg-surface-card">
          <div className="space-y-2">
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-tag uppercase tracking-widest",
              tagStyles[report.tag]
            )}>
              {report.tag}
            </span>
            <h2 className="text-[24px] font-bold text-text-primary leading-tight">
              {report.title || 'Economic Analysis'}
            </h2>
            <p className="text-[12px] text-text-tertiary">
              Published on {format(new Date(report.createdAt), 'MMMM d, yyyy')} • By MacroNode Analyst
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-surface-page">
          <div className="prose prose-slate max-w-none">
            <p className="text-[16px] text-text-secondary leading-relaxed whitespace-pre-wrap">
              {report.text}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-surface-nav flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-text-primary text-surface-card rounded-tab font-medium hover:bg-text-secondary transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
      
      {/* Backdrop Close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
