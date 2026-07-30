import { Loading } from "@/components/ui/loading";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loading text="Loading dashboard..." />
    </div>
  );
}
