import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { authService } from "@/services/auth-service";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "New password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirm_password: z.string().min(1, "Please confirm your new password"),
    logout_everywhere: z.boolean(),
    issue_new_tokens: z.boolean(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm({
  className,
  onSuccess,
  ...props
}: React.ComponentProps<"form"> & {
  onSuccess?: () => void;
}) {
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
      logout_everywhere: true,
      issue_new_tokens: true,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const response = await authService.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
        logout_everywhere: data.logout_everywhere,
        issue_new_tokens: data.issue_new_tokens,
      });

      if (response.ok) {
        toast.success("Password changed successfully!");

        // If new tokens were issued, update the stored tokens
        if (response.issued_tokens) {
          localStorage.setItem(
            "auth_tokens",
            JSON.stringify({
              access_token: response.issued_tokens.access_token,
              refresh_token: response.issued_tokens.refresh_token,
              token_type: response.issued_tokens.token_type,
              expires_in: response.issued_tokens.expires_in,
              expires_at: Date.now() + response.issued_tokens.expires_in * 1000,
              sid: response.issued_tokens.sid,
            })
          );
        }

        onSuccess?.();
      } else {
        toast.error("Failed to change password");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Password change failed"
      );
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleSubmit(onSubmit)}
        {...props}
      >
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="current_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="logout_everywhere"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Logout everywhere</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Sign out from all other devices and sessions
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issue_new_tokens"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Issue new tokens</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Generate new access and refresh tokens
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Changing Password..." : "Change Password"}
          </Button>
        </div>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Make sure your new password is strong and secure
          </p>
        </div>
      </form>
    </Form>
  );
}
