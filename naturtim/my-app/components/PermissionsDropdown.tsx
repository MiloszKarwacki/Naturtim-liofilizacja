import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type Permission = {
  name: string;
  href: string;
};

export type PermissionsDropdownProps = {
  permissions: Permission[];
};

const PermissionsDropdown: React.FC<PermissionsDropdownProps> = ({
  permissions
}) => {
  const inlineThreshold = 3; // Wyświetlamy uprawnienia jako badge'y, jeśli ich liczba jest mniejsza lub równa 3

  if (permissions.length <= inlineThreshold) {
    return (
      <div className="flex flex-wrap gap-1">
        {permissions.map((permission, index) =>
          <span
            key={index}
            className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm"
          >
            {permission.name}
          </span>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {permissions.length} Permissions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-60 overflow-auto">
        {permissions.map((permission, index) =>
          <DropdownMenuItem key={index}>
            {permission.name}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PermissionsDropdown;
