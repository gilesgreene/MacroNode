'use client';

import { useState, useEffect } from 'react';
import { FredObservation } from '@/lib/types';

interface UseFredDataResult {
  data: FredObservation[] | null;
  loading: boolean;
  error: string | null;
}

export function useFredData(seriesId: string): UseFredDataResult {
  const [data, setData] = useState<FredObservation[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/fred?series_id=${seriesId}&observation_start=2000-01-01`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${seriesId}`);
        }

        const json = await response.json();
        setData(json.observations);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [seriesId]);

  return { data, loading, error };
}
