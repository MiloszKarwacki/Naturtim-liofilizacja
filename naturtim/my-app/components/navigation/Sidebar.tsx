"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { useAuth } from "@/app/auth/hooks/useAuth";
import { NavItem } from "@/components/navigation/NavItem";
import { getPermissionByName } from "@/config/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  const router = useRouter();
  const { logout } = useAuth();
  const { permissions, isLoading, error } = usePermissions();
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  // Deduplikacja uprawnień używając unikalnej kombinacji nazwy i href
  const uniquePermissionsMap = new Map();

  permissions.forEach(p => {
    const uniqueKey = `${p.name}-${p.href}`;
    if (!uniquePermissionsMap.has(uniqueKey)) {
      uniquePermissionsMap.set(uniqueKey, p);
    }
  });

  const uniquePermissions = Array.from(uniquePermissionsMap.values());

  // Filtruj uprawnienia przy pomocy scentralizowanej konfiguracji
  const mainPermissions = uniquePermissions.filter(p => {
    const config = getPermissionByName(p.name);
    return config && !config.isManagement;
  });

  const managementPermissions = uniquePermissions.filter(p => {
    const config = getPermissionByName(p.name);
    return config && config.isManagement;
  });

  if (isLoading) {
    return <div className="p-4">Ładowanie menu...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Błąd: {error}
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="h-full p-4 flex flex-col justify-between bg-gray-100">
      <div>
        <div className="mb-8 flex justify-center">
          <Link href="/workspace">
            <Image
              src="https://naturtim.pl/wp-content/uploads/2024/04/logotyp_naturtim.svg"
              alt="Logo"
              className="w-auto h-12"
              width={100}
              height={100}
            />
          </Link>
        </div>
        <nav className="flex flex-col space-y-2">
          {/* Główne moduły */}
          {mainPermissions.map(item =>
            <NavItem key={`main-${item.name}-${item.href}`} item={item} />
          )}

          {/* Sekcja zarządzania */}
          {managementPermissions.length > 0
            ? <Collapsible
                open={isManagementOpen}
                onOpenChange={setIsManagementOpen}
                className="space-y-2"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5">
                      <Settings className="w-5 h-5" />
                    </div>
                    <span>Zarządzanie</span>
                  </div>
                  {isManagementOpen
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  {managementPermissions.map(item =>
                    <NavItem
                      key={`management-${item.name}-${item.href}`}
                      item={item}
                      className="ml-4"
                    />
                  )}
                </CollapsibleContent>
              </Collapsible>
            : null}
        </nav>
      </div>
      <Button variant="destructive" onClick={handleLogout} className="w-full">
        Wyloguj się
      </Button>
    </aside>
  );
}
