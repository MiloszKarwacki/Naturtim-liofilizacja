import { useState } from "react";

export function useDelivery() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function createDelivery(deliveryData: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/workspace/przyjecia-dostawy/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deliveryData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create delivery");
      }
      const data = await res.json();
      return data.delivery;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { createDelivery, loading, error };
} 