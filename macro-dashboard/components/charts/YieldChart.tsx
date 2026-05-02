'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartPoint } from '@/lib/types';
import { baseOptions } from '@/lib/chartConfig';
import '@/lib/chartConfig';

import { format, parseISO } from 'date-fns';

interface YieldChartProps {
  data10Y: ChartPoint[];
  data2Y: ChartPoint[];
}

export default function YieldChart({ data10Y, data2Y }: YieldChartProps) {
  // Align data dates
  const labels = data10Y.map(d => format(parseISO(d.date), 'MMM yyyy'));
  
  const chartData = {
    labels,
    datasets: [
      {
        label: '10Y Treasury',
        data: data10Y.map(d => d.value),
        borderColor: '#185FA5',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        hitRadius: 10,
        fill: false,
        tension: 0.1,
      },
      {
        label: '2Y Treasury',
        data: data2Y.map(d => {
          const match = data2Y.find(d2 => d2.date === d.date);
          return match ? match.value : null;
        }),
        borderColor: '#185FA5',
        borderDash: [4, 3],
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        hitRadius: 10,
        fill: false,
        tension: 0.1,
      }
    ],
  };

  const options = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        ticks: {
          ...baseOptions.scales.y.ticks,
          callback: (value: any) => `${Number(value).toFixed(1)}%`,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
