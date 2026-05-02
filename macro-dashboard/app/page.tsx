'use client';

import { useState, useMemo } from 'react';
import { useEconomicData } from '@/hooks/useEconomicData';
import {
  toYoY,
  toMonthlyChange,
  toQtrGrowth,
  resampleToMonthlyAvg,
  sliceByRange,
  latestDelta
} from '@/lib/transforms';
import { IndicatorTag } from '@/lib/types';
import KpiStrip from '@/components/KpiStrip';
import ChartCard from '@/components/ChartCard';
import CpiChart from '@/components/charts/CpiChart';
import PayrollChart from '@/components/charts/PayrollChart';
import UnemploymentChart from '@/components/charts/UnemploymentChart';
import GdpChart from '@/components/charts/GdpChart';
import YieldChart from '@/components/charts/YieldChart';
import SidePanel from '@/components/commentary/SidePanel';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Newspaper } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  // State
  const [showNews, setShowNews] = useState(false);
  const [timeframes, setTimeframes] = useState<Record<string, '1Y' | '5Y' | '10Y'>>({
    inflation: '5Y',
    payrolls: '5Y',
    unemployment: '5Y',
    gdp: '5Y',
    yields: '5Y',
  });

  // Fetch Data
  const cpi = useEconomicData('CPIAUCSL', 'fred');
  const payrolls = useEconomicData('PAYEMS', 'fred');
  const unemployment = useEconomicData('UNRATE', 'fred');
  const gdp = useEconomicData('A191RL1Q225SBEA', 'fred');
  const yields10y = useEconomicData('DGS10', 'fred');
  const yields2y = useEconomicData('DGS2', 'fred');

  // Transforms
  const cpiProcessed = useMemo(() => cpi.data ? toYoY(cpi.data) : [], [cpi.data]);
  const payrollsProcessed = useMemo(() => payrolls.data ? toMonthlyChange(payrolls.data) : [], [payrolls.data]);
  const unemploymentProcessed = useMemo(() => unemployment.data ? unemployment.data.map(o => ({ date: o.date, value: parseFloat(o.value) })) : [], [unemployment.data]);
  const gdpProcessed = useMemo(() => gdp.data ? toQtrGrowth(gdp.data) : [], [gdp.data]);
  const yields10yProcessed = useMemo(() => yields10y.data ? resampleToMonthlyAvg(yields10y.data) : [], [yields10y.data]);
  const yields2yProcessed = useMemo(() => yields2y.data ? resampleToMonthlyAvg(yields2y.data) : [], [yields2y.data]);

  // KPI Data
  const kpiItems = [
    { label: 'CPI YoY %', tag: 'Inflation' as IndicatorTag, data: latestDelta(cpiProcessed, 'M', 'down'), loading: cpi.loading },
    { label: 'Real GDP Growth %', tag: 'GDP' as IndicatorTag, data: latestDelta(gdpProcessed, 'Q', 'up'), loading: gdp.loading },
    { label: 'Unemployment Rate %', tag: 'Unemployment' as IndicatorTag, data: latestDelta(unemploymentProcessed, 'M', 'down'), loading: unemployment.loading },
    { label: '10Y Treasury Yield %', tag: 'Yields' as IndicatorTag, data: latestDelta(yields10yProcessed, 'M', 'neutral'), loading: yields10y.loading },
    { label: 'Nonfarm Payrolls (K)', tag: 'Payrolls' as IndicatorTag, data: latestDelta(payrollsProcessed, 'M', 'up'), loading: payrolls.loading, unit: 'K' },
  ];

  const handleTimeframeChange = (id: string, range: '1Y' | '5Y' | '10Y') => {
    setTimeframes(prev => ({ ...prev, [id]: range }));
  };

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
            <Link href="/" className="text-[13px] font-medium text-accent-primary border-b-2 border-accent-primary pb-1">Dashboard</Link>
            <Link href="/forecast" className="text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors pb-1">Forecasting</Link>
            <Link href="/calendar" className="text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors pb-1">Calendar</Link>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* News Toggle (Mobile Only) */}
          <button
            onClick={() => setShowNews(!showNews)}
            className="lg:hidden p-2 text-text-tertiary hover:text-accent-primary transition-colors"
          >
            <Newspaper size={20} />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <KpiStrip items={kpiItems} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ChartCard
              title="CPI Inflation"
              subtitle="Year-over-year % change in Consumer Price Index"
              timeframe={timeframes.inflation}
              onTimeframeChange={(r) => handleTimeframeChange('inflation', r)}
              loading={cpi.loading}
              error={cpi.error}
            >
              <CpiChart data={sliceByRange(cpiProcessed, timeframes.inflation)} />
            </ChartCard>

            <ChartCard
              title="Nonfarm Payrolls"
              subtitle="Monthly change in employment (K)"
              timeframe={timeframes.payrolls}
              onTimeframeChange={(r) => handleTimeframeChange('payrolls', r)}
              loading={payrolls.loading}
              error={payrolls.error}
            >
              <PayrollChart data={sliceByRange(payrollsProcessed, timeframes.payrolls)} />
            </ChartCard>

            <ChartCard
              title="Unemployment Rate"
              subtitle="Percentage of labor force unemployed"
              timeframe={timeframes.unemployment}
              onTimeframeChange={(r) => handleTimeframeChange('unemployment', r)}
              loading={unemployment.loading}
              error={unemployment.error}
            >
              <UnemploymentChart data={sliceByRange(unemploymentProcessed, timeframes.unemployment)} />
            </ChartCard>

            <ChartCard
              title="Real GDP Growth"
              subtitle="Quarterly annualized % change"
              timeframe={timeframes.gdp}
              onTimeframeChange={(r) => handleTimeframeChange('gdp', r)}
              loading={gdp.loading}
              error={gdp.error}
            >
              <GdpChart data={sliceByRange(gdpProcessed, timeframes.gdp)} />
            </ChartCard>

            <ChartCard
              title="Yield Curve (10Y vs 2Y)"
              subtitle="Treasury Constant Maturity Rates"
              timeframe={timeframes.yields}
              onTimeframeChange={(r) => handleTimeframeChange('yields', r)}
              loading={yields10y.loading || yields2y.loading}
              error={yields10y.error || yields2y.error}
            >
              <YieldChart
                data10Y={sliceByRange(yields10yProcessed, timeframes.yields)}
                data2Y={sliceByRange(yields2yProcessed, timeframes.yields)}
              />
            </ChartCard>
          </div>
        </div>

        {/* Side Panel (Desktop and Mobile Toggle) */}
        <div className={cn(
          "absolute lg:relative inset-y-0 right-0 z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          showNews ? "translate-x-0" : "translate-x-full"
        )}>
          <SidePanel
            isOpen={true}
            onClose={() => setShowNews(false)}
          />
        </div>

        {/* Backdrop for Mobile News */}
        {showNews && (
          <div
            className="absolute inset-0 bg-black/20 z-10 lg:hidden"
            onClick={() => setShowNews(false)}
          />
        )}
      </div>
    </main>
  );
}
