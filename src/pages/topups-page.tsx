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
import { useState, useEffect } from "react";
import { topupsService } from "@/services/topups-service";
import type {
  Topup,
  VendorWallet,
  ApproveTopupRequest,
  RejectTopupRequest,
} from "@/types/topups";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router";
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

  const fetchTopups = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await topupsService.getTopupsList({
        page,
        per_page: 20,
        status: ["PENDING"],
        channel: ["CASH"],
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
  };

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
  }, []);

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

  if (error) {
    return (
      <SideBarLayout>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Topups</h1>
              <p className="text-muted-foreground">
                Manage user topups and transactions
              </p>
            </div>
            <Button asChild>
              <Link to="/top-ups/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Topup
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-destructive">
                    Error
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Failed to load topups data
                  </p>
                  <p className="text-sm text-destructive mt-2">{error}</p>
                </div>
                <Button
                  onClick={() => fetchTopups()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
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
            <h1 className="text-3xl font-bold tracking-tight">Topups</h1>
            <p className="text-muted-foreground">
              Manage user topups and transactions
            </p>
          </div>
          <Button asChild>
            <Link to="/top-ups/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Topup
            </Link>
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : topups.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No topups found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
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
