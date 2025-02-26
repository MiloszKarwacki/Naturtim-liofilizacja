import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginUser = async (login: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (res.ok) {
        router.push("/workspace");
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch (error) {
      console.error("Błąd logowania:", error);
      setError("Wystąpił błąd serwera");
    } finally {
      setLoading(false);
    }
  };

  return { loginUser, error, loading };
} 