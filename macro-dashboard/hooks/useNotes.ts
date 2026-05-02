'use client';

import { useState, useEffect } from 'react';
import { Note, IndicatorTag } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from Supabase
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedNotes: Note[] = data.map(item => ({
          id: item.id,
          tag: item.tag as IndicatorTag,
          title: item.title,
          text: item.text,
          createdAt: item.created_at,
        }));
        setNotes(mappedNotes);
      }
    } catch (e) {
      console.error('Error fetching notes from Supabase:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async (tag: IndicatorTag, text: string, title?: string) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([
          { tag, text, title, created_at: new Date().toISOString() }
        ])
        .select();

      if (error) throw error;
      
      if (data) {
        const newNote: Note = {
          id: data[0].id,
          tag: data[0].tag as IndicatorTag,
          title: data[0].title,
          text: data[0].text,
          createdAt: data[0].created_at,
        };
        setNotes(prev => [newNote, ...prev]);
      }
    } catch (e) {
      console.error('Error adding note to Supabase:', e);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error('Error deleting note from Supabase:', e);
    }
  };

  return { notes, loading, addNote, deleteNote, refresh: fetchNotes };
}
