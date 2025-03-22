import { useMemo } from "react";

export function useGeneratedLogin(
  firstName: string,
  lastName: string,
  existingEmployees: { login: string }[]
): string {
  return useMemo(() => {
    // Usuwamy ewentualne spacje i pobieramy pierwsze 3 litery imienia i nazwiska
    const firstPart = firstName.trim().substring(0, 3).toLowerCase();
    const secondPart = lastName.trim().substring(0, 3).toLowerCase();
    const baseLogin = firstPart + secondPart;
    // Sprawdzamy, czy taki login już istnieje w przekazanej liście użytkowników
    const exists = existingEmployees.some(emp => emp.login === baseLogin);
    return exists ? baseLogin + "1" : baseLogin;
  }, [firstName, lastName, existingEmployees]);
} 