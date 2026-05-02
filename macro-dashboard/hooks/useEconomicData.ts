'use client';

import { useState, useEffect } from 'react';
import { FredObservation } from '@/lib/types';

interface UseEconomicDataResult {
  data: FredObservation[] | null;
  loading: boolean;
  error: string | null;
}

export function useEconomicData(seriesId: string, source: 'fred' | 'bls' = 'fred'): UseEconomicDataResult {
  const [data, setData] = useState<FredObservation[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const endpoint = source === 'bls' ? '/api/bls' : '/api/fred';
        const url = source === 'fred' 
          ? `${endpoint}?series_id=${seriesId}&observation_start=2000-01-01`
          : `${endpoint}?series_id=${seriesId}`;
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${seriesId} from ${source}`);
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
  }, [seriesId, source]);

  return { data, loading, error };
}
