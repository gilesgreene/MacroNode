'use client';

import React from 'react';
import { Note, IndicatorTag } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onClick: (note: Note) => void;
  showDelete?: boolean;
}

const tagStyles: Record<IndicatorTag, string> = {
  Inflation: "bg-tag-inflation-bg text-tag-inflation-text",
  GDP: "bg-tag-gdp-bg text-tag-gdp-text",
  Unemployment: "bg-tag-unemployment-bg text-tag-unemployment-text",
  Yields: "bg-tag-yields-bg text-tag-yields-text",
  Payrolls: "bg-tag-payrolls-bg text-tag-payrolls-text",
  General: "bg-tag-general-bg text-tag-general-text",
};

export default function NoteCard({ note, onDelete, onClick, showDelete }: NoteCardProps) {
  return (
    <div 
      onClick={() => onClick(note)}
      className="bg-surface-card border border-[#E5E7EB] rounded-[12px] p-4 space-y-3 group hover:shadow-md hover:border-accent-primary/30 transition-all cursor-pointer relative"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className={cn(
            "text-[9px] font-bold px-2 py-0.5 rounded-tag uppercase tracking-wider",
            tagStyles[note.tag]
          )}>
            {note.tag}
          </span>
          {note.title && (
            <h4 className="text-[16px] text-text-primary leading-tight font-bold pt-1 group-hover:text-accent-primary transition-colors">
              {note.title}
            </h4>
          )}
        </div>
        {showDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="text-text-muted hover:text-semantic-negative p-1 rounded-full hover:bg-surface-hover transition-colors text-[16px] z-10"
          >
            ×
          </button>
        )}
      </div>
      
      <p className="text-[13px] text-text-secondary line-clamp-3 leading-relaxed">
        {note.text}
      </p>
      
      <div className="flex justify-between items-center pt-2 border-t border-[#F3F4F6]">
        <div className="text-[10px] text-text-tertiary font-medium">
          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
        </div>
        <span className="text-[10px] text-accent-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          Read Full Report →
        </span>
      </div>
    </div>
  );
}
