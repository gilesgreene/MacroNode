'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { useEconomicData } from '@/hooks/useEconomicData';
import { toYoY, toMonthlyChange, toQtrGrowth } from '@/lib/transforms';
import { format, parseISO } from 'date-fns';
import { Brain, ArrowLeft, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';

interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
  y?: number;
}

export default function ForecastPage() {
  const [seriesId, setSeriesId] = useState('CPIAUCSL');
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [reasoningLoading, setReasoningLoading] = useState(false);

  const generateReasoning = useCallback(async (id: string, forecast: ForecastPoint[]) => {
    try {
      setReasoningLoading(true);
      const lastPoint = forecast[forecast.length - 1];
      const startPoint = forecast[forecast.length - 13];
      const trend = lastPoint.yhat > startPoint.yhat ? 'upward' : 'downward';
      
      const res = await fetch('/api/reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesId: id,
          trend,
          forecastSummary: {
            current: startPoint.yhat,
            target: lastPoint.yhat,
            upper: lastPoint.yhat_upper,
            lower: lastPoint.yhat_lower
          }
        })
      });
      
      const json = await res.json();
      setReasoning(json.reasoning || json.error);
    } catch (e) {
      setReasoning('Failed to generate AI reasoning.');
    } finally {
      setReasoningLoading(false);
    }
  }, []);

  const fetchForecast = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/py/predict?series=${id}`);
      const json = await res.json();
      
      if (json.status === 'success') {
        setData(json.data.points);
        setAccuracy(json.data.accuracy);
        generateReasoning(id, json.data.points);
      } else {
        setError(json.message || 'Failed to fetch forecast');
      }
    } catch (e) {
      setError('Connection to prediction engine failed');
      console.error('Forecast fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, [generateReasoning]);

  useEffect(() => {
    fetchForecast(seriesId);
  }, [seriesId, fetchForecast]);

  const seriesOptions = [
    { id: 'CPIAUCSL', name: 'Consumer Price Index (CPI)' },
    { id: 'UNRATE', name: 'Unemployment Rate' },
    { id: 'A191RL1Q225SBEA', name: 'Real GDP Growth' },
    { id: 'PAYEMS', name: 'Nonfarm Payrolls' },
  ];

  return (
    <main className="flex flex-col h-screen bg-surface-page overflow-hidden font-sans">
      {/* Nav */}
      <nav className="h-12 bg-surface-nav border-b border-[#E5E7EB] flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <Image src="/macronode_favicon.svg" alt="MacroNode" width={24} height={24} />
            <h1 className="hidden sm:block text-brand text-text-primary tracking-tight">MacroNode Dashboard</h1>
          </div>
          <nav className="flex gap-4 shrink-0">
            <Link href="/" className="text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors pb-1">Dashboard</Link>
            <Link href="/forecast" className="text-[13px] font-medium text-accent-primary border-b-2 border-accent-primary pb-1">Forecasting</Link>
            <Link href="/calendar" className="text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors pb-1">Calendar</Link>
          </nav>
        </div>
        <ThemeToggle />
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area (Full Width) */}
        <div className="flex-1 overflow-y-auto bg-surface-page">
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            {/* Control Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
                  <Brain className="text-accent-primary" size={24} />
                  AI Prediction Engine
                </h2>
                <p className="text-text-tertiary text-xs md:text-sm">Prophet-based time-series forecasting for key indicators</p>
              </div>

              <select 
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="bg-surface-card border border-[#E5E7EB] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary shadow-sm w-full md:w-auto"
              >
                {seriesOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>

            {/* Chart Section */}
            <div className="bg-surface-card border border-[#E5E7EB] rounded-card p-4 md:p-6 h-[400px] md:h-[480px] relative shadow-sm outline-none" tabIndex={-1}>
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-accent-primary" size={28} />
                  <p className="text-text-tertiary text-xs animate-pulse font-medium">Training Prophet Model...</p>
                </div>
              ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-semantic-negative">
                  <AlertCircle size={32} />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              ) : (
                <>
                  <div className="absolute top-4 right-6 text-right">
                    <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest mb-1">Model Accuracy</div>
                    <div className="text-2xl font-bold text-text-primary">{accuracy}%</div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data}>
                      <defs>
                        <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      
                      {/* Vertical Present Line */}
                      {(() => {
                        const actualPoints = data.filter(p => p.y !== null && p.y !== undefined);
                        const lastActual = actualPoints[actualPoints.length - 1];
                        return lastActual ? (
                          <ReferenceLine 
                            x={lastActual.ds} 
                            stroke="#64748b" 
                            strokeWidth={2}
                            strokeDasharray="4 4" 
                            label={{ value: 'PRESENT', position: 'top', fill: '#64748b', fontSize: 10, fontWeight: '700', offset: 10 }} 
                          />
                        ) : null;
                      })()}

                      <XAxis 
                        dataKey="ds" 
                        tick={{fontSize: 10, fill: '#64748b'}} 
                        tickFormatter={(val) => format(parseISO(val), 'MMM yy')}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={30}
                      />
                      <YAxis 
                        tick={{fontSize: 10, fill: '#64748b'}} 
                        axisLine={false}
                        tickLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => `${val}${seriesId === 'CES0000000001' ? 'K' : '%'}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(label) => format(parseISO(label), 'MMMM yyyy')}
                        formatter={(value: number, name: string) => [
                          value.toFixed(2), 
                          name === 'yhat' ? 'Prediction' : 
                          name === 'y' ? 'Actual' : 
                          name === 'yhat_upper' ? 'Upper Bound' : 
                          name === 'yhat_lower' ? 'Lower Bound' : name
                        ]}
                      />
                      
                      {/* Confidence Interval Band */}
                      <Area
                        type="monotone"
                        dataKey="yhat_upper"
                        stroke="none"
                        fill="#475569"
                        fillOpacity={0.15}
                        name="Upper Bound"
                        connectNulls
                      />
                      <Area
                        type="monotone"
                        dataKey="yhat_lower"
                        stroke="none"
                        fill="#475569"
                        fillOpacity={0.15}
                        name="Lower Bound"
                        connectNulls
                      />
                      
                      {/* Historical Data */}
                      <Line 
                        type="monotone" 
                        dataKey="y" 
                        stroke="#10B981" 
                        strokeWidth={2.5} 
                        dot={false}
                        name="Actual"
                      />
                      
                      {/* Forecasted Line */}
                      <Line 
                        type="monotone" 
                        dataKey="yhat" 
                        stroke="#3B82F6" 
                        strokeWidth={2.5} 
                        strokeDasharray="5 5"
                        dot={false}
                        name="Prediction"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>

            {/* Model Methodology Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface-card border border-[#E5E7EB] rounded-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-accent-primary/10 rounded-lg">
                    <TrendingUp size={18} className="text-accent-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Model Methodology</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-[13px] text-text-secondary leading-relaxed font-light">
                    The MacroNode Prediction Engine utilizes <span className="font-semibold text-text-primary">Meta's Prophet Engine</span>, an additive model designed for forecasting time-series data where non-linear trends are fit with yearly, weekly, and daily seasonality.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-surface-page rounded-lg border border-[#F1F5F9]">
                      <h4 className="text-[11px] font-bold text-text-primary uppercase mb-1">Growth Trend</h4>
                      <p className="text-[11px] text-text-tertiary">Fits piecewise linear or logistic growth curves, automatically detecting "changepoints" in economic momentum.</p>
                    </div>
                    <div className="p-3 bg-surface-page rounded-lg border border-[#F1F5F9]">
                      <h4 className="text-[11px] font-bold text-text-primary uppercase mb-1">Seasonality</h4>
                      <p className="text-[11px] text-text-tertiary">Uses Fourier series to provide a partial-period fit to the yearly and quarterly economic cycles.</p>
                    </div>
                    <div className="p-3 bg-surface-page rounded-lg border border-[#F1F5F9]">
                      <h4 className="text-[11px] font-bold text-text-primary uppercase mb-1">Confidence Interval</h4>
                      <p className="text-[11px] text-text-tertiary">MAP estimation provides the uncertainty interval (yhat_upper/lower) based on historical variance.</p>
                    </div>
                    <div className="p-3 bg-surface-page rounded-lg border border-[#F1F5F9]">
                      <h4 className="text-[11px] font-bold text-text-primary uppercase mb-1">Holiday Effects</h4>
                      <p className="text-[11px] text-text-tertiary">Accounts for predictable shocks and outlier events (like COVID-19 or stimulus shifts).</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-accent-primary text-white rounded-card p-6 shadow-lg shadow-accent-primary/20 flex flex-col justify-center">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Institutional Outlook</h4>
                <div className="text-xl font-bold leading-tight">
                  High-fidelity trend projection with error-correction enabled.
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 text-[11px] opacity-70 italic">
                  *Prophet version 1.1.5 with Stan-backend optimization.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
