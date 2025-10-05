import { Navigate, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import SideBarLayout from "@/components/sidebar-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/change-password-form";
import { IconLogout2 } from "@tabler/icons-react";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const { isAuthenticated, isLoading, logoutAll } = useAuth();
  const navigate = useNavigate();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSuccess = () => {
    // Navigate back to dashboard after successful password change
    navigate("/dashboard");
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAll();
      toast.success("Logged out from all devices successfully");
      navigate("/login");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to logout from all devices"
      );
    }
  };

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm onSuccess={handleSuccess} />
              <div className="mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Security Actions
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogoutAll}
                    className="w-full"
                  >
                    <IconLogout2 className="h-4 w-4 mr-2" />
                    Logout from all devices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SideBarLayout>
  );
}
