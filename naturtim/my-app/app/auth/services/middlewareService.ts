import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { getRoutePermissionsMap } from "@/config/permissions";
import { AuthUser } from "../types/auth";

// Mapa ścieżek i wymaganych uprawnień generowana automatycznie
const ROUTE_PERMISSIONS: Record<string, string[]> = getRoutePermissionsMap();

export const MiddlewareService = {
  handleRequest(request: NextRequest): NextResponse {
    // Pobierz token z ciastka lub nagłówka
    const token = request.cookies.get("auth_token")?.value || 
                  request.headers.get("Authorization")?.split(" ")[1];
    
    // Jeśli jesteśmy na stronie głównej (logowanie), przepuść request
    if (request.nextUrl.pathname === "/") {
      return NextResponse.next();
    }
    
    // Sprawdź czy token istnieje
    if (!token) {
      // Brak tokenu, przekieruj do logowania (strona główna)
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    try {
      // Dekoduj token aby pobrać uprawnienia
      const decoded = jwtDecode<AuthUser>(token);
      
      // Sprawdź czy ścieżka wymaga uprawnień
      const pathname = request.nextUrl.pathname;
      const requiredPermissions = ROUTE_PERMISSIONS[pathname];
      
      // Jeśli ścieżka nie wymaga specjalnych uprawnień, przepuść
      if (!requiredPermissions) {
        return NextResponse.next();
      }
      
      // Sprawdź czy użytkownik ma wymagane uprawnienia
      const hasAccess = requiredPermissions.every(
        perm => decoded.permissions.includes(perm)
      );
      
      if (!hasAccess) {
        // Brak uprawnień - przekieruj do nowej ścieżki access-denied
        return NextResponse.redirect(new URL("/auth/access-denied", request.url));
      }
      
      // Użytkownik ma uprawnienia - przepuść request
      return NextResponse.next();
      
    } catch (error) {
      // Błąd dekodowania tokenu - przekieruj do logowania (strona główna)
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}; 