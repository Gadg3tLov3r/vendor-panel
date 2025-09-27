import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export function SiteHeader() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Vendor Dashboard</h1>
        {isAuthenticated && user && (
          <span className="text-sm text-muted-foreground">
            Welcome, {user.username}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && (
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
