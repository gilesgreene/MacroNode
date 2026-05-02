'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartPoint } from '@/lib/types';
import { baseOptions } from '@/lib/chartConfig';
import '@/lib/chartConfig'; // Ensure registration

import { format, parseISO } from 'date-fns';

interface CpiChartProps {
  data: ChartPoint[];
}

export default function CpiChart({ data }: CpiChartProps) {
  const chartData = {
    labels: data.map(d => format(parseISO(d.date), 'MMM yyyy')),
    datasets: [
      {
        data: data.map(d => d.value),
        borderColor: '#185FA5',
        backgroundColor: 'rgba(24, 95, 165, 0.07)',
        fill: true,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        hitRadius: 10,
        tension: 0.1,
      },
      {
        label: 'Target',
        data: data.map(() => 2),
        borderColor: '#9CA3AF',
        borderDash: [4, 3],
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        hitRadius: 0,
        fill: false,
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
