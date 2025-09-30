import SideBarLayout from "@/components/sidebar-layout";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* User Info Card */}

        {/* Dashboard Content */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user?.username}!</CardTitle>
              <CardDescription>
                You are logged in as {user?.principal}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">User ID:</span>
                <Badge variant="secondary">{user?.id}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Super User:</span>
                <Badge variant={user?.is_superuser ? "default" : "secondary"}>
                  {user?.is_superuser ? "Yes" : "No"}
                </Badge>
              </div>
              {user?.roles && user.roles.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Roles:</span>
                  {user.roles.map((role) => (
                    <Badge key={role.id} variant="outline">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card></Card>
          <Card></Card>
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </SideBarLayout>
  );
}
