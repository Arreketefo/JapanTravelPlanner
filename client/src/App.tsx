import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NavBar from "@/components/nav-bar";
import HomePage from "@/pages/home-page";
import CityPage from "@/pages/city-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      {children}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={() => (
        <ProtectedLayout>
          <HomePage />
        </ProtectedLayout>
      )} />
      <ProtectedRoute path="/osaka" component={() => (
        <ProtectedLayout>
          <CityPage city="osaka" />
        </ProtectedLayout>
      )} />
      <ProtectedRoute path="/kyoto" component={() => (
        <ProtectedLayout>
          <CityPage city="kyoto" />
        </ProtectedLayout>
      )} />
      <ProtectedRoute path="/tokyo" component={() => (
        <ProtectedLayout>
          <CityPage city="tokyo" />
        </ProtectedLayout>
      )} />
      <Route component={() => (
        <ProtectedLayout>
          <NotFound />
        </ProtectedLayout>
      )}/>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}