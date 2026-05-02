'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartPoint } from '@/lib/types';
import { baseOptions } from '@/lib/chartConfig';
import '@/lib/chartConfig';

import { format, parseISO } from 'date-fns';

interface GdpChartProps {
  data: ChartPoint[];
}

export default function GdpChart({ data }: GdpChartProps) {
  const chartData = {
    labels: data.map(d => format(parseISO(d.date), 'MMM yyyy')),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: data.map(d => d.value >= 0 ? '#1D9E75' : '#E24B4A'),
        borderRadius: 2,
      },
    ],
  };

  const options = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      x: {
        ...baseOptions.scales.x,
        ticks: {
          ...baseOptions.scales.x.ticks,
          maxTicksLimit: 16,
        }
      },
      y: {
        ...baseOptions.scales.y,
        ticks: {
          ...baseOptions.scales.y.ticks,
          callback: (value: any) => `${Number(value).toFixed(1)}%`,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
