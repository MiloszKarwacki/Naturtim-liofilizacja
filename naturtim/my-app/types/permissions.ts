import { LucideIcon } from "lucide-react";

// Interfejs Permission używany przez Prisma/bazę danych
export interface Permission {
  id: number;
  name: string;
  href: string;
  description: string;
}

// Konfiguracja uprawnień używana w UI i logice aplikacji
export interface PermissionConfig {
  name: string;         // Nazwa uprawnienia widoczna w UI
  href: string;         // Ścieżka URL
  description: string;  // Opis uprawnienia
  icon: LucideIcon;     // Ikona z Lucide
  isManagement?: boolean; // Czy to uprawnienie do zarządzania?
} 