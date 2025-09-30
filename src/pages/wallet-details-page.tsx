import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type {
  WalletDetails,
  WalletMethod,
  CreateWalletMethodRequest,
  PaymentMethod,
} from "@/types/topups";
import SideBarLayout from "@/components/sidebar-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, RefreshCw, Plus } from "lucide-react";

export default function WalletDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [walletMethods, setWalletMethods] = useState<WalletMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [methodsError, setMethodsError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingMethods, setUpdatingMethods] = useState<Set<number>>(
    new Set()
  );
  const [formData, setFormData] = useState<CreateWalletMethodRequest>({
    payment_method_id: 0,
    is_active: true,
    enable_payment: true,
    enable_disbursement: true,
    payment_commission_rate_percent: 0,
    payment_commission_rate_fixed: 0,
    disbursement_commission_rate_percent: 0,
    disbursement_commission_rate_fixed: 0,
    settlement_commission_rate_percent: 0,
    settlement_commission_rate_fixed: 0,
    topup_commission_rate_percent: 0,
    topup_commission_rate_fixed: 0,
    min_payment_amount: 0,
    max_payment_amount: 0,
    min_disbursement_amount: 0,
    max_disbursement_amount: 0,
  });

  const fetchWalletDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await topupsService.getWalletDetails(parseInt(id));
      setWallet(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch wallet details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchWalletMethods = useCallback(async () => {
    if (!id) return;

    try {
      setMethodsLoading(true);
      setMethodsError(null);
      const response = await topupsService.getWalletMethods(parseInt(id));
      setWalletMethods(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch wallet methods";
      setMethodsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setMethodsLoading(false);
    }
  }, [id]);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await topupsService.getPaymentMethods();
      setPaymentMethods(response);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    }
  }, []);

  const createWalletMethod = async () => {
    if (!id) return;

    try {
      setCreating(true);
      await topupsService.createWalletMethod(parseInt(id), formData);
      toast.success("Wallet method created successfully");
      setCreateDialogOpen(false);
      setFormData({
        payment_method_id: 0,
        is_active: true,
        enable_payment: true,
        enable_disbursement: true,
        payment_commission_rate_percent: 0,
        payment_commission_rate_fixed: 0,
        disbursement_commission_rate_percent: 0,
        disbursement_commission_rate_fixed: 0,
        settlement_commission_rate_percent: 0,
        settlement_commission_rate_fixed: 0,
        topup_commission_rate_percent: 0,
        topup_commission_rate_fixed: 0,
        min_payment_amount: 0,
        max_payment_amount: 0,
        min_disbursement_amount: 0,
        max_disbursement_amount: 0,
      });
      fetchWalletMethods();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create wallet method";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const updateWalletMethod = async (
    methodId: number,
    field: "is_active" | "enable_payment" | "enable_disbursement",
    value: boolean
  ) => {
    if (!id) return;

    try {
      setUpdatingMethods((prev) => new Set(prev).add(methodId));

      const method = walletMethods.find((m) => m.id === methodId);
      if (!method) {
        throw new Error("Wallet method not found");
      }

      await topupsService.updateWalletMethod(methodId, {
        is_active: field === "is_active" ? value : method.is_active,
        enable_payment:
          field === "enable_payment" ? value : method.enable_payment,
        enable_disbursement:
          field === "enable_disbursement" ? value : method.enable_disbursement,
      });

      // Update the local state
      setWalletMethods((prevMethods) =>
        prevMethods.map((m) =>
          m.id === methodId ? { ...m, [field]: value } : m
        )
      );

      toast.success(
        `Wallet method ${field.replace("_", " ")} updated successfully`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update wallet method";
      toast.error(errorMessage);
    } finally {
      setUpdatingMethods((prev) => {
        const newSet = new Set(prev);
        newSet.delete(methodId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchWalletDetails();
    fetchWalletMethods();
    fetchPaymentMethods();
  }, [fetchWalletDetails, fetchWalletMethods, fetchPaymentMethods]);

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 3,
    }).format(numAmount);
  };

  const formatCurrencyOrDash = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (numAmount === 0) {
      return "-";
    }
    return formatCurrency(amount);
  };

  if (loading) {
    return (
      <SideBarLayout>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/wallets">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Wallet Details
              </h1>
              <p className="text-muted-foreground">
                Loading wallet information...
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
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
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/wallets">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Wallet Details
              </h1>
              <p className="text-muted-foreground">Error loading wallet</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Error Loading Wallet</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={fetchWalletDetails}
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

  if (!wallet) {
    return (
      <SideBarLayout>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/wallets">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Wallet Details
              </h1>
              <p className="text-muted-foreground">Wallet not found</p>
            </div>
          </div>
        </div>
      </SideBarLayout>
    );
  }

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/wallets">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {wallet.name}
              </h1>
              <p className="text-muted-foreground">Wallet ID: {wallet.id}</p>
            </div>
          </div>
          <Button
            onClick={fetchWalletDetails}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Wallet configuration and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={wallet.is_active ? "default" : "secondary"}>
                  {wallet.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Enabled</span>
                <Badge
                  variant={wallet.enable_payment ? "default" : "secondary"}
                >
                  {wallet.enable_payment ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Disbursement Enabled
                </span>
                <Badge
                  variant={wallet.enable_disbursement ? "default" : "secondary"}
                >
                  {wallet.enable_disbursement ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Can Balance Go Negative
                </span>
                <Badge
                  variant={
                    wallet.can_balance_go_negative ? "default" : "secondary"
                  }
                >
                  {wallet.can_balance_go_negative ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Vendor ID</span>
                <span className="text-sm text-muted-foreground">
                  {wallet.vendor_id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Currency ID</span>
                <span className="text-sm text-muted-foreground">
                  {wallet.currency_id}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                Transaction totals and commissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Payment</span>
                <span className="text-sm font-mono">
                  {formatCurrencyOrDash(wallet.total_payment)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Commission</span>
                <span className="text-sm font-mono">
                  {formatCurrencyOrDash(wallet.payment_commission)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Disbursement</span>
                <span className="text-sm font-mono">
                  {formatCurrencyOrDash(wallet.total_disbursement)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Disbursement Commission
                </span>
                <span className="text-sm font-mono">
                  {formatCurrencyOrDash(wallet.disbursement_commission)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Settlement</span>
                <span className="text-sm font-mono">
                  {formatCurrencyOrDash(wallet.total_settlement)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Settlement Commission
                </span>
                <span className="text-sm font-mono">
                  {formatCurrencyOrDash(wallet.settlement_commission)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Topup</span>
                <span className="text-sm font-mono">
                  {formatCurrencyOrDash(wallet.total_topup)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Topup Commission</span>
                <span className="text-sm font-mono">
                  {formatCurrencyOrDash(wallet.topup_commission)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Wallet Methods</CardTitle>
                <CardDescription>
                  Payment methods linked to this wallet
                </CardDescription>
              </div>
              <Dialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader className="pb-4">
                    <DialogTitle>Add Wallet Method</DialogTitle>
                    <DialogDescription>
                      Link a new payment method to this wallet
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-foreground">
                        Payment Method
                      </h4>
                      <div className="space-y-2">
                        <Label htmlFor="payment_method_id">
                          Select Payment Method
                        </Label>
                        <Select
                          value={formData.payment_method_id.toString()}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              payment_method_id: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem
                                key={method.id}
                                value={method.id.toString()}
                              >
                                {method.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-foreground">
                        Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, is_active: !!checked })
                            }
                          />
                          <Label htmlFor="is_active">Active</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enable_payment"
                            checked={formData.enable_payment}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                enable_payment: !!checked,
                              })
                            }
                          />
                          <Label htmlFor="enable_payment">Enable Payment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enable_disbursement"
                            checked={formData.enable_disbursement}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                enable_disbursement: !!checked,
                              })
                            }
                          />
                          <Label htmlFor="enable_disbursement">
                            Enable Disbursement
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-foreground">
                        Payment Amounts
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min_payment_amount">
                            Min Payment Amount
                          </Label>
                          <Input
                            id="min_payment_amount"
                            type="number"
                            step="0.01"
                            value={formData.min_payment_amount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                min_payment_amount:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max_payment_amount">
                            Max Payment Amount
                          </Label>
                          <Input
                            id="max_payment_amount"
                            type="number"
                            step="0.01"
                            value={formData.max_payment_amount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                max_payment_amount:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-foreground">
                        Disbursement Amounts
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min_disbursement_amount">
                            Min Disbursement Amount
                          </Label>
                          <Input
                            id="min_disbursement_amount"
                            type="number"
                            step="0.01"
                            value={formData.min_disbursement_amount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                min_disbursement_amount:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max_disbursement_amount">
                            Max Disbursement Amount
                          </Label>
                          <Input
                            id="max_disbursement_amount"
                            type="number"
                            step="0.01"
                            value={formData.max_disbursement_amount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                max_disbursement_amount:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-foreground">
                        Commission Rates
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">
                            Payment Commission
                          </h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="payment_commission_rate_percent">
                                Percent Rate
                              </Label>
                              <Input
                                id="payment_commission_rate_percent"
                                type="number"
                                step="0.01"
                                value={formData.payment_commission_rate_percent}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    payment_commission_rate_percent:
                                      parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="payment_commission_rate_fixed">
                                Fixed Rate
                              </Label>
                              <Input
                                id="payment_commission_rate_fixed"
                                type="number"
                                step="0.01"
                                value={formData.payment_commission_rate_fixed}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    payment_commission_rate_fixed:
                                      parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">
                            Disbursement Commission
                          </h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="disbursement_commission_rate_percent">
                                Percent Rate
                              </Label>
                              <Input
                                id="disbursement_commission_rate_percent"
                                type="number"
                                step="0.01"
                                value={0}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="disbursement_commission_rate_fixed">
                                Fixed Rate
                              </Label>
                              <Input
                                id="disbursement_commission_rate_fixed"
                                type="number"
                                step="0.01"
                                value={0}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">
                            Settlement Commission
                          </h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="settlement_commission_rate_percent">
                                Percent Rate
                              </Label>
                              <Input
                                id="settlement_commission_rate_percent"
                                type="number"
                                step="0.01"
                                value={0}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="settlement_commission_rate_fixed">
                                Fixed Rate
                              </Label>
                              <Input
                                id="settlement_commission_rate_fixed"
                                type="number"
                                step="0.01"
                                value={0}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">
                            Topup Commission
                          </h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="topup_commission_rate_percent">
                                Percent Rate
                              </Label>
                              <Input
                                id="topup_commission_rate_percent"
                                type="number"
                                step="0.01"
                                value={0}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="topup_commission_rate_fixed">
                                Fixed Rate
                              </Label>
                              <Input
                                id="topup_commission_rate_fixed"
                                type="number"
                                step="0.01"
                                value={0}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={createWalletMethod} disabled={creating}>
                        {creating ? "Creating..." : "Create Method"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {methodsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : methodsError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">{methodsError}</p>
                <Button
                  onClick={fetchWalletMethods}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : walletMethods.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No wallet methods found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Disbursement</TableHead>
                      <TableHead>Min Payment</TableHead>
                      <TableHead>Max Payment</TableHead>
                      <TableHead>Min Disbursement</TableHead>
                      <TableHead>Max Disbursement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {walletMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">
                          {method.payment_method_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={method.is_active}
                              onCheckedChange={(checked) =>
                                updateWalletMethod(
                                  method.id,
                                  "is_active",
                                  checked
                                )
                              }
                              disabled={updatingMethods.has(method.id)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {method.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={method.enable_payment}
                              onCheckedChange={(checked) =>
                                updateWalletMethod(
                                  method.id,
                                  "enable_payment",
                                  checked
                                )
                              }
                              disabled={updatingMethods.has(method.id)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {method.enable_payment ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={method.enable_disbursement}
                              onCheckedChange={(checked) =>
                                updateWalletMethod(
                                  method.id,
                                  "enable_disbursement",
                                  checked
                                )
                              }
                              disabled={updatingMethods.has(method.id)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {method.enable_disbursement
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrencyOrDash(method.min_payment_amount)}
                        </TableCell>
                        <TableCell>
                          {formatCurrencyOrDash(method.max_payment_amount)}
                        </TableCell>
                        <TableCell>
                          {formatCurrencyOrDash(method.min_disbursement_amount)}
                        </TableCell>
                        <TableCell>
                          {formatCurrencyOrDash(method.max_disbursement_amount)}
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
