import Layout from "./components/layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { api } from "@/lib/api";

export default function Dashboard() {
  const { user, logout, permissions } = useAuth();

  // Example of making an API call with the axios instance
  const makeAuthenticatedCall = async () => {
    try {
      const response = await api.get("/vendor/profile");
      console.log("API response:", response.data);
    } catch (error) {
      console.error("Authenticated API call failed:", error);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}
          </p>
          {user?.roles && user.roles.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Role: {user.roles.map((role) => role.name).join(", ")}
            </p>
          )}
          {permissions && permissions.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Permissions: {permissions.join(", ")}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="my-4 space-y-2 px-4">
        <p className="text-sm text-muted-foreground">
          Authentication setup complete! All API calls will now automatically
          include the JWT token.
        </p>
        <Button onClick={makeAuthenticatedCall} variant="outline" size="sm">
          Test Authenticated API Call
        </Button>
      </div>
    </Layout>
  );
}
