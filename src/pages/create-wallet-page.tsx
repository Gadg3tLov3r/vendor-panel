import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type { Currency, Vendor } from "@/types/topups";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";

const createWalletSchema = z.object({
  name: z.string().min(1, "Wallet name is required"),
  currency_id: z.number().min(1, "Currency ID must be at least 1"),
  vendor_id: z.number().min(1, "Vendor ID must be at least 1"),
  is_active: z.boolean(),
  enable_payment: z.boolean(),
  enable_disbursement: z.boolean(),
  can_balance_go_negative: z.boolean(),
});

type FormData = z.infer<typeof createWalletSchema>;

export default function CreateWalletPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      name: "",
      currency_id: 1,
      vendor_id: 1,
      is_active: true,
      enable_payment: true,
      enable_disbursement: true,
      can_balance_go_negative: false,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch currencies
      try {
        setCurrenciesLoading(true);
        const currenciesResponse = await topupsService.getCurrencies();
        setCurrencies(currenciesResponse);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch currencies";
        toast.error(errorMessage);
      } finally {
        setCurrenciesLoading(false);
      }

      // Fetch vendors
      try {
        setVendorsLoading(true);
        const vendorsResponse = await topupsService.getVendors();
        setVendors(vendorsResponse);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch vendors";
        toast.error(errorMessage);
      } finally {
        setVendorsLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      await topupsService.createWallet(data);

      toast.success("Wallet created successfully!");
      navigate("/wallets");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create wallet";
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
                  <Link to="/wallets">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <CardTitle className="text-2xl">Create Wallet</CardTitle>
                  <CardDescription>Add a new wallet</CardDescription>
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wallet Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter wallet name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            defaultValue={field.value?.toString()}
                            disabled={currenciesLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={
                                    currenciesLoading
                                      ? "Loading currencies..."
                                      : "Select currency"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem
                                  key={currency.id}
                                  value={currency.id.toString()}
                                >
                                  {currency.sign} {currency.name}
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
                      name="vendor_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            defaultValue={field.value?.toString()}
                            disabled={vendorsLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={
                                    vendorsLoading
                                      ? "Loading vendors..."
                                      : "Select vendor"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vendors.map((vendor) => (
                                <SelectItem
                                  key={vendor.id}
                                  value={vendor.id.toString()}
                                >
                                  {vendor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Wallet Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>
                                Enable this wallet for transactions
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enable_payment"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Enable Payment</FormLabel>
                              <FormDescription>
                                Allow payments through this wallet
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enable_disbursement"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Enable Disbursement</FormLabel>
                              <FormDescription>
                                Allow disbursements through this wallet
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="can_balance_go_negative"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Allow Negative Balance</FormLabel>
                              <FormDescription>
                                Allow wallet balance to go below zero
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={loading}>
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {loading ? "Creating..." : "Create Wallet"}
                      </Button>
                      <Button type="button" variant="outline" asChild>
                        <Link to="/wallets">Cancel</Link>
                      </Button>
                    </div>
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
