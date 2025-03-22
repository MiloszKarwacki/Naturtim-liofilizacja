"use client";

import React from "react";
import { FrakcjaForm } from "./components/FrakcjeForm";

export default function FrakcjePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Nadawanie Frakcji</h1>
      <FrakcjaForm />
    </div>
  );
}
