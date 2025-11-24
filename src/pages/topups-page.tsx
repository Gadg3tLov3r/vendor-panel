import SideBarLayout from "@/components/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useCallback, useRef } from "react";
import { topupsService } from "@/services/topups-service";
import type {
  Topup,
  VendorWallet,
  ApproveTopupRequest,
  RejectTopupRequest,
  TopupsListParams,
} from "@/types/topups";
import { toast } from "sonner";
import {
  Plus,
  RefreshCw,
  Filter,
  Search,
  XCircle as ClearIcon,
} from "lucide-react";
import { Link } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TopupsPage() {
  const [topups, setTopups] = useState<Topup[]>([]);
  const [vendorWallets, setVendorWallets] = useState<VendorWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const isInitialMount = useRef(true);
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    topup: Topup | null;
  }>({
    open: false,
    topup: null,
  });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    topup: Topup | null;
  }>({
    open: false,
    topup: null,
  });
  const [approveData, setApproveData] = useState<ApproveTopupRequest>({
    paid_amount: 0,
    admin_note: "",
  });
  const [rejectData, setRejectData] = useState<RejectTopupRequest>({
    reason: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Filter states - UI state (what user is editing)
  const [filters, setFilters] = useState<
    Omit<TopupsListParams, "page" | "per_page" | "status" | "channel">
  >({
    vendor_wallet_id: null,
    created_from: null,
    created_to: null,
    amount_min: null,
    amount_max: null,
  });

  // Applied filters - what's actually sent to the API
  const [appliedFilters, setAppliedFilters] = useState<
    Omit<TopupsListParams, "page" | "per_page" | "status" | "channel">
  >({
    vendor_wallet_id: null,
    created_from: null,
    created_to: null,
    amount_min: null,
    amount_max: null,
  });

  const fetchTopups = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await topupsService.getTopupsList({
          page,
          per_page: 20,
          status: ["PENDING"],
          channel: ["CASH"],
          ...appliedFilters,
        });

        setTopups(response.items);
        setPagination({
          page: response.page,
          per_page: response.per_page,
          total: response.total,
          total_pages: Math.ceil(response.total / response.per_page),
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch topups";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters]
  );

  const fetchVendorWallets = async () => {
    try {
      const response = await topupsService.getVendorWallets();
      setVendorWallets(response);
    } catch (error) {
      console.error("Failed to fetch vendor wallets:", error);
    }
  };

  const getVendorWalletName = (vendorWalletId: number) => {
    const wallet = vendorWallets.find((w) => w.id === vendorWalletId);
    return wallet ? wallet.name : `Wallet ${vendorWalletId}`;
  };

  // const handleApprove = (topup: Topup) => {
  //   setApproveData({
  //     paid_amount: parseFloat(topup.requested_amount),
  //     admin_note: "",
  //   });
  //   setApproveDialog({ open: true, topup });
  // };

  // const handleReject = (topup: Topup) => {
  //   setRejectData({ reason: "" });
  //   setRejectDialog({ open: true, topup });
  // };

  const confirmApprove = async () => {
    if (!approveDialog.topup) return;

    try {
      setActionLoading(true);
      await topupsService.approveTopup(approveDialog.topup.id, approveData);
      toast.success("Topup approved successfully!");
      setApproveDialog({ open: false, topup: null });
      fetchTopups(pagination.page); // Refresh the list
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to approve topup";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectDialog.topup) return;

    try {
      setActionLoading(true);
      await topupsService.rejectTopup(rejectDialog.topup.id, rejectData);
      toast.success("Topup rejected successfully!");
      setRejectDialog({ open: false, topup: null });
      fetchTopups(pagination.page); // Refresh the list
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reject topup";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchTopups();
    fetchVendorWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchTopups(pagination.page);
  }, [appliedFilters, fetchTopups, pagination.page]);

  const handleFilterChange = (
    key: keyof typeof filters,
    value: number | string | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      vendor_wallet_id: null,
      created_from: null,
      created_to: null,
      amount_min: null,
      amount_max: null,
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = Object.values(appliedFilters).some(
    (value) => value !== null && value !== undefined
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "COMPLETED":
        return "default";
      case "FAILED":
        return "destructive";
      case "CANCELLED":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getChannelBadgeVariant = (channel: string) => {
    switch (channel) {
      case "CASH":
        return "default";
      case "BANK":
        return "secondary";
      case "CRYPTO":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT", // Default to BDT
      minimumFractionDigits: 3,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 min-w-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Topups
            </h1>
            <p className="text-muted-foreground">
              Manage {!loading && `(${pagination.total} total)`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={hasActiveFilters ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={loading}
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters ? "Filters Active" : "Filters"}
            </Button>
            <Button
              onClick={() => fetchTopups(pagination.page)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              asChild
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Link to="/top-ups/create">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Topup</span>
                <span className="sm:hidden">Create</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="min-w-0">
            <CardContent className="pt-6 min-w-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filter Topups</h3>
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
                  {/* Vendor Wallet */}
                  <div className="space-y-2">
                    <Label htmlFor="vendor-wallet">Vendor Wallet</Label>
                    <Select
                      value={filters.vendor_wallet_id?.toString() || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "vendor_wallet_id",
                          value === "all" ? null : parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger id="vendor-wallet" className="w-full">
                        <SelectValue placeholder="All vendor wallets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All vendor wallets</SelectItem>
                        {vendorWallets.map((wallet) => (
                          <SelectItem
                            key={wallet.id}
                            value={wallet.id.toString()}
                          >
                            {wallet.name}
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
          <Card className="min-w-0">
            <CardContent className="pt-6 min-w-0">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="min-w-0">
            <CardContent className="pt-6 min-w-0">
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-destructive">
                    Error Loading Topups
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button
                  onClick={() => fetchTopups(pagination.page)}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : topups.length === 0 ? (
          <Card className="min-w-0">
            <CardContent className="pt-6 min-w-0">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No topups found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border min-w-0">
            <div className="w-full max-w-full overflow-x-auto min-w-0">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Wallet</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Requested Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topups.map((topup) => (
                    <TableRow key={topup.id}>
                      <TableCell className="font-medium">
                        {getVendorWalletName(topup.vendor_wallet_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getChannelBadgeVariant(topup.channel)}>
                          {topup.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(topup.requested_amount)}
                      </TableCell>
                      <TableCell>
                        {topup.paid_amount
                          ? formatCurrency(topup.paid_amount)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(topup.status)}>
                          {topup.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {topup.channel_note || "—"}
                      </TableCell>
                      <TableCell>{formatDate(topup.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Approve Dialog */}
        <Dialog
          open={approveDialog.open}
          onOpenChange={(open) => setApproveDialog({ open, topup: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Topup</DialogTitle>
              <DialogDescription>
                Approve this topup request. You can adjust the paid amount if
                needed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="paid_amount">Paid Amount</Label>
                <Input
                  id="paid_amount"
                  type="number"
                  step="0.01"
                  value={approveData.paid_amount}
                  onChange={(e) =>
                    setApproveData({
                      ...approveData,
                      paid_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_note">Admin Note</Label>
                <Textarea
                  id="admin_note"
                  placeholder="Enter admin note..."
                  value={approveData.admin_note}
                  onChange={(e) =>
                    setApproveData({
                      ...approveData,
                      admin_note: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setApproveDialog({ open: false, topup: null })}
              >
                Cancel
              </Button>
              <Button onClick={confirmApprove} disabled={actionLoading}>
                {actionLoading ? "Approving..." : "Approve"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog
          open={rejectDialog.open}
          onOpenChange={(open) => setRejectDialog({ open, topup: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Topup</DialogTitle>
              <DialogDescription>
                Reject this topup request. Please provide a reason for
                rejection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for rejection..."
                  value={rejectData.reason}
                  onChange={(e) => setRejectData({ reason: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialog({ open: false, topup: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmReject}
                disabled={actionLoading || !rejectData.reason.trim()}
              >
                {actionLoading ? "Rejecting..." : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SideBarLayout>
  );
}
