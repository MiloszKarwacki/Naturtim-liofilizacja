import { useState, useEffect } from 'react';

export interface Batch {
  id: number;
  batchNumber: string;
  availableWeight: number;
  product?: {
    id: number;
    name: string;
  };
}

export function useBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/workspace/frakcje/api/batches');
        
        if (!response.ok) {
          throw new Error('Problem z pobraniem partii');
        }

        const data = await response.json();
        setBatches(data);
        setError(null);
      } catch (err) {
        console.error('Błąd podczas pobierania partii:', err);
        setError('Nie udało się pobrać partii. Spróbuj odświeżyć stronę.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  return { batches, isLoading, error };
}