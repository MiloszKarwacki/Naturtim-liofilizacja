// Uproszczona wersja uprawnień do seedowania bez zależności od lucide-react
export const SEED_PERMISSIONS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    description: "Dostęp do panelu głównego aplikacji"
  },
  {
    name: "Harmonogram",
    href: "/schedule",
    description: "Zarządzanie harmonogramem produkcji"
  },
  {
    name: "Kontrola Jakości",
    href: "/quality-control",
    description: "Dostęp do modułu kontroli jakości"
  },
  {
    name: "Produkty",
    href: "/products",
    description: "Zarządzanie produktami w systemie"
  },
  {
    name: "Dostawcy",
    href: "/suppliers",
    description: "Zarządzanie dostawcami"
  },
  {
    name: "Odbiorcy",
    href: "/recipients",
    description: "Zarządzanie odbiorcami produktów"
  },
  {
    name: "Maszyny",
    href: "/machines",
    description: "Zarządzanie maszynami produkcyjnymi"
  },
  {
    name: "Użytkownicy",
    href: "/users",
    description: "Zarządzanie użytkownikami systemu"
  },
  {
    name: "Magazyn",
    href: "/inventory",
    description: "Zarządzanie stanami magazynowymi"
  },
  {
    name: "Raporty",
    href: "/reports",
    description: "Generowanie raportów z produkcji"
  }
];