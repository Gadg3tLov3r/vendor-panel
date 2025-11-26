import { useState, useEffect } from "react";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type { PaymentMethod } from "@/types/topups";
import SideBarLayout from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit, AlertTriangle } from "lucide-react";

interface CommissionData {
  vwm_id: number;
  wallet_id: number;
  wallet_name: string;
  payment_method_id: number;
  payment_method_name: string;
  resolved_payment_commission_rate_percent: string;
  resolved_payment_commission_rate_fixed: string;
}

interface CommissionDetails {
  payment_commission_rate_percent: string;
  payment_commission_rate_fixed: string;
  disbursement_commission_rate_percent: string;
  disbursement_commission_rate_fixed: string;
  vendor_set_payment_commission_rate_percent: string;
  vendor_set_payment_commission_rate_fixed: string;
  vendor_set_disbursement_commission_rate_percent: string;
  vendor_set_disbursement_commission_rate_fixed: string;
  is_vendor_set_payment_commission_approved: boolean;
  is_vendor_set_disburment_commission_approved: boolean;
  vendor_payment_commission_last_set_at: string | null;
  vendor_disbursement_commission_last_set_at: string | null;
  vendor_payment_commission_approved_at: string | null;
  vendor_disbursement_commission_approved_at: string | null;
  wallet_id: number;
  payment_method_id: number;
}

export default function FastDepositPage() {
  const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
  const [commissionDetails, setCommissionDetails] =
    useState<CommissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(2);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    vendor_set_payment_commission_rate_percent: "",
  });
  const [updating, setUpdating] = useState(false);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await topupsService.getPaymentMethods();
      setPaymentMethods(response);
      // Payment method ID is set to 2 by default and cannot be changed
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      toast.error("Failed to fetch payment methods");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const fetchCommission = async () => {
    if (!paymentMethodId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await topupsService.getPaymentMethodCommission(
        paymentMethodId,
        100,
        0
      );
      // Response is an array of commission data
      const data = Array.isArray(response) ? response : [];
      setCommissionData(data as CommissionData[]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch commission data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionDetails = async () => {
    if (!paymentMethodId) {
      return;
    }

    try {
      setLoadingDetails(true);
      const response = await topupsService.getPaymentMethodCommissionDetails(
        paymentMethodId
      );
      setCommissionDetails(response as CommissionDetails);
    } catch (error) {
      console.error("Failed to fetch commission details:", error);
      // Don't show error toast for details, just log it
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditClick = () => {
    if (commissionDetails) {
      setEditData({
        vendor_set_payment_commission_rate_percent: "",
      });
      setEditDialogOpen(true);
    }
  };

  const handleUpdateCommission = async () => {
    if (!paymentMethodId || !commissionDetails) {
      return;
    }

    if (
      !editData.vendor_set_payment_commission_rate_percent ||
      editData.vendor_set_payment_commission_rate_percent.trim() === ""
    ) {
      toast.error("Please enter a commission rate");
      return;
    }

    try {
      setUpdating(true);
      await topupsService.updatePaymentMethodCommission(paymentMethodId, {
        vendor_set_payment_commission_rate_percent: parseFloat(
          editData.vendor_set_payment_commission_rate_percent
        ),
        vendor_set_payment_commission_rate_fixed: parseFloat(
          commissionDetails.vendor_set_payment_commission_rate_fixed || "0"
        ),
      });
      toast.success("Commission updated successfully!");
      setEditDialogOpen(false);
      // Refresh the commission details and commission information table
      await fetchCommissionDetails();
      await fetchCommission();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update commission";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (paymentMethodId) {
      setCommissionData([]); // Clear previous data when payment method changes
      setCommissionDetails(null);
      fetchCommission();
      fetchCommissionDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethodId]);

  const formatPercent = (value: string | null | undefined) => {
    if (value === null || value === undefined) return "—";
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "—";
    return `${numValue.toFixed(2)}%`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  if (loadingPaymentMethods) {
    return (
      <SideBarLayout>
        <div className="flex flex-1 flex-col gap-4 p-4 min-w-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Fast Deposit
              </h1>
              <p className="text-muted-foreground">
                View payment method commission information
              </p>
            </div>
          </div>

          <Card className="min-w-0">
            <CardContent className="pt-6 min-w-0">
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </SideBarLayout>
    );
  }

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 min-w-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Fast Deposit
            </h1>
            <p className="text-muted-foreground">
              View payment method commission information
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <Button
              onClick={fetchCommission}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={loading || !paymentMethodId}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              {loadingPaymentMethods ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={paymentMethodId?.toString() || ""}
                  onValueChange={(value) => setPaymentMethodId(parseInt(value))}
                  disabled={true}
                >
                  <SelectTrigger id="payment-method" className="w-full">
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="min-w-0">
            <CardContent className="pt-6 min-w-0">
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-destructive">
                    Error Loading Commission Data
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button
                  onClick={fetchCommission}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentMethodId && commissionDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingDetails ? (
              <>
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </>
            ) : (
              <>
                <Card className="min-w-0">
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        System Commission Rate
                      </p>
                      <p className="text-xl font-bold">
                        {formatPercent(
                          commissionDetails.payment_commission_rate_percent
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-w-0 border-primary/50 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Vendor Set Commission Rate
                      </p>
                      {commissionDetails.vendor_set_payment_commission_rate_percent ? (
                        <>
                          <p className="text-xl font-bold text-primary">
                            {formatPercent(
                              commissionDetails.vendor_set_payment_commission_rate_percent
                            )}
                          </p>
                          {commissionDetails.vendor_payment_commission_last_set_at && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Last updated:{" "}
                              {formatDate(
                                commissionDetails.vendor_payment_commission_last_set_at
                              )}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Not set yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {paymentMethodId && (
          <Card className="min-w-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top 10 commission bids</CardTitle>
                {commissionDetails && (
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      onClick={handleEditClick}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Place your commission bid
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      lower commission, higher traffic
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="min-w-0 p-4">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : commissionData.length > 0 ? (
                <div className="rounded-md border min-w-0">
                  <div className="w-full max-w-full overflow-x-auto min-w-0">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Sl No</TableHead>
                          <TableHead>Wallet Name</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Effective Commission Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissionData.map((item, index) => (
                          <TableRow key={item.vwm_id}>
                            <TableCell className="text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.wallet_name}
                            </TableCell>
                            <TableCell>{item.payment_method_name}</TableCell>
                            <TableCell>
                              {formatPercent(
                                item.resolved_payment_commission_rate_percent
                              )}{" "}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No commission data found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Commission Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set your own Commission Rates</DialogTitle>
              <DialogDescription>
                Set the vendor set payment commission rates for this payment
                method.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_set_payment_commission_rate_percent">
                  Vendor Set Payment Commission Rate (Percent)
                </Label>
                <Input
                  id="vendor_set_payment_commission_rate_percent"
                  type="number"
                  step="0.1"
                  required
                  value={editData.vendor_set_payment_commission_rate_percent}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty, numbers, and numbers with one decimal place
                    if (value === "" || /^\d*\.?\d{0,1}$/.test(value)) {
                      setEditData({
                        ...editData,
                        vendor_set_payment_commission_rate_percent: value,
                      });
                    }
                  }}
                />
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 p-3 flex gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                  Once you submit your bid, it will be locked and cannot be
                  modified for the next 12 hours. Please review carefully before
                  confirming.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateCommission} disabled={updating}>
                {updating ? "Confirming..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SideBarLayout>
  );
}
