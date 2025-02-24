import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import ExpensesSection from "@/components/expenses-section";
import { LogOut } from "lucide-react";
import Countdown from "@/components/countdown";
import DownloadPlanning from "@/components/download-planning";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Countdown targetDate="2025-09-06T11:00:00" />
        </div>
        <div className="flex justify-center mb-8">
          <DownloadPlanning />
        </div>
        <ExpensesSection />
      </main>
    </div>
  );
}