'use client';

import React, { useState } from 'react';
import { IndicatorTag, Note } from '@/lib/types';
import NoteCard from './NoteCard';
import NoteInput from './NoteInput';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onAddNote: (tag: IndicatorTag, text: string, title?: string) => void;
  onDeleteNote: (id: string) => void;
  onNoteClick: (note: Note) => void;
  selectedTag: IndicatorTag | null;
}

const TAGS: (IndicatorTag | 'All')[] = ['All', 'Inflation', 'GDP', 'Unemployment', 'Yields', 'Payrolls', 'General'];

export default function SidePanel({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onDeleteNote,
  onNoteClick,
  selectedTag,
}: SidePanelProps) {
  const [filter, setFilter] = useState<IndicatorTag | 'All'>('All');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const filteredNotes = notes.filter(n => filter === 'All' || n.tag === filter);

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        setIsLoggingIn(false);
        setPassword('');
        setError('');
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError('Auth error');
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-[320px] bg-surface-panel border-l border-[#E5E7EB] flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="h-12 px-4 border-b border-[#E5E7EB] flex items-center justify-between bg-surface-nav shrink-0">
        <h2 className="text-brand text-text-primary">Notes</h2>
        <button 
          onClick={() => isAdmin ? setIsAdmin(false) : setIsLoggingIn(!isLoggingIn)}
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
        </button>
      </div>

      {/* Login Overlay / Section */}
      {isLoggingIn && !isAdmin && (
        <div className="p-4 bg-surface-input border-b border-[#E5E7EB] space-y-2">
          <p className="text-[10px] text-text-tertiary uppercase font-medium">Admin Access</p>
          <div className="flex gap-2">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="flex-1 px-2 py-1 text-kpi-label border border-[#E5E7EB] rounded-tab focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button 
              onClick={handleLogin}
              className="px-3 py-1 bg-text-primary text-surface-card text-[10px] rounded-tab"
            >
              Enter
            </button>
          </div>
          {error && <p className="text-[9px] text-semantic-negative">{error}</p>}
        </div>
      )}

      {/* Filter Chips */}
      <div className="p-3 border-b border-[#E5E7EB] shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-2 py-0.5 rounded-tab text-[10px] transition-colors border",
                filter === t 
                  ? "bg-text-primary text-surface-card border-text-primary" 
                  : "bg-surface-page text-text-tertiary border-transparent hover:border-[#E5E7EB]"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-2">
            <div className="text-text-muted text-[24px]">✎</div>
            <p className="text-kpi-label text-text-tertiary">No reports published yet.</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onDelete={isAdmin ? onDeleteNote : () => {}} 
              onClick={onNoteClick}
              showDelete={isAdmin} 
            />
          ))
        )}
      </div>

      {/* Input Area (Admin Only) */}
      {isAdmin && (
        <NoteInput 
          onSave={onAddNote} 
          defaultTag={selectedTag} 
        />
      )}
    </aside>
  );
}
