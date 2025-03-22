"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DeliveryForm } from "./components/DeliveryForm";
import { DeliverySummary } from "./components/DeliverySummary";
import { useDeliveryForm } from "./hooks/useDeliveryForm";

const PrzyjecieDostawy = () => {
  const router = useRouter();
  const {
    products,
    suppliers,
    recipients,
    loading,
    formData,
    setFormData,
    showSummary,
    setShowSummary,
    handleConfirm
  } = useDeliveryForm();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container max-w-5xl mx-auto mt-4 mb-4">
        {loading
          ? <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-xl font-medium">Wczytywanie danych...</p>
            </div>
          : !showSummary
            ? <DeliveryForm
                formData={formData}
                setFormData={setFormData}
                products={products}
                suppliers={suppliers}
                recipients={recipients}
                onSubmit={() => setShowSummary(true)}
              />
            : null}

        <DeliverySummary
          open={showSummary}
          onOpenChange={setShowSummary}
          formData={formData}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
};

export default PrzyjecieDostawy;
