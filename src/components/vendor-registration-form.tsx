import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth-service";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IconBrandTelegram } from "@tabler/icons-react";

const vendorRegistrationSchema = z
  .object({
    vendor_name: z.string().min(1, "Vendor name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirm_password: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    refferal_code: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine(
    (data) => {
      // If referral code is provided, it must be at least 8 characters
      if (data.refferal_code && data.refferal_code.length > 0) {
        return data.refferal_code.length >= 8;
      }
      return true;
    },
    {
      message: "Referral code must be at least 8 characters long",
      path: ["refferal_code"],
    }
  );

type VendorRegistrationFormData = z.infer<typeof vendorRegistrationSchema>;

export function VendorRegistrationForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();

  const form = useForm<VendorRegistrationFormData>({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      vendor_name: "",
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      refferal_code: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: VendorRegistrationFormData) => {
    try {
      await authService.registerVendor(data);
      toast.success(
        "Registration successful! Please login with your credentials."
      );
      navigate("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
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
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Vendor Registration</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Create your vendor account to start using the platform
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="vendor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your vendor name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Choose a username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password (min 8 characters)</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Create a password (min 8 characters)"
                    {...field}
                  />
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
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="refferal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Referral Code (optional, min 8 characters if provided)
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter referral code (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </div>
        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-primary hover:underline"
            >
              Sign in here
            </button>
          </p>
          <div className="mt-4 pt-4 border-t">
            <a
              href="https://t.me/multipayz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <IconBrandTelegram className="w-5 h-5" />
              <span>@multipayz</span>
            </a>
          </div>
        </div>
      </form>
    </Form>
  );
}
