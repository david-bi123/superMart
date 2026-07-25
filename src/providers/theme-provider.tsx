"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
export function ThemeProvider({ children, ...props }: { children: React.ReactNode } & any) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
