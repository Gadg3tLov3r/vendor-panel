import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    principal: "vendor",
    rotate_session: true,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your vendor account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your credentials below to access the vendor panel
        </p>
      </div>
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
