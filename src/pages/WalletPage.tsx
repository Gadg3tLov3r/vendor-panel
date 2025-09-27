import { useState } from "react";
import Layout from "@/components/layout";
import { WalletForm } from "@/components/wallet-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminService } from "@/services/adminService";
import type { WalletResponse } from "@/types/wallet";

export default function WalletPage() {
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editableWallet, setEditableWallet] = useState<
    WalletResponse | undefined
  >();

  const handleSuccess = (data: WalletResponse) => {
    setSuccessMessage(
      `Wallet ${editableWallet ? "updated" : "created"} successfully!`
    );
    setShowForm(false);
    setEditableWallet(undefined);
  };

  const handleError = (error: Error) => {
    setSuccessMessage(`Error: ${error.message}`);
  };

  const handleEdit = (wallet: WalletResponse) => {
    setEditableWallet(wallet);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditableWallet(undefined);
    setShowForm(true);
  };

  const handleUpdate = (data: WalletResponse) => {
    setSuccessMessage("Wallet updated successfully!");
    setShowForm(false);
    setEditableWallet(undefined);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Wallet Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage vendor wallets with custom commission settings
          </p>
        </div>

        {!showForm && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Operations</CardTitle>
                <CardDescription>
                  Manage vendor wallets, set commission rates, and configure
                  transaction limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleCreateNew} className="w-full">
                  Create New Wallet
                </Button>
              </CardContent>
            </Card>

            {/* Future: Add wallet list/table here */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Wallets</CardTitle>
                <CardDescription>
                  View and manage existing wallets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Wallet list functionality will be added here.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {showForm && (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditableWallet(undefined);
                setSuccessMessage(null);
              }}
            >
              ← Back to Wallet Management
            </Button>
            <WalletForm
              onSuccess={handleSuccess}
              onError={handleError}
              editableWallet={editableWallet}
              onUpdate={handleUpdate}
            />
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
                  Back to Wallet Management
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
