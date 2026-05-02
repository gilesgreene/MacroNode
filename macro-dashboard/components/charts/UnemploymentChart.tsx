'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartPoint } from '@/lib/types';
import { baseOptions } from '@/lib/chartConfig';
import '@/lib/chartConfig';

import { format, parseISO } from 'date-fns';

interface UnemploymentChartProps {
  data: ChartPoint[];
}

export default function UnemploymentChart({ data }: UnemploymentChartProps) {
  const chartData = {
    labels: data.map(d => format(parseISO(d.date), 'MMM yyyy')),
    datasets: [
      {
        label: 'Unemployment Rate',
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
        label: 'Full Employment Upper',
        data: data.map(() => 4.0),
        borderColor: 'transparent',
        backgroundColor: 'rgba(240, 253, 244, 0.5)',
        fill: '+1', // Fill to the next dataset
        pointRadius: 0,
        pointHoverRadius: 0,
        hitRadius: 0,
      },
      {
        label: 'Full Employment Lower',
        data: data.map(() => 3.5),
        borderColor: 'transparent',
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
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
