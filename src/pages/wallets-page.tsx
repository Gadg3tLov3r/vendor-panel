import { useState, useEffect } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type { Wallet } from "@/types/topups";
import SideBarLayout from "@/components/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye, Plus } from "lucide-react";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingWallets, setUpdatingWallets] = useState<Set<number>>(
    new Set()
  );

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await topupsService.getWallets({ offset: 0, limit: 50 });
      setWallets(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch wallets";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateWallet = async (
    walletId: number,
    field: "is_active" | "enable_payment" | "enable_disbursement",
    value: boolean
  ) => {
    try {
      setUpdatingWallets((prev) => new Set(prev).add(walletId));

      const wallet = wallets.find((w) => w.id === walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      await topupsService.updateWallet(walletId, {
        name: wallet.name,
        is_active: field === "is_active" ? value : wallet.is_active,
        enable_payment:
          field === "enable_payment" ? value : wallet.enable_payment,
        enable_disbursement:
          field === "enable_disbursement" ? value : wallet.enable_disbursement,
      });

      // Update the local state
      setWallets((prevWallets) =>
        prevWallets.map((w) =>
          w.id === walletId ? { ...w, [field]: value } : w
        )
      );

      toast.success(`Wallet ${field.replace("_", " ")} updated successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update wallet";
      toast.error(errorMessage);
    } finally {
      setUpdatingWallets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(walletId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const formatCurrency = (amount: string, currency = "BDT") => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 3,
    }).format(numAmount);
  };

  if (loading) {
    return (
      <SideBarLayout>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
              <p className="text-muted-foreground">
                Manage and view wallet information
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SideBarLayout>
    );
  }

  if (error) {
    return (
      <SideBarLayout>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
              <p className="text-muted-foreground">
                Manage and view wallet information
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-destructive">
                    Error Loading Wallets
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button
                  onClick={fetchWallets}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SideBarLayout>
    );
  }

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
            <p className="text-muted-foreground">
              Manage and view wallet information ({wallets.length} total)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link to="/wallets/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Wallet
              </Link>
            </Button>
            <Button
              onClick={fetchWallets}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {wallets.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No wallets found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Active Hold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Disbursement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell className="font-medium">{wallet.name}</TableCell>
                    <TableCell>{wallet.vendor_name}</TableCell>
                    <TableCell>
                      {formatCurrency(wallet.balance, wallet.currency_name)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(
                        wallet.active_hold_amount,
                        wallet.currency_name
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={wallet.is_active}
                          onCheckedChange={(checked) =>
                            updateWallet(wallet.id, "is_active", checked)
                          }
                          disabled={updatingWallets.has(wallet.id)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {wallet.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={wallet.enable_payment}
                          onCheckedChange={(checked) =>
                            updateWallet(wallet.id, "enable_payment", checked)
                          }
                          disabled={updatingWallets.has(wallet.id)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {wallet.enable_payment ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={wallet.enable_disbursement}
                          onCheckedChange={(checked) =>
                            updateWallet(
                              wallet.id,
                              "enable_disbursement",
                              checked
                            )
                          }
                          disabled={updatingWallets.has(wallet.id)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {wallet.enable_disbursement ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/wallets/${wallet.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </SideBarLayout>
  );
}
