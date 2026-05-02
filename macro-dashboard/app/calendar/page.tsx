'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, Info, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { format, isToday, parseISO, isPast } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  event: string;
  importance: 'Low' | 'Medium' | 'High';
  forecast: string;
  previous: string;
  actual?: string;
  category: string;
}

function EventRow({ event }: { event: EconomicEvent }) {
  const eventDate = parseISO(event.date);
  const isCurrentlyToday = isToday(eventDate);
  const isReleased = !!event.actual;
  
  const importanceColor = 
    event.importance === 'High' ? 'text-semantic-negative' :
    event.importance === 'Medium' ? 'text-accent-primary' :
    'text-text-tertiary';

  return (
    <div className={cn(
      "group flex flex-col md:flex-row md:items-center p-4 border-b border-[#F1F5F9] dark:border-white/5 hover:bg-surface-page/50 transition-colors relative",
      isCurrentlyToday && "bg-accent-primary/[0.03] border-l-2 border-l-accent-primary"
    )}>
      <div className="w-full md:w-40 shrink-0 mb-2 md:mb-0">
        <div className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
          {format(eventDate, 'EEE, MMM d, yyyy')}
        </div>
        <div className="text-[10px] text-text-tertiary flex items-center gap-1 mt-0.5">
          <Clock size={10} />
          {event.time}
        </div>
      </div>

      <div className="flex-1 md:px-4 mb-4 md:mb-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn("text-[9px] font-bold uppercase tracking-widest", importanceColor)}>
            {event.importance} Impact
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-page text-text-tertiary font-medium">
            {event.category}
          </span>
        </div>
        <h4 className="text-[13px] font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
          {event.event}
        </h4>
      </div>

      <div className="flex gap-4 md:gap-8 justify-between md:justify-end md:w-64 shrink-0 md:pr-4">
        <div className="flex-1 md:flex-none md:w-16">
          <div className="text-[9px] text-text-tertiary uppercase tracking-tighter mb-0.5">Actual</div>
          <div className={cn("text-[13px] font-mono font-bold", isReleased ? "text-text-primary" : "text-text-muted")}>
            {event.actual || '--'}
          </div>
        </div>
        <div className="flex-1 md:flex-none md:w-16">
          <div className="text-[9px] text-text-tertiary uppercase tracking-tighter mb-0.5">Estimate</div>
          <div className="text-[13px] font-mono font-medium text-text-secondary">{event.forecast}</div>
        </div>
        <div className="flex-1 md:flex-none md:w-16">
          <div className="text-[9px] text-text-tertiary uppercase tracking-tighter mb-0.5">Previous</div>
          <div className="text-[13px] font-mono font-medium text-text-tertiary">{event.previous}</div>
        </div>
      </div>

      <div className="hidden md:flex w-8 justify-center">
        {isReleased ? (
          <CheckCircle2 size={16} className="text-semantic-positive" />
        ) : (
          <ChevronRight size={16} className="text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        setLoading(true);
        const res = await fetch('/api/calendar');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setEvents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load calendar');
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, []);

  return (
    <main className="flex flex-col h-screen bg-surface-page overflow-hidden font-sans transition-colors duration-300">
      {/* Nav */}
      <nav className="h-12 bg-surface-nav border-b border-[#E5E7EB] dark:border-white/10 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <Image src="/macronode_favicon.svg" alt="MacroNode" width={24} height={24} />
            <h1 className="hidden sm:block text-brand text-text-primary tracking-tight">MacroNode Dashboard</h1>
          </div>
          <nav className="flex gap-4 shrink-0">
            <Link href="/" className="text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors pb-1">Dashboard</Link>
            <Link href="/forecast" className="text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors pb-1">Forecasting</Link>
            <Link href="/calendar" className="text-[13px] font-medium text-accent-primary border-b-2 border-accent-primary pb-1">Calendar</Link>
          </nav>
        </div>
        <ThemeToggle />
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-surface-page">
          {/* Header */}
          <div className="p-4 md:p-8 border-b border-[#E5E7EB] dark:border-white/10 bg-surface-card/30">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent-primary/10 dark:bg-white/10 rounded-lg border border-transparent dark:border-white/5">
                  <CalendarIcon className="calendar-logo-icon text-accent-primary" size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Economic Calendar</h2>
              </div>
              <p className="text-text-tertiary text-xs md:text-sm max-w-xl">
                Real-time US economic release schedule powered by Financial Modeling Prep. Includes Wall Street consensus estimates and live actuals.
              </p>
            </div>
          </div>

          {/* Calendar List */}
          <div className="max-w-5xl mx-auto py-4 md:py-6 px-4 md:px-8">
            <div className="bg-surface-card border border-[#E5E7EB] dark:border-white/10 rounded-card shadow-sm overflow-hidden">
              <div className="bg-[#F8FAFC] dark:bg-black/20 px-4 py-2 border-b border-[#E5E7EB] dark:border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#ffffff] uppercase tracking-widest">Global Data Releases (Next 30 Days)</span>
              </div>
              
              <div className="divide-y divide-[#F1F5F9] dark:divide-white/5">
                {loading ? (
                  <div className="p-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-accent-primary" size={32} />
                    <p className="text-xs text-text-tertiary font-medium animate-pulse">Syncing with FMP Intelligence...</p>
                  </div>
                ) : error ? (
                  <div className="p-20 text-center text-semantic-negative text-sm font-medium">
                    {error}
                  </div>
                ) : events.length === 0 ? (
                  <div className="p-20 text-center text-text-tertiary text-sm italic">
                    No upcoming US releases found in the next 30 days.
                  </div>
                ) : (
                  events.map(event => (
                    <EventRow key={event.id} event={event} />
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#F8FAFC] dark:bg-black/20 border border-[#E5E7EB] dark:border-white/10 rounded-lg flex items-start gap-3">
              <Info size={16} className="text-accent-primary shrink-0 mt-0.5" />
              <p className="text-[10px] md:text-[11px] text-text-secondary leading-relaxed">
                Releases are pulled in real-time from FMP. &quot;Estimate&quot; represents the market consensus, and &quot;Actual&quot; will update automatically as numbers are published by reporting agencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
