import { useState, useEffect } from "react";

export function useGenerateBatchNumber() {
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchBatchNumber() {
    try {
      setLoading(true);
      const res = await fetch("/workspace/przyjecia-dostawy/api/generate-batch-number");
      if (!res.ok) throw new Error("Error fetching batch number");
      const data = await res.json();
      setBatchNumber(data.batchNumber);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBatchNumber();
  }, []);

  return { batchNumber, loading, error, refetch: fetchBatchNumber };
} 