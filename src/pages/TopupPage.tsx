import { useState } from "react";
import Layout from "@/components/layout";
import { TopupForm } from "@/components/topup-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TopupPage() {
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSuccess = (data: any) => {
    setSuccessMessage("Topup request created successfully!");
    setShowForm(false);
  };

  const handleError = (error: Error) => {
    setSuccessMessage(`Error: ${error.message}`);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Topup Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your vendor account topups and fund requests
          </p>
        </div>

        {!showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Topup Request</CardTitle>
              <CardDescription>
                Create a new topup request to add funds to your vendor wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowForm(true)}>
                Create New Topup
              </Button>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setSuccessMessage(null);
              }}
            >
              ← Back to Menu
            </Button>
            <TopupForm onSuccess={handleSuccess} onError={handleError} />
          </div>
        )}

        {successMessage && (
          <Card
            className={
              successMessage.includes("Error")
                ? "border-red-500"
                : "border-green-500"
            }
          >
            <CardContent className="pt-6">
              <div
                className={`text-center ${
                  successMessage.includes("Error")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {successMessage}
              </div>
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSuccessMessage(null);
                    if (!showForm) setShowForm(false);
                  }}
                >
                  Back to Topup Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
