import { NextRequest, NextResponse } from "next/server";
import { MiddlewareService } from "./app/auth/services/middlewareService";

export function middleware(request: NextRequest) {
  return MiddlewareService.handleRequest(request);
}

// Ustaw na jakich ścieżkach ma działać middleware
export const config = {
  matcher: ["/workspace/:path*", "/auth/access-denied"],
}; 