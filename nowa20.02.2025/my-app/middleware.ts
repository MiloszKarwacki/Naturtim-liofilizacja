import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { getRoutePermissionsMap } from "@/config/permissions";


// Mapa ścieżek i wymaganych uprawnień generowana automatycznie
const ROUTE_PERMISSIONS: Record<string, string[]> = getRoutePermissionsMap();

export function middleware(request: NextRequest) {
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
    const decoded = jwtDecode<{permissions: string[]}>(token);
    
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
      // Brak uprawnień - przekieruj do strony z błędem dostępu
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
    
    // Użytkownik ma uprawnienia - przepuść request
    return NextResponse.next();
    
  } catch (error) {
    // Błąd dekodowania tokenu - przekieruj do logowania (strona główna)
    return NextResponse.redirect(new URL("/", request.url));
  }
}

// Ustaw na jakich ścieżkach ma działać middleware
export const config = {
  matcher: ["/workspace/:path*", "/access-denied"],
}; 