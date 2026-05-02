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
import { format, parseISO } from 'date-fns';
import { Brain, ArrowLeft, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    { id: 'PAYEMS', name: 'Nonfarm Payrolls' },
    { id: 'UNRATE', name: 'Unemployment Rate' },
    { id: 'A191RL1Q225SBEA', name: 'Real GDP Growth' },
  ];

  return (
    <div className="flex flex-col h-screen bg-surface-page overflow-hidden font-sans">
      {/* Unified Nav Bar (Same as Home) */}
      <nav className="h-12 bg-surface-nav border-b border-[#E5E7EB] flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Image src="/macronode_favicon.svg" alt="MacroNode" width={24} height={24} />
            <h1 className="text-brand text-text-primary tracking-tight">MacroNode Dashboard</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/" className="text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors pb-1">Dashboard</Link>
            <Link href="/forecast" className="text-[13px] font-medium text-accent-primary border-b-2 border-accent-primary pb-1">Forecasting</Link>
          </nav>
        </div>
        <div className="text-[10px] text-text-tertiary font-medium uppercase tracking-[0.2em]">
          Institutional Grade Engine
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Sub-header with Selection */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-tight flex items-center gap-2 text-text-primary">
                <Brain className="text-accent-primary" size={22} />
                Economic Forecasting
              </h2>
              <p className="text-text-tertiary text-xs">AI-driven predictive analysis for macro trends</p>
            </div>

            <select 
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              className="bg-surface-card border border-[#E5E7EB] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary shadow-sm"
            >
              {seriesOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          {/* Chart Section */}
          <div className="bg-surface-card border border-[#E5E7EB] rounded-card p-6 h-[480px] relative shadow-sm outline-none" tabIndex={-1}>
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-accent-primary" size={28} />
                <p className="text-text-tertiary text-xs animate-pulse font-medium">Training Prophet Model...</p>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-semantic-negative p-8 text-center">
                <AlertCircle size={28} />
                <p className="text-sm font-medium">{error}</p>
                <button 
                  onClick={() => fetchForecast(seriesId)}
                  className="mt-2 px-4 py-1.5 bg-surface-page border border-[#E5E7EB] hover:bg-surface-hover rounded-lg text-xs transition-colors"
                >
                  Retry Forecast
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis 
                    dataKey="ds" 
                    tickFormatter={(str) => format(parseISO(str), 'MMM yy')}
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      if (seriesId === 'PAYEMS') return val.toLocaleString();
                      return `${val.toFixed(1)}%`;
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ padding: '2px 0' }}
                    labelFormatter={(label) => format(parseISO(label as string), 'MMMM d, yyyy')}
                  />
                  <Area
                    type="monotone"
                    dataKey="yhat_upper"
                    stroke="none"
                    fill="#185FA5"
                    fillOpacity={0.05}
                  />
                  <Area
                    type="monotone"
                    dataKey="yhat_lower"
                    stroke="none"
                    fill="#185FA5"
                    fillOpacity={0.05}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="yhat" 
                    stroke="#185FA5" 
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Prophet Forecast"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="y" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={false}
                    name="Historical Data"
                  />
                  <ReferenceLine x={data[data.length - 13]?.ds} stroke="#94A3B8" strokeDasharray="3 3" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-surface-card border border-[#E5E7EB] rounded-card p-6 space-y-4 shadow-sm">
              <h3 className="text-section text-text-primary flex items-center gap-2 uppercase tracking-wider">
                <Brain size={16} className="text-accent-primary" />
                AI Economic Reasoning
              </h3>
              {reasoningLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 bg-surface-page rounded w-full" />
                  <div className="h-3 bg-surface-page rounded w-5/6" />
                  <div className="h-3 bg-surface-page rounded w-4/6" />
                </div>
              ) : (
                <p className="text-sm text-text-secondary leading-relaxed font-light">
                  {reasoning}
                </p>
              )}
            </div>

            <div className="bg-surface-card border border-[#E5E7EB] rounded-card p-6 flex flex-col justify-between shadow-sm">
              <h3 className="text-section text-text-primary flex items-center gap-2 uppercase tracking-wider">
                <TrendingUp size={16} className="text-semantic-positive" />
                Model Confidence
              </h3>
              <div className="space-y-4 pt-4">
                <div>
                  <div className="flex justify-between text-[11px] mb-2 font-medium">
                    <span className="text-text-tertiary">Historical Accuracy</span>
                    <span className="text-semantic-positive">{accuracy ?? '--'}%</span>
                  </div>
                  <div className="w-full bg-surface-page rounded-full h-1">
                    <div 
                      className="bg-semantic-positive h-1 rounded-full transition-all duration-1000" 
                      style={{ width: `${accuracy ?? 0}%` }} 
                    />
                  </div>
                </div>
                <p className="text-[10px] text-text-tertiary leading-relaxed italic">
                  Accuracy based on historical Mean Absolute Percentage Error (MAPE). Future predictions subject to macro volatility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
