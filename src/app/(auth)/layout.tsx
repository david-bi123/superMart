import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-end p-4">
        <ThemeToggle className="pointer-events-auto" />
      </div>
      {children}
    </>
  );
}