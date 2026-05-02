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
import ReportModal from '@/components/commentary/ReportModal';
import { useNotes } from '@/hooks/useNotes';
import { MessageSquare } from 'lucide-react';
import { Note } from '@/lib/types';

export default function Dashboard() {
  // State
  const [selectedTag, setSelectedTag] = useState<IndicatorTag | null>(null);
  const [activeReport, setActiveReport] = useState<Note | null>(null);
  const [timeframes, setTimeframes] = useState<Record<string, '1Y' | '5Y' | '10Y'>>({
    inflation: '5Y',
    payrolls: '5Y',
    unemployment: '5Y',
    gdp: '5Y',
    yields: '5Y',
  });

  // Notes Hook
  const { notes, addNote, deleteNote } = useNotes();

  // Fetch Data
  const cpi = useEconomicData('CPIAUCSL', 'fred');
  const payrolls = useEconomicData('CES0000000001', 'bls');
  const unemployment = useEconomicData('LNS14000000', 'bls');
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
    { 
      label: 'CPI YoY %', 
      tag: 'Inflation' as IndicatorTag, 
      data: latestDelta(cpiProcessed, 'M', 'down'), 
      loading: cpi.loading 
    },
    { 
      label: 'Real GDP Growth %', 
      tag: 'GDP' as IndicatorTag, 
      data: latestDelta(gdpProcessed, 'Q', 'up'), 
      loading: gdp.loading 
    },
    { 
      label: 'Unemployment Rate %', 
      tag: 'Unemployment' as IndicatorTag, 
      data: latestDelta(unemploymentProcessed, 'M', 'down'), 
      loading: unemployment.loading 
    },
    { 
      label: '10Y Treasury Yield %', 
      tag: 'Yields' as IndicatorTag, 
      data: latestDelta(yields10yProcessed, 'M', 'neutral'), 
      loading: yields10y.loading 
    },
    { 
      label: 'Nonfarm Payrolls (K)', 
      tag: 'Payrolls' as IndicatorTag, 
      data: latestDelta(payrollsProcessed, 'M', 'up'), 
      loading: payrolls.loading,
      unit: 'K'
    },
  ];

  const handleSelectTag = (tag: IndicatorTag) => {
    setSelectedTag(tag);
  };

  const handleTimeframeChange = (id: string, range: '1Y' | '5Y' | '10Y') => {
    setTimeframes(prev => ({ ...prev, [id]: range }));
  };

  return (
    <main className="flex flex-col h-screen bg-surface-page overflow-hidden">
      {/* Nav */}
      <nav className="h-12 bg-surface-nav border-b border-[#E5E7EB] flex items-center justify-between px-4 shrink-0 z-10">
        <h1 className="text-brand text-text-primary">MacroNode Dashboard</h1>
        <div className="text-[10px] text-text-tertiary font-medium uppercase tracking-widest">
          Live Analysis Engine
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <KpiStrip 
            items={kpiItems} 
            selectedTag={selectedTag} 
            onSelectTag={handleSelectTag} 
          />

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
              subtitle="Monthly change in total nonfarm employment (thousands)"
              timeframe={timeframes.payrolls}
              onTimeframeChange={(r) => handleTimeframeChange('payrolls', r)}
              loading={payrolls.loading}
              error={payrolls.error}
            >
              <PayrollChart data={sliceByRange(payrollsProcessed, timeframes.payrolls)} />
            </ChartCard>

            <ChartCard 
              title="Unemployment Rate" 
              subtitle="Percentage of the labor force that is unemployed"
              timeframe={timeframes.unemployment}
              onTimeframeChange={(r) => handleTimeframeChange('unemployment', r)}
              loading={unemployment.loading}
              error={unemployment.error}
            >
              <UnemploymentChart data={sliceByRange(unemploymentProcessed, timeframes.unemployment)} />
            </ChartCard>

            <ChartCard 
              title="Real GDP Growth" 
              subtitle="Quarterly annualized % change in Real GDP"
              timeframe={timeframes.gdp}
              onTimeframeChange={(r) => handleTimeframeChange('gdp', r)}
              loading={gdp.loading}
              error={gdp.error}
            >
              <GdpChart data={sliceByRange(gdpProcessed, timeframes.gdp)} />
            </ChartCard>

            <ChartCard 
              title="Yield Curve (10Y vs 2Y)" 
              subtitle="10-Year and 2-Year Treasury Constant Maturity Rates"
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

        {/* Side Panel */}
        <SidePanel 
          isOpen={true} 
          onClose={() => {}}
          notes={notes}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
          onNoteClick={(note) => setActiveReport(note)}
          selectedTag={selectedTag}
        />
      </div>

      {/* Report View Modal */}
      <ReportModal 
        report={activeReport} 
        onClose={() => setActiveReport(null)} 
      />
    </main>
  );
}
