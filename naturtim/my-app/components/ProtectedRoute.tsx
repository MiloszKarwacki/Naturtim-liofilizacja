"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/auth/hooks/useAuth";

// Mapa ścieżek i wymaganych uprawnień
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/workspace/dashboard": ["view_dashboard"],
  "/workspace/harmonogram": ["view_schedule"],
  "/workspace/wykres": ["view_charts"],
  // Dodaj więcej ścieżek według potrzeb
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, hasPermission, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Jeśli użytkownik nie jest zalogowany, przekieruj do strony głównej (logowanie)
    if (!user) {
      router.push("/");
      return;
    }

    // Sprawdź czy ścieżka wymaga specjalnych uprawnień
    const requiredPermissions = ROUTE_PERMISSIONS[pathname];
    
    if (requiredPermissions) {
      // Sprawdź czy użytkownik ma wszystkie wymagane uprawnienia
      const hasAccess = requiredPermissions.every(perm => hasPermission(perm));
      
      if (!hasAccess) {
        // Brak uprawnień - wyloguj i pokaż alert
        logout();
        alert("Brak dostępu do tej strony. Zostałeś wylogowany.");
      }
    }
  }, [pathname, user, hasPermission, logout, router]);

  // Zamiast renderować null, renderuj pusty div
  if (!user) {
    return <div className="hidden" aria-hidden="true"></div>;
  }

  return <>{children}</>;
} 