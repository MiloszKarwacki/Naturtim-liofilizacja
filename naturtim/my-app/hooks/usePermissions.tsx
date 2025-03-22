import { useState, useEffect } from "react";
import { useAuth } from "@/app/auth/hooks/useAuth";
import { Permission } from "@prisma/client"; // Importujemy typ bezpośrednio z Prisma

export function usePermissions() {
  const { user } = useAuth(); // Dodajemy isAuthenticated jeśli istnieje
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobieramy uprawnienia użytkownika
  useEffect(
    () => {
      const fetchPermissions = async () => {
        // Jeśli użytkownik nie jest zalogowany, zwracamy puste uprawnienia
        if (!user) {
          setPermissions([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        try {
          // Jeśli mamy zalogowanego użytkownika, używamy uprawnień z obiektu użytkownika
          if (user && user.permissions) {
            setPermissions(user.permissions as Permission[]);
          } else {
            // W przeciwnym razie pobieramy z endpointu (dla kompatybilności wstecznej)
            const response = await fetch("/api/permissions");

            // Jeśli status to 401 (brak autoryzacji), zwracamy puste uprawnienia bez błędu
            if (response.status === 401) {
              setPermissions([]);
              setError(null);
              return;
            }

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

  return { permissions, isLoading, error };
}
