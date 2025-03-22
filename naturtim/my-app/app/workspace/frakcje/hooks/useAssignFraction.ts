import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface AssignFractionParams {
  batchId: number;
  fractionId: number;
  weight: number;
}

export function useAssignFraction() {
  const [isLoading, setIsLoading] = useState(false);

  const assignFraction = async (params: AssignFractionParams) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/frakcje/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Wystąpił błąd');
      }

      const data = await response.json();
      
      toast({
        title: "Sukces!",
        description: data.message || "Frakcja została przypisana do partii",
      });
      
      return data;
    } catch (error) {
      console.error('Błąd podczas przypisywania frakcji:', error);
      
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się przypisać frakcji",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { assignFraction, isLoading };
}