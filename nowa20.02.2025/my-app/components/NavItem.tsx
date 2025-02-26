"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getPermissionIcon } from "@/config/permissions";

interface Permission {
  id: number;
  name: string;
  href: string;
}

interface NavItemProps {
  item: Permission;
  className?: string;
}

export function NavItem({ item, className }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const IconComponent = getPermissionIcon(item.name);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center px-4 py-2 rounded-lg transition-colors",
        isActive ? "bg-green-100 text-green-900" : "hover:bg-gray-200",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <IconComponent className="w-5 h-5" />
        <span>
          {item.name}
        </span>
      </div>
    </Link>
  );
}
