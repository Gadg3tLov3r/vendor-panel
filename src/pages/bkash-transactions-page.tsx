import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type {
  BkashTransaction,
  BkashTransactionsListParams,
} from "@/types/topups";
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
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Search,
  XCircle as ClearIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const TXN_STATUSES = ["used", "unused", "fake"];

export default function BkashTransactionsPage() {
  const [transactions, setTransactions] = useState<BkashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states - UI state (what user is editing)
  const [filters, setFilters] = useState<
    Omit<BkashTransactionsListParams, "page" | "page_size" | "include_stats">
  >({
    transaction_id: null,
    bank_id: null,
    sender: null,
    receiver: null,
    direction: null,
    txn_status: null,
    bkash_status: null,
    amount_min: null,
    amount_max: null,
    occurred_from: null,
    occurred_to: null,
    payment_id: null,
    payment_linked: null,
    merchant_identifier: null,
    vendor_id: null,
  });

  // Applied filters - what's actually sent to the API
  const [appliedFilters, setAppliedFilters] = useState<
    Omit<BkashTransactionsListParams, "page" | "page_size" | "include_stats">
  >({
    transaction_id: null,
    bank_id: null,
    sender: null,
    receiver: null,
    direction: null,
    txn_status: null,
    bkash_status: null,
    amount_min: null,
    amount_max: null,
    occurred_from: null,
    occurred_to: null,
    payment_id: null,
    payment_linked: null,
    merchant_identifier: null,
    vendor_id: null,
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await topupsService.getBkashTransactions({
        page,
        page_size: pageSize,
        include_stats: false,
        ...appliedFilters,
      });
      setTransactions(response.items);
      setTotal(response.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch bKash transactions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, appliedFilters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | number | boolean | string[] | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => {
      const currentStatuses = prev.txn_status || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status];
      return {
        ...prev,
        txn_status: newStatuses.length > 0 ? newStatuses : null,
      };
    });
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      transaction_id: null,
      bank_id: null,
      sender: null,
      receiver: null,
      direction: null,
      txn_status: null,
      bkash_status: null,
      amount_min: null,
      amount_max: null,
      occurred_from: null,
      occurred_to: null,
      payment_id: null,
      payment_linked: null,
      merchant_identifier: null,
      vendor_id: null,
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
    if (isNaN(numAmount)) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(numAmount);
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

  const getStatusInfo = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("success") || statusLower.includes("completed")) {
      return {
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-950/20",
        borderColor: "border-green-200 dark:border-green-800",
      };
    } else if (statusLower.includes("pending")) {
      return {
        icon: Clock,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
        borderColor: "border-amber-200 dark:border-amber-800",
      };
    } else if (
      statusLower.includes("failed") ||
      statusLower.includes("error")
    ) {
      return {
        icon: XCircle,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800",
      };
    } else {
      return {
        icon: AlertCircle,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-950/20",
        borderColor: "border-gray-200 dark:border-gray-800",
      };
    }
  };

  const getDirectionIcon = (direction: string) => {
    if (direction?.toLowerCase() === "out") {
      return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    } else if (direction?.toLowerCase() === "in") {
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
    }
    return null;
  };

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              bKash Transactions
            </h1>
            <p className="text-muted-foreground">
              View and manage bKash transaction history{" "}
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
              onClick={fetchTransactions}
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
                  <h3 className="text-lg font-semibold">Filter Transactions</h3>
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
                  {/* Transaction ID Search */}
                  <div className="space-y-2">
                    <Label htmlFor="transaction-id">Transaction ID</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="transaction-id"
                        placeholder="Search by transaction ID..."
                        value={filters.transaction_id || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "transaction_id",
                            e.target.value || null
                          )
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Bank ID */}
                  <div className="space-y-2">
                    <Label htmlFor="bank-id">Bank ID</Label>
                    <Input
                      id="bank-id"
                      placeholder="Search by bank ID..."
                      value={filters.bank_id || ""}
                      onChange={(e) =>
                        handleFilterChange("bank_id", e.target.value || null)
                      }
                    />
                  </div>

                  {/* Sender */}
                  <div className="space-y-2">
                    <Label htmlFor="sender">Sender</Label>
                    <Input
                      id="sender"
                      placeholder="Search by sender..."
                      value={filters.sender || ""}
                      onChange={(e) =>
                        handleFilterChange("sender", e.target.value || null)
                      }
                    />
                  </div>

                  {/* Receiver */}
                  <div className="space-y-2">
                    <Label htmlFor="receiver">Receiver</Label>
                    <Input
                      id="receiver"
                      placeholder="Search by receiver..."
                      value={filters.receiver || ""}
                      onChange={(e) =>
                        handleFilterChange("receiver", e.target.value || null)
                      }
                    />
                  </div>

                  {/* Direction */}
                  <div className="space-y-2">
                    <Label htmlFor="direction">Direction</Label>
                    <Select
                      value={filters.direction || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "direction",
                          value === "all" ? null : value
                        )
                      }
                    >
                      <SelectTrigger id="direction" className="w-full">
                        <SelectValue placeholder="All directions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All directions</SelectItem>
                        <SelectItem value="Credit">Credit</SelectItem>
                        <SelectItem value="Debit">Debit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* bKash Status */}
                  <div className="space-y-2">
                    <Label htmlFor="bkash-status">bKash Status</Label>
                    <Input
                      id="bkash-status"
                      placeholder="Search by bKash status..."
                      value={filters.bkash_status || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "bkash_status",
                          e.target.value || null
                        )
                      }
                    />
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

                  {/* Occurred From */}
                  <div className="space-y-2">
                    <Label htmlFor="occurred-from">Occurred From</Label>
                    <Input
                      id="occurred-from"
                      type="datetime-local"
                      value={filters.occurred_from || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "occurred_from",
                          e.target.value || null
                        )
                      }
                    />
                  </div>

                  {/* Occurred To */}
                  <div className="space-y-2">
                    <Label htmlFor="occurred-to">Occurred To</Label>
                    <Input
                      id="occurred-to"
                      type="datetime-local"
                      value={filters.occurred_to || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "occurred_to",
                          e.target.value || null
                        )
                      }
                    />
                  </div>

                  {/* Payment ID */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-id">Payment ID</Label>
                    <Input
                      id="payment-id"
                      type="number"
                      placeholder="Search by payment ID..."
                      value={filters.payment_id || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "payment_id",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  </div>

                  {/* Payment Linked */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-linked">Payment Linked</Label>
                    <Select
                      value={
                        filters.payment_linked === null
                          ? "all"
                          : filters.payment_linked
                          ? "true"
                          : "false"
                      }
                      onValueChange={(value) =>
                        handleFilterChange(
                          "payment_linked",
                          value === "all" ? null : value === "true"
                        )
                      }
                    >
                      <SelectTrigger id="payment-linked" className="w-full">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Linked</SelectItem>
                        <SelectItem value="false">Not Linked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Merchant Identifier */}
                  <div className="space-y-2">
                    <Label htmlFor="merchant-identifier">
                      Merchant Identifier
                    </Label>
                    <Input
                      id="merchant-identifier"
                      placeholder="Search by merchant identifier..."
                      value={filters.merchant_identifier || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "merchant_identifier",
                          e.target.value || null
                        )
                      }
                    />
                  </div>

                  {/* Vendor ID */}
                  <div className="space-y-2">
                    <Label htmlFor="vendor-id">Vendor ID</Label>
                    <Input
                      id="vendor-id"
                      type="number"
                      placeholder="Search by vendor ID..."
                      value={filters.vendor_id || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "vendor_id",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  </div>
                </div>

                {/* Transaction Status Checkboxes */}
                <div className="space-y-2">
                  <Label>Transaction Status</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TXN_STATUSES.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={
                            filters.txn_status?.includes(status) || false
                          }
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
                    Error Loading Transactions
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button
                  onClick={fetchTransactions}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No bKash transactions found
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Bank ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Charge</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Occurred At</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {txn.transaction_id}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {txn.bank_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{txn.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDirectionIcon(txn.direction)}
                        <span className="capitalize">{txn.direction}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {txn.sender}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {txn.receiver}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(txn.amount)}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {formatCurrency(txn.credit)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency(txn.charge)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(txn.total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const statusInfo = getStatusInfo(txn.txn_status);
                          const IconComponent = statusInfo.icon;
                          return (
                            <div
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                            >
                              <IconComponent
                                className={`h-3 w-3 ${statusInfo.color}`}
                              />
                              <span className={statusInfo.color}>
                                {txn.txn_status}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{txn.channel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium">
                          {formatDate(txn.occurred_at).date}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(txn.occurred_at).time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={txn.remark}>
                        {txn.remark || "-"}
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
              {Math.min(page * pageSize, total)} of {total} transactions
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
