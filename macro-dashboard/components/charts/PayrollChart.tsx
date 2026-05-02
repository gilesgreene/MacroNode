'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartPoint } from '@/lib/types';
import { baseOptions } from '@/lib/chartConfig';
import '@/lib/chartConfig';

import { format, parseISO } from 'date-fns';

interface PayrollChartProps {
  data: ChartPoint[];
}

export default function PayrollChart({ data }: PayrollChartProps) {
  const chartData = {
    labels: data.map(d => format(parseISO(d.date), 'MMM yyyy')),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: '#185FA5',
        borderRadius: 2,
      },
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
          callback: (value: any) => `${value}K`,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
