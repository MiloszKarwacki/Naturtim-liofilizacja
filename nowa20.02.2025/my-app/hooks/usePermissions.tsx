import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Permission } from "@prisma/client"; // Importujemy typ bezpośrednio z Prisma

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobieramy wszystkie dostępne uprawnienia z API
  const fetchAllPermissions = async () => {
    try {
      const response = await fetch("/api/permissions/all");
      if (!response.ok) {
        throw new Error("Nie udało się pobrać uprawnień");
      }
      const data = await response.json();
      return data.permissions;
    } catch (error) {
      console.error("Błąd przy pobieraniu wszystkich uprawnień:", error);
      throw error;
    }
  };

  // Pobieramy uprawnienia użytkownika
  useEffect(
    () => {
      const fetchPermissions = async () => {
        setIsLoading(true);
        try {
          // Jeśli mamy zalogowanego użytkownika, używamy uprawnień z obiektu użytkownika
          if (user && user.permissions) {
            setPermissions(user.permissions as Permission[]);
          } else {
            // W przeciwnym razie pobieramy z endpointu (dla kompatybilności wstecznej)
            const response = await fetch("/api/permissions");
            if (!response.ok) {
              throw new Error("Nie udało się pobrać uprawnień");
            }
            const data = await response.json();
            setPermissions(data.permissions);
          }
        } catch (err) {
          console.error("Błąd przy pobieraniu uprawnień:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Wystąpił błąd podczas pobierania uprawnień"
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchPermissions();
    },
    [user]
  );

  return { permissions, isLoading, error, fetchAllPermissions };
}
