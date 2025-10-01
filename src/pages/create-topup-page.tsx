import SideBarLayout from "@/components/sidebar-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type { VendorWallet } from "@/types/topups";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const createTopupSchema = z.object({
  vendor_wallet_id: z.number().min(1, "Vendor Wallet is required"),
  channel: z.enum(["CASH", "BANK", "CRYPTO", "CASHOUT"]),
  requested_amount: z.number().min(0.01, "Amount must be greater than 0"),
  channel_note: z.string().optional(),
});

type FormData = z.infer<typeof createTopupSchema>;

export default function CreateTopupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vendorWallets, setVendorWallets] = useState<VendorWallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(createTopupSchema),
    defaultValues: {
      vendor_wallet_id: 0,
      channel: "CASHOUT",
      requested_amount: 0,
      channel_note: "",
    },
  });

  const generateIdempotencyKey = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `topup_${timestamp}_${random}`;
  };

  useEffect(() => {
    const fetchVendorWallets = async () => {
      try {
        setWalletsLoading(true);
        const response = await topupsService.getVendorWallets();
        setVendorWallets(response);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch vendor wallets";
        toast.error(errorMessage);
      } finally {
        setWalletsLoading(false);
      }
    };

    fetchVendorWallets();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Generate idempotency key automatically
      const idempotencyKey = generateIdempotencyKey();

      await topupsService.createTopup({
        vendor_wallet_id: data.vendor_wallet_id,
        channel: data.channel,
        requested_amount: data.requested_amount,
        channel_note: data.channel_note,
        idempotency_key: idempotencyKey,
      });

      toast.success("Topup created successfully!");
      navigate("/top-ups");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create topup";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                  <Link to="/top-ups">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <CardTitle className="text-2xl">Create Topup</CardTitle>
                  <CardDescription>Add a new topup transaction</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="max-w-lg space-y-4">
                    <FormField
                      control={form.control}
                      name="vendor_wallet_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Wallet</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            defaultValue={field.value?.toString()}
                            disabled={walletsLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={
                                    walletsLoading
                                      ? "Loading wallets..."
                                      : "Select vendor wallet"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="channel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select channel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CASHOUT">Cashout</SelectItem>
                              <SelectItem value="CASH">Cash</SelectItem>
                              <SelectItem value="BANK">Bank</SelectItem>
                              <SelectItem value="CRYPTO">Crypto</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requested_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requested Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              min="0.01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="channel_note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter additional notes about this topup..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {loading ? "Creating..." : "Create Topup"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link to="/top-ups">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </SideBarLayout>
  );
}
