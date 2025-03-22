"use client";
import { InventoryTable } from "@/components/InventoryTable";
import React from "react";

const GotowyProduktPage = () => {
  // ID magazynu "Gotowy produkt" z tabeli Warehouse
  const GOTOWY_PRODUKT_ID = 3;

  return (
    <div>
      <InventoryTable
        title="Magazyn Produktów Gotowych"
        headerBgColor="bg-orange-100"
        fetchUrl={`/workspace/magazyny/api/warehouses/${GOTOWY_PRODUKT_ID}`}
        patchUrl={`/workspace/magazyny/api/warehouses/${GOTOWY_PRODUKT_ID}`}
        quantityKey="gotowyprodukt"
        quantityColumnLabel="Ilość (kg)"
        updateDialogMessage={delivery =>
          `Zmiana ilości produktu gotowego ${delivery.batchNumber}`}
      />
    </div>
  );
};

export default GotowyProduktPage;
