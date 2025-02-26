import "./globals.css";
import { Toaster } from "sonner";
import { AuthProviderWrapper } from "@/hooks/useAuth";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}

export const metadata = {
  title: "Naturtim",
  description: "System zarządzania dla Naturtim"
};
