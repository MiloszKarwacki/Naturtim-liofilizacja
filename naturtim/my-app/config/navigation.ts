import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  ShoppingBasket,
  TruckIcon,
  Users,
  Warehouse,
  Store,
  Package,
  Settings,
  LineChart,
  Bell,
  BoxIcon,
  type LucideIcon
} from "lucide-react";

interface IconMapping {
  [key: string]: LucideIcon;
}

export const ICONS: IconMapping = {
  Dashboard: LayoutDashboard,
  Harmonogram: Calendar,
  "Kontrola Jakości": ClipboardCheck,
  "Obsługa Zamówień": ShoppingBasket,
  "Przyjęcia Dostawy": BoxIcon,
  Wykres: LineChart,
  Zdarzenia: Bell,
  Pracownicy: Users,
  Magazyny: Warehouse,
  Dostawcy: TruckIcon,
  Odbiorcy: Store,
  Produkty: Package,
  Zarządzanie: Settings
};

export const MANAGEMENT_MODULES = [
  'Pracownicy',
  'Magazyny',
  'Dostawcy',
  'Odbiorcy',
  'Produkty'
]; 