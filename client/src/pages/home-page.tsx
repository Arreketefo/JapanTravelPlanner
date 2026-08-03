import { lazy, Suspense, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import ExpensesSection from "@/components/expenses-section";
import { LogOut } from "lucide-react";
import Countdown from "@/components/countdown";

const DownloadPlanning = lazy(() => import("@/components/download-planning"));

function DownloadPlanningLoader() {
  const [enabled, setEnabled] = useState(false);

  if (!enabled) {
    return <Button onClick={() => setEnabled(true)}>Preparar descarga en PDF</Button>;
  }

  return (
    <Suspense fallback={<Button disabled>Preparando exportación…</Button>}>
      <DownloadPlanning />
    </Suspense>
  );
}

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const tripStartDate = import.meta.env.VITE_TRIP_START_DATE;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {tripStartDate && (
          <div className="text-center mb-8">
            <Countdown targetDate={tripStartDate} />
          </div>
        )}
        <div className="flex justify-center mb-8">
          <DownloadPlanningLoader />
        </div>
        <ExpensesSection />
      </main>
    </div>
  );
}
