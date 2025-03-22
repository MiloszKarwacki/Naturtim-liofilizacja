"use client";

import Image from "next/image";
import { LoginForm } from "@/app/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="mb-8">
        <Image
          src="https://naturtim.pl/wp-content/uploads/2024/04/logotyp_naturtim.svg"
          alt="Naturtim Logo"
          width={400}
          height={200}
          priority
        />
      </div>

      <LoginForm />
    </div>
  );
}
