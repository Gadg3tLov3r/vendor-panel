import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type { Payment, PaymentsListParams } from "@/types/topups";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Check,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  XCircle as ClearIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const PAYMENT_STATUSES = [
  "pending",
  "completed",
  "paid",
  "success",
  "failed",
  "error",
  "cancelled",
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [payinBankAccounts, setPayinBankAccounts] = useState<
    Array<{
      id: number;
      vendor_wallet_name: string;
      payment_method_name: string;
    }>
  >([]);

  // Filter states - UI state (what user is editing)
  const [filters, setFilters] = useState<
    Omit<PaymentsListParams, "page" | "page_size">
  >({
    order_id: null,
    status: null,
    payment_method_id: null,
    payin_bank_account_id: null,
    amount_min: null,
    amount_max: null,
    created_from: null,
    created_to: null,
  });

  // Applied filters - what's actually sent to the API
  const [appliedFilters, setAppliedFilters] = useState<
    Omit<PaymentsListParams, "page" | "page_size">
  >({
    order_id: null,
    status: null,
    payment_method_id: null,
    payin_bank_account_id: null,
    amount_min: null,
    amount_max: null,
    created_from: null,
    created_to: null,
  });

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await topupsService.getPayments({
        page,
        page_size: pageSize,
        ...appliedFilters,
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
  }, [page, pageSize, appliedFilters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Fetch payment methods and bank accounts for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [methodsRes, bankAccountsRes] = await Promise.all([
          topupsService.getPaymentMethods(),
          topupsService.getPayinBankAccounts(),
        ]);
        setPaymentMethods(methodsRes);
        setPayinBankAccounts(bankAccountsRes);
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | number | string[] | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => {
      const currentStatuses = prev.status || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status];
      return { ...prev, status: newStatuses.length > 0 ? newStatuses : null };
    });
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      order_id: null,
      status: null,
      payment_method_id: null,
      payin_bank_account_id: null,
      amount_min: null,
      amount_max: null,
      created_from: null,
      created_to: null,
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(
    (value) =>
      value !== null &&
      value !== undefined &&
      (Array.isArray(value) ? value.length > 0 : true)
  );

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

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">
              Manage and view payment transactions{" "}
              {!loading && `(${total} total)`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={hasActiveFilters ? "default" : "outline"}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters ? "Filters Active" : "Filters"}
            </Button>
            <Button
              onClick={fetchPayments}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filter Payments</h3>
                  {hasActiveFilters && (
                    <Button
                      onClick={handleClearFilters}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ClearIcon className="h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Order ID Search */}
                  <div className="space-y-2">
                    <Label htmlFor="order-id">Order ID</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="order-id"
                        placeholder="Search by order ID..."
                        value={filters.order_id || ""}
                        onChange={(e) =>
                          handleFilterChange("order_id", e.target.value || null)
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select
                      value={filters.payment_method_id?.toString() || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "payment_method_id",
                          value === "all" ? null : parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger id="payment-method" className="w-full">
                        <SelectValue placeholder="All payment methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All payment methods</SelectItem>
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

                  {/* Payin Bank Account */}
                  <div className="space-y-2">
                    <Label htmlFor="bank-account">Payin Bank Account</Label>
                    <Select
                      value={filters.payin_bank_account_id?.toString() || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "payin_bank_account_id",
                          value === "all" ? null : parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger id="bank-account" className="w-full">
                        <SelectValue placeholder="All bank accounts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All bank accounts</SelectItem>
                        {payinBankAccounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            value={account.id.toString()}
                          >
                            {account.vendor_wallet_name} (
                            {account.payment_method_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Min */}
                  <div className="space-y-2">
                    <Label htmlFor="amount-min">Minimum Amount</Label>
                    <Input
                      id="amount-min"
                      type="number"
                      placeholder="0.00"
                      value={filters.amount_min || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "amount_min",
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                    />
                  </div>

                  {/* Amount Max */}
                  <div className="space-y-2">
                    <Label htmlFor="amount-max">Maximum Amount</Label>
                    <Input
                      id="amount-max"
                      type="number"
                      placeholder="0.00"
                      value={filters.amount_max || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "amount_max",
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                    />
                  </div>

                  {/* Created From */}
                  <div className="space-y-2">
                    <Label htmlFor="created-from">Created From</Label>
                    <Input
                      id="created-from"
                      type="datetime-local"
                      value={filters.created_from || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "created_from",
                          e.target.value || null
                        )
                      }
                    />
                  </div>

                  {/* Created To */}
                  <div className="space-y-2">
                    <Label htmlFor="created-to">Created To</Label>
                    <Input
                      id="created-to"
                      type="datetime-local"
                      value={filters.created_to || ""}
                      onChange={(e) =>
                        handleFilterChange("created_to", e.target.value || null)
                      }
                    />
                  </div>
                </div>

                {/* Status Checkboxes */}
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PAYMENT_STATUSES.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.status?.includes(status) || false}
                          onCheckedChange={() => handleStatusToggle(status)}
                        />
                        <label
                          htmlFor={`status-${status}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleApplyFilters}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
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
        ) : error ? (
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
        ) : payments.length === 0 ? (
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
        {!loading && total > pageSize && (
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
