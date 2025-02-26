"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { NavItem } from "@/components/NavItem";
import { getPermissionByName, getPermissionIcon } from "@/config/permissions";
import { Settings } from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const { permissions, isLoading, error } = usePermissions();
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  // Filtruj uprawnienia przy pomocy scentralizowanej konfiguracji
  const mainPermissions = permissions.filter(p => {
    const config = getPermissionByName(p.name);
    return config && !config.isManagement;
  });

  const managementPermissions = permissions.filter(p => {
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

  return (
    <aside className="h-full p-4 flex flex-col justify-between bg-gray-100">
      <div>
        <div className="mb-8 flex justify-center">
          <img
            src="https://naturtim.pl/wp-content/uploads/2024/04/logotyp_naturtim.svg"
            alt="Logo"
            className="w-auto h-12"
          />
        </div>
        <nav className="flex flex-col space-y-2">
          {/* Główne moduły */}
          {mainPermissions.map(item => <NavItem key={item.id} item={item} />)}

          {/* Sekcja zarządzania */}
          {managementPermissions.length > 0 &&
            <Collapsible
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
                  <NavItem key={item.id} item={item} className="ml-4" />
                )}
              </CollapsibleContent>
            </Collapsible>}
        </nav>
      </div>
      <Button
        variant="destructive"
        onClick={() => {
          fetch("/api/auth", { method: "DELETE" }).then(() => router.push("/"));
        }}
        className="w-full"
      >
        Wyloguj się
      </Button>
    </aside>
  );
}
