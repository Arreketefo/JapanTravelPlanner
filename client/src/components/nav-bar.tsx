import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Home, Map, LogOut } from "lucide-react";

export default function NavBar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/osaka", icon: Map, label: "Osaka" },
    { href: "/kyoto", icon: Map, label: "Kyoto" },
    { href: "/tokyo", icon: Map, label: "Tokyo" },
  ];

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <div
                key={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer ${
                  location === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
                onClick={() => window.location.href = item.href}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {user?.username}
            </span>
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}