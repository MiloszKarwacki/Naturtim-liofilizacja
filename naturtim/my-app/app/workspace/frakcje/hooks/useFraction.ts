import { useState, useEffect } from 'react';

export interface Fraction {
  id: number;
  name: string;
  description?: string;
}

export function useFractions() {
  const [fractions, setFractions] = useState<Fraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFractions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/workspace/frakcje/api/fractions');
        
        if (!response.ok) {
          throw new Error('Problem z pobraniem frakcji');
        }

        const data = await response.json();
        setFractions(data);
        setError(null);
      } catch (err) {
        console.error('Błąd podczas pobierania frakcji:', err);
        setError('Nie udało się pobrać frakcji. Spróbuj odświeżyć stronę.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFractions();
  }, []);

  return { fractions, isLoading, error };
}