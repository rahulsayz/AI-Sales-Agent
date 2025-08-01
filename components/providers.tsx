"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster position="top-right" />
      {children}
    </ThemeProvider>
  );
}