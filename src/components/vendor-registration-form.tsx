import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth-service";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { type VendorRegistrationRequest } from "@/types/auth";

export function VendorRegistrationForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VendorRegistrationRequest>({
    vendor_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    refferal_code: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.vendor_name ||
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirm_password ||
      !formData.refferal_code
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password confirmation validation
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    // Password strength validation
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Referral code validation
    if (formData.refferal_code.length < 8) {
      toast.error("Referral code must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await authService.registerVendor(formData);
      toast.success(
        "Registration successful! Please login with your credentials."
      );
      navigate("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Vendor Registration</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Create your vendor account to start using the platform
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="vendor_name">Vendor Name</Label>
          <Input
            id="vendor_name"
            type="text"
            placeholder="Enter your vendor name"
            value={formData.vendor_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password (min 8 characters)</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password (min 8 characters)"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <Input
            id="confirm_password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="refferal_code">
            Referral Code (min 8 characters)
          </Label>
          <Input
            id="refferal_code"
            type="text"
            placeholder="Enter referral code (min 8 characters)"
            value={formData.refferal_code}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
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
      </div>
    </form>
  );
}
