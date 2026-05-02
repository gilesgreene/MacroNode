'use client';

import React, { useState, useEffect } from 'react';
import { IndicatorTag } from '@/lib/types';

interface NoteInputProps {
  onSave: (tag: IndicatorTag, text: string, title?: string) => void;
  defaultTag: IndicatorTag | null;
}

const TAGS: IndicatorTag[] = ['General', 'Inflation', 'GDP', 'Unemployment', 'Yields', 'Payrolls'];

export default function NoteInput({ onSave, defaultTag }: NoteInputProps) {
  const [tag, setTag] = useState<IndicatorTag>('General');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (defaultTag) {
      setTag(defaultTag);
    }
  }, [defaultTag]);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(tag, text, title.trim() || undefined);
    setText('');
    setTitle('');
  };

  return (
    <div className="p-4 bg-surface-nav border-t border-[#E5E7EB] space-y-3">
      <div className="flex gap-2">
        <select 
          value={tag}
          onChange={(e) => setTag(e.target.value as IndicatorTag)}
          className="flex-1 text-[10px] bg-surface-input border border-[#E5E7EB] rounded-tab px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent-primary"
        >
          {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button 
          onClick={handleSave}
          disabled={!text.trim()}
          className="px-3 py-1 bg-text-primary text-surface-card text-[10px] rounded-tab font-medium hover:bg-text-secondary disabled:bg-text-muted transition-colors"
        >
          Post Note
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note Title (Optional)"
        className="w-full p-2 text-section bg-surface-input border border-[#E5E7EB] rounded-tab focus:outline-none focus:ring-1 focus:ring-accent-primary"
      />
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your note..."
        className="w-full h-32 p-2 text-note-body bg-surface-input border border-[#E5E7EB] rounded-tab focus:outline-none focus:ring-1 focus:ring-accent-primary resize-none"
      />
    </div>
  );
}
