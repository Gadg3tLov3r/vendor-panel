import { useState, useEffect } from "react";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type { PayinBankAccount } from "@/types/topups";
import SideBarLayout from "@/components/sidebar-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Plus } from "lucide-react";
import { Link } from "react-router";

export default function BankAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState<PayinBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<number | null>(null);
  const [activating, setActivating] = useState<number | null>(null);

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await topupsService.getPayinBankAccounts();
      setBankAccounts(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch bank accounts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleApprove = async (
    bankAccountId: number,
    currentApproved: boolean
  ) => {
    // Only allow approving if currently not approved
    if (currentApproved) {
      toast.error("Bank account is already approved");
      return;
    }

    try {
      setApproving(bankAccountId);
      await topupsService.approvePayinBankAccount(bankAccountId);
      toast.success("Bank account approved successfully!");
      fetchBankAccounts(); // Refresh the list
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to approve bank account";
      toast.error(errorMessage);
    } finally {
      setApproving(null);
    }
  };

  const handleActivateToggle = async (
    bankAccountId: number,
    currentActive: boolean
  ) => {
    try {
      setActivating(bankAccountId);

      if (currentActive) {
        // Currently active, so deactivate
        await topupsService.deactivatePayinBankAccount(bankAccountId);
        toast.success("Bank account deactivated successfully!");
      } else {
        // Currently inactive, so activate
        await topupsService.activatePayinBankAccount(bankAccountId);
        toast.success("Bank account activated successfully!");
      }

      fetchBankAccounts(); // Refresh the list
    } catch (error) {
      const action = currentActive ? "deactivate" : "activate";
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${action} bank account`;
      toast.error(errorMessage);
    } finally {
      setActivating(null);
    }
  };

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 3,
    }).format(numAmount);
  };

  if (loading) {
    return (
      <SideBarLayout>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Payin Bank Accounts
              </h1>
              <p className="text-muted-foreground">
                Manage payin bank accounts and financial information
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payin Bank Accounts List</CardTitle>
              <CardDescription>
                Loading bank account information...
              </CardDescription>
            </CardHeader>
            <CardContent>
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
              <h1 className="text-3xl font-bold tracking-tight">
                Payin Bank Accounts
              </h1>
              <p className="text-muted-foreground">
                Manage payin bank accounts and financial information
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Error Loading Bank Accounts</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={fetchBankAccounts}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
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
            <h1 className="text-3xl font-bold tracking-tight">
              Payin Bank Accounts
            </h1>
            <p className="text-muted-foreground">
              Manage payin bank accounts and financial information (
              {bankAccounts.length} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchBankAccounts}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/bank-accounts/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Bank Account
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payin Bank Accounts List</CardTitle>
            <CardDescription>
              View all payin bank accounts and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No payin bank accounts found
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor Wallet</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Active Hold Amount</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Min Amount</TableHead>
                      <TableHead>Max Amount</TableHead>
                      <TableHead>Received Amount</TableHead>
                      <TableHead>Approve</TableHead>
                      <TableHead>Activate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.vendor_wallet_name}
                        </TableCell>
                        <TableCell>{account.payment_method_name}</TableCell>
                        <TableCell>
                          {formatCurrency(account.active_hold_amount)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {account.note || "—"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(account.min_amount)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(account.max_amount)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(account.received_amount)}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={account.is_approved}
                            onCheckedChange={() =>
                              handleApprove(account.id, account.is_approved)
                            }
                            disabled={
                              account.is_approved || approving === account.id
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={account.is_active}
                            onCheckedChange={() =>
                              handleActivateToggle(
                                account.id,
                                account.is_active
                              )
                            }
                            disabled={activating === account.id}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
