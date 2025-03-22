import { InventoryTable } from "@/components/InventoryTable";
import React from "react";

const page = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-6xl font-bold text-center">Strona w budowie...</h1>
      {/* <InventoryTable
        title="Magazyn Kartonów"
        headerBgColor="bg-gray-100"
        fetchUrl={`/workspace/magazyny/api/warehouses/${KARTONY_ID}`}
        patchUrl={`/workspace/magazyny/api/warehouses/${KARTONY_ID}`}
        quantityKey="kartony"
        quantityColumnLabel="Ilość (szt.)"
        updateDialogMessage={delivery =>
          `Zmiana ilości kartonów ${delivery.batchNumber}`}
      /> */}
    </div>
  );
};

export default page;
