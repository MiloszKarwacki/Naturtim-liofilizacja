"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const { logout } = useAuth();
  const router = useRouter();

  // Funkcja do wylogowania
  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center p-8 rounded-lg bg-white shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Brak dostępu</h1>
        <p className="mb-6">Nie posiadasz uprawnień do oglądania tej strony.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            Wyloguj się
          </Button>
        </div>
      </div>
    </div>
  );
}
