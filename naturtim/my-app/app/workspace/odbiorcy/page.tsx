"use client";
import React from "react";
import { DataGridCrud } from "@/components/DataGridCrud";
import { recipient } from "@/app/workspace/odbiorcy/types/recipient";
export default function OdbiorcyPage() {
  const transformRecipientItem = (item: recipient) => {
    return {
      id: item.id,
      recipientName: item.name
    };
  };

  return (
    <DataGridCrud
      title="Odbiorcy"
      fetchUrl="/workspace/odbiorcy/api"
      createUrl="/workspace/odbiorcy/api"
      deleteUrl="/workspace/odbiorcy/api"
      displayField="recipientName"
      displayColumnHeader="Nazwa odbiorcy"
      addDialogLabel="Nazwa odbiorcy"
      addButtonText="Dodaj odbiorcę"
      showIdColumn={true}
      transformFetchedItem={transformRecipientItem}
      addSuccessMessage="Odbiorca został dodany! 🎉"
      deleteSuccessMessage="Odbiorca został poprawnie usunięty! 🎉"
    />
  );
}
