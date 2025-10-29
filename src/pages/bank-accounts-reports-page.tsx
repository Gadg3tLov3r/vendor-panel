import { useState } from "react";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type { PayinBankAccountsReportsResponse } from "@/types/topups";
import SideBarLayout from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Search, Download, FileText, DollarSign, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BankAccountsReportsPage() {
  const [reportData, setReportData] =
    useState<PayinBankAccountsReportsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Set default dates to today
  const today = new Date().toISOString().split("T")[0];

  const handleFetchReport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("From date cannot be greater than to date");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await topupsService.getPayinBankAccountsReports({
        from_report_date: fromDate,
        to_report_date: toDate,
      });
      setReportData(response);
      toast.success("Report fetched successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch report";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatJSON = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  const handleExportJSON = () => {
    if (!reportData) return;

    const jsonStr = formatJSON(reportData);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bank-accounts-report-${fromDate}-to-${toDate}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bank Accounts Reports
            </h1>
            <p className="text-muted-foreground">
              Generate and view payin bank accounts reports
            </p>
          </div>
        </div>

        {/* Date Range Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Date Range</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-date">From Date</Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    max={today}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-date">To Date</Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    max={today}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleFetchReport}
                  disabled={loading || !fromDate || !toDate}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {loading ? "Fetching..." : "Generate Report"}
                </Button>
                {reportData && (
                  <Button
                    onClick={handleExportJSON}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export JSON
                  </Button>
                )}
                {loading && (
                  <Button
                    onClick={handleFetchReport}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled
                  >
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading...
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-destructive">
                    Error Loading Report
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button
                  onClick={handleFetchReport}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Amount
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Transactions
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Report Data Display */}
        {reportData && !loading && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Amount
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(reportData.total_amount_sum)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all bank accounts
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Transactions
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportData.total_txn_count.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total transaction count
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Report Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <CardTitle>Bank Accounts Report</CardTitle>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {fromDate} to {toDate}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {reportData.items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No bank accounts found in the selected date range
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account Number</TableHead>
                          <TableHead>Vendor Name</TableHead>
                          <TableHead className="text-right">
                            Total Amount
                          </TableHead>
                          <TableHead className="text-right">
                            Transaction Count
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.items.map((item) => (
                          <TableRow key={item.pba_id}>
                            <TableCell className="font-mono text-sm">
                              {item.account_no}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.vendor_name}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.total_amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.txn_count.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!reportData && !loading && !error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a date range and generate a report to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SideBarLayout>
  );
}

