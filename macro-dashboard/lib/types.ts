export interface FredObservation {
  date: string;
  value: string;
}

export interface ChartPoint {
  date: string;
  value: number;
}

export interface KpiData {
  latest: number;
  delta: number;
  direction: 'up' | 'down' | 'flat';
}

export type IndicatorTag = 'Inflation' | 'GDP' | 'Unemployment' | 'Yields' | 'Payrolls' | 'General';

export interface Note {
  id: string;
  tag: IndicatorTag;
  title?: string;
  text: string;
  createdAt: string;
}
