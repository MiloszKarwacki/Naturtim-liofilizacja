"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Snowflake, PackageCheck, Package, Boxes } from "lucide-react";

const MagazynyPage = () => {
  const router = useRouter();

  const warehouses = [
    {
      name: "Magazyn Mroźnia",
      description: "Przechowuje mrożone produkty.",
      path: "/workspace/magazyny/mroznia",
      icon: <Snowflake size={60} className="text-blue-500" />,
      bgColor: "bg-blue-100"
    },
    {
      name: "Magazyn Półfabrykatu",
      description: "Przechowuje półfabrykaty.",
      path: "/workspace/magazyny/polfabrykat",
      icon: <PackageCheck size={60} className="text-green-500" />,
      bgColor: "bg-green-100"
    },
    {
      name: "Magazyn Gotowego Produktu",
      description: "Przechowuje gotowe produkty.",
      path: "/workspace/magazyny/gotowy-produkt",
      icon: <Package size={60} className="text-orange-500" />,
      bgColor: "bg-orange-100"
    },
    {
      name: "Magazyn Kartonów",
      description: "Przechowuje kartony i opakowania.",
      path: "/workspace/magazyny/kartony",
      icon: <Boxes size={60} className="text-brown-500" />,
      bgColor: "bg-stone-200"
    }
  ];

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-100">
      {warehouses.map((warehouse, index) =>
        <Card
          key={index}
          onClick={() => router.push(warehouse.path)}
          className={`flex flex-col items-center justify-center p-8 cursor-pointer 
                    ${warehouse.bgColor} transition-all duration-300 ease-in-out 
                    hover:scale-[1.02] hover:shadow-lg text-center`}
        >
          <CardContent className="flex flex-col items-center p-0">
            {warehouse.icon}
            <h2 className="text-2xl font-bold mt-4 mb-1">
              {warehouse.name}
            </h2>
            <p className="text-gray-600 text-lg">
              {warehouse.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MagazynyPage;
