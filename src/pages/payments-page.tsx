import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type { Payment } from "@/types/topups";
import SideBarLayout from "@/components/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  RefreshCw,
  Check,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await topupsService.getPayments({
        page,
        page_size: pageSize,
      });
      setPayments(response.items);
      setTotal(response.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch payments";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date: dateStr, time: timeStr };
  };

  const getOrderStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
      case "success":
        return {
          icon: CheckCircle,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-950/20",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          borderColor: "border-amber-200 dark:border-amber-800",
        };
      case "failed":
      case "error":
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-950/20",
          borderColor: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const hasHold = (holdAmount: string) => {
    return parseFloat(holdAmount) > 0;
  };

  const formatHoldTime = (ttlMs: number) => {
    if (ttlMs <= 0) return "Expired";

    const seconds = Math.floor(ttlMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <SideBarLayout>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
              <p className="text-muted-foreground">
                Manage and view payment transactions
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
              <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
              <p className="text-muted-foreground">
                Manage and view payment transactions
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-destructive">
                    Error Loading Payments
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button
                  onClick={fetchPayments}
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
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">
              Manage and view payment transactions ({total} total)
            </p>
          </div>
          <Button
            onClick={fetchPayments}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {payments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No payments found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Order Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>
                    <div className="flex flex-col">
                      <span>Balance</span>
                      <span className="text-xs text-muted-foreground">
                        Updated
                      </span>
                    </div>
                  </TableHead>
                  <TableHead>Bank Hold</TableHead>
                  <TableHead>Wallet Hold</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {payment.order_id}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{payment.vendor_name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {payment.payment_method_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrencyOrDash(payment.order_amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const statusInfo = getOrderStatusInfo(
                            payment.order_status
                          );
                          const IconComponent = statusInfo.icon;
                          return (
                            <div
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                            >
                              <IconComponent
                                className={`h-3 w-3 ${statusInfo.color}`}
                              />
                              <span className={statusInfo.color}>
                                {payment.order_status}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrencyOrDash(payment.paid_amount)}
                    </TableCell>
                    <TableCell>
                      {formatCurrencyOrDash(payment.commission_total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {payment.balance_updated ? (
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasHold(payment.bank_hold_amount) ? (
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm font-medium">
                            {formatCurrencyOrDash(payment.bank_hold_amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            TTL: {formatHoldTime(payment.bank_hold_ttl_ms)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasHold(payment.wallet_hold_amount) ? (
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm font-medium">
                            {formatCurrencyOrDash(payment.wallet_hold_amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            TTL: {formatHoldTime(payment.wallet_hold_ttl_ms)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium">
                          {formatDate(payment.created_at).date}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(payment.created_at).time}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, total)} of {total} payments
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </SideBarLayout>
  );
}
