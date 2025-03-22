// Stałe konfiguracyjne aplikacji

// Klucz do podpisywania tokenów JWT
export const JWT_SECRET = process.env.JWT_SECRET || "super-tajny-klucz-jwt";

// UWAGA: Fallback "super-tajny-klucz-jwt" powinien być używany TYLKO w developmencie!
// W produkcji możemy dodać dodatkowe zabezpieczenie:
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠️ UWAGA: Brak zdefiniowanego JWT_SECRET w zmiennych środowiskowych! To poważne zagrożenie bezpieczeństwa!');
} 