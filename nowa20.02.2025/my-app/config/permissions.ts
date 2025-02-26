import { 
  LayoutDashboard, Calendar, ClipboardCheck, ShoppingBasket, 
  TruckIcon, Users, Warehouse, Store, Package, LineChart, 
  Bell, BoxIcon, Settings, MessageSquareText, LucideIcon 
} from "lucide-react";

export interface PermissionConfig {
  name: string;         // Nazwa uprawnienia widoczna w UI (np. "AI Chat")
  href: string;         // Ścieżka URL (np. "/workspace/ai-chat")
  description: string;  // Opis uprawnienia
  icon: LucideIcon;     // Ikona z Lucide
  isManagement?: boolean; // Czy to uprawnienie do zarządzania?
}

// Centralne źródło prawdy dla wszystkich uprawnień w aplikacji
export const APP_PERMISSIONS: PermissionConfig[] = [
  {
    name: "Dashboard",
    href: "/workspace/dashboard",
    description: "Dostęp do panelu głównego",
    icon: LayoutDashboard
  },
  {
    name: "Harmonogram",
    href: "/workspace/harmonogram",
    description: "Dostęp do modułu Harmonogram",
    icon: Calendar
  },
  {
    name: "Kontrola Jakości",
    href: "/workspace/kontrola-jakosci",
    description: "Dostęp do modułu Kontrola Jakości",
    icon: ClipboardCheck
  },
  {
    name: "Obsluga Zamowien",
    href: "/workspace/obsluz-zamowienia",
    description: "Dostęp do modułu Obsluga Zamowien",
    icon: ShoppingBasket
  },
  {
    name: "Przyjecia Dostawy",
    href: "/workspace/przyjecia-dostawy",
    description: "Dostęp do modułu Przyjecia Dostawy",
    icon: BoxIcon
  },
  {
    name: "Wykres",
    href: "/workspace/wykres",
    description: "Dostęp do modułu Wykres",
    icon: LineChart
  },
  {
    name: "Zdarzenia",
    href: "/workspace/zdarzenia",
    description: "Dostęp do modułu Zdarzenia",
    icon: Bell
  },
  // Moduły zarządzania
  {
    name: "Pracownicy",
    href: "/workspace/pracownicy",
    description: "Dostęp do modułu Pracownicy",
    icon: Users,
    isManagement: true
  },
  {
    name: "Magazyny",
    href: "/workspace/magazyny",
    description: "Dostęp do modułu Magazyny",
    icon: Warehouse,
    isManagement: true
  },
  {
    name: "Dostawcy",
    href: "/workspace/dostawcy",
    description: "Dostęp do modułu Dostawcy",
    icon: TruckIcon,
    isManagement: true
  },
  {
    name: "Odbiorcy",
    href: "/workspace/odbiorcy",
    description: "Dostęp do modułu Odbiorcy",
    icon: Store,
    isManagement: true
  },
  {
    name: "Produkty",
    href: "/workspace/produkty",
    description: "Dostęp do modułu Produkty",
    icon: Package,
    isManagement: true
  },
  {
    name: "Frakcje",
    href: "/workspace/frakcje",
    description: "Dostęp do modułu Frakcje",
    icon: Package,
    isManagement: true
  },
];

// Pomocnicze funkcje
export const getPermissionByName = (name: string): PermissionConfig | undefined => 
  APP_PERMISSIONS.find(p => p.name === name);

export const getPermissionByPath = (path: string): PermissionConfig | undefined => 
  APP_PERMISSIONS.find(p => p.href === path);

export const getPermissionIcon = (name: string): LucideIcon => 
  getPermissionByName(name)?.icon || Settings;

// Zwraca tylko nazwy uprawnień do użycia w middleware
export const getPermissionNames = (): string[] => 
  APP_PERMISSIONS.map(p => p.name);

// Zwraca mapę ścieżka -> uprawnienie do użycia w middleware
export const getRoutePermissionsMap = (): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  APP_PERMISSIONS.forEach(permission => {
    map[permission.href] = [permission.name];
  });
  return map;
};

// Zwraca listę uprawnień zarządzania
export const getManagementPermissions = (): PermissionConfig[] => 
  APP_PERMISSIONS.filter(p => p.isManagement);

// Zwraca listę głównych uprawnień (nie zarządzania)
export const getMainPermissions = (): PermissionConfig[] => 
  APP_PERMISSIONS.filter(p => !p.isManagement); 