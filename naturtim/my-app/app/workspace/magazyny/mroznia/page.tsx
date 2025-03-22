"use client";
import { InventoryTable } from "@/components/InventoryTable";
import React from "react";

const MrozniaPage = () => {
  // ID magazynu "Mroźnia" z tabeli Warehouse
  const MROZNIA_ID = 1;

  return (
    <div>
      <InventoryTable
        title="Mroźnia"
        headerBgColor="bg-blue-100"
        fetchUrl={`/workspace/magazyny/api/warehouses/${MROZNIA_ID}`}
        patchUrl={`/workspace/magazyny/api/warehouses/${MROZNIA_ID}`}
        quantityKey="mroznia"
        quantityColumnLabel="Ilość (kg)"
        updateDialogMessage={delivery =>
          `Zmiana ilości dostawy ${delivery.batchNumber}`}
      />
    </div>
  );
};

export default MrozniaPage;
