import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/session-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const metadata = {
  title: "RetailFlow - Dashboard",
  description: "Retail management system",
};

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DashboardLayout>{children}</DashboardLayout>
        </ThemeProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
