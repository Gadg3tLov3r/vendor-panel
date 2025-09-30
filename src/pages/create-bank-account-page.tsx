import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type { VendorWallet, PaymentMethod } from "@/types/topups";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";

const createPayinBankAccountSchema = z.object({
  payment_method_id: z.number().min(1, "Payment method ID must be at least 1"),
  vendor_wallet_id: z.number().min(1, "Vendor wallet ID must be at least 1"),
  category: z.string().min(1, "Category is required"),
  // Credential fields
  shop_name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  app_secret: z.string().optional(),
  app_key: z.string().optional(),
  mid: z.string().optional(),
  public_key: z.string().optional(),
  private_key: z.string().optional(),
  qr_code_str: z.string().optional(),
  account_no: z.string().optional(),
});

type FormData = z.infer<typeof createPayinBankAccountSchema>;

export default function CreateBankAccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vendorWallets, setVendorWallets] = useState<VendorWallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(createPayinBankAccountSchema),
    defaultValues: {
      payment_method_id: 0,
      vendor_wallet_id: 0,
      category: "",
      // Credential fields
      shop_name: "",
      username: "",
      password: "",
      app_secret: "",
      app_key: "",
      mid: "",
      public_key: "",
      private_key: "",
      qr_code_str: "",
      account_no: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch vendor wallets
      try {
        setWalletsLoading(true);
        const walletsResponse = await topupsService.getVendorWallets();
        setVendorWallets(walletsResponse);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch vendor wallets";
        toast.error(errorMessage);
      } finally {
        setWalletsLoading(false);
      }

      // Fetch payment methods
      try {
        setPaymentMethodsLoading(true);
        const paymentMethodsResponse = await topupsService.getPaymentMethods();
        setPaymentMethods(paymentMethodsResponse);
        // Set the first payment method as default
        if (paymentMethodsResponse.length > 0) {
          form.setValue("payment_method_id", paymentMethodsResponse[0].id);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch payment methods";
        toast.error(errorMessage);
      } finally {
        setPaymentMethodsLoading(false);
      }
    };

    fetchData();
  }, [form]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Find the selected payment method
      const selectedPaymentMethod = paymentMethods.find(
        (m) => m.id === data.payment_method_id
      );

      // Build credentials object based on payment method
      let credentials: Record<string, unknown> = {};

      if (selectedPaymentMethod) {
        switch (selectedPaymentMethod.name) {
          case "BKASH_P2C":
            credentials = {
              shop_name: data.shop_name,
              username: data.username,
              password: data.password,
              app_secret: data.app_secret,
              app_key: data.app_key,
              account_no: data.account_no,
            };
            break;
          case "NAGAD_P2C":
            credentials = {
              shop_name: data.shop_name,
              mid: data.mid,
              public_key: data.public_key,
              private_key: data.private_key,
              account_no: data.account_no,
            };
            break;
          case "BKASH_QR":
            credentials = {
              shop_name: data.shop_name,
              account_no: data.account_no,
              qr_code_str: data.qr_code_str,
            };
            break;
          case "BKASH_P2P":
            credentials = {
              account_no: data.account_no,
            };
            break;
        }
      }

      await topupsService.createPayinBankAccount({
        payment_method_id: data.payment_method_id,
        vendor_wallet_id: data.vendor_wallet_id,
        category: data.category,
        credentials,
      });

      toast.success("Payin bank account created successfully!");
      navigate("/bank-accounts");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create payin bank account";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get the selected payment method name
  const selectedPaymentMethodId = form.watch("payment_method_id");
  const selectedPaymentMethod = paymentMethods.find(
    (m) => m.id === selectedPaymentMethodId
  );

  return (
    <SideBarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/bank-accounts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Payin Bank Account
            </h1>
            <p className="text-muted-foreground">
              Add a new payin bank account
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payin Bank Account Details</CardTitle>
            <CardDescription>
              Fill in the details to create a new payin bank account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                autoComplete="off"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="payment_method_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                          disabled={paymentMethodsLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  paymentMethodsLoading
                                    ? "Loading payment methods..."
                                    : "Select payment method"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Merchant Plus">
                              Merchant Plus
                            </SelectItem>
                            <SelectItem value="Lite A">Lite A</SelectItem>
                            <SelectItem value="Lite B">Lite B</SelectItem>
                            <SelectItem value="PRA">PRA</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Bank account category</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Credential Fields Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Payment Method Credentials
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPaymentMethod
                      ? `Fill in the required credential fields for ${selectedPaymentMethod.name}`
                      : "Select a payment method to see credential fields"}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Number - Required for all payment methods */}
                    <FormField
                      control={form.control}
                      name="account_no"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter account number"
                              autoComplete="off"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Shop Name - Required for BKASH_P2C, NAGAD_P2C, BKASH_QR */}
                    {selectedPaymentMethod &&
                      selectedPaymentMethod.name !== "BKASH_P2P" && (
                        <FormField
                          control={form.control}
                          name="shop_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Shop Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter shop name"
                                  autoComplete="off"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                    {/* BKASH_P2C specific fields */}
                    {selectedPaymentMethod &&
                      selectedPaymentMethod.name === "BKASH_P2C" && (
                        <>
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter username"
                                    autoComplete="off"
                                    data-form-type="other"
                                    data-lpignore="true"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Enter password"
                                    autoComplete="new-password"
                                    data-form-type="other"
                                    data-lpignore="true"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="app_secret"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>App Secret</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter app secret"
                                    autoComplete="off"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="app_key"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>App Key</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter app key"
                                    autoComplete="off"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                    {/* NAGAD_P2C specific fields */}
                    {selectedPaymentMethod &&
                      selectedPaymentMethod.name === "NAGAD_P2C" && (
                        <>
                          <FormField
                            control={form.control}
                            name="mid"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Merchant ID (MID)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter merchant ID"
                                    autoComplete="off"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="public_key"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Public Key</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter public key"
                                    autoComplete="off"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="private_key"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Private Key</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter private key"
                                    autoComplete="off"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                    {/* BKASH_QR specific fields */}
                    {selectedPaymentMethod &&
                      selectedPaymentMethod.name === "BKASH_QR" && (
                        <FormField
                          control={form.control}
                          name="qr_code_str"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>QR Code String</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter QR code string"
                                  autoComplete="off"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {loading ? "Creating..." : "Create Payin Bank Account"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/bank-accounts">Cancel</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
