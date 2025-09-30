import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { topupsService } from "@/services/topups-service";
import type { PayinBankAccount, PaymentMethod } from "@/types/topups";
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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";

const updatePayinBankAccountSchema = z.object({
  note: z.string().min(1, "Note is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  min_amount: z.number().min(0, "Minimum amount must be at least 0"),
  max_amount: z.number().min(0, "Maximum amount must be at least 0"),
  receivable_amount: z.number().min(0, "Receivable amount must be at least 0"),
  daily_receivable_amount: z
    .number()
    .min(0, "Daily receivable amount must be at least 0"),
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

type FormData = z.infer<typeof updatePayinBankAccountSchema>;

export default function EditBankAccountPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [bankAccount, setBankAccount] = useState<PayinBankAccount | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(updatePayinBankAccountSchema),
    defaultValues: {
      note: "",
      start_time: "00:00:00.000Z",
      end_time: "23:59:59.999Z",
      min_amount: 0,
      max_amount: 0,
      receivable_amount: 0,
      daily_receivable_amount: 0,
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
      if (!id) {
        toast.error("Bank account ID is required");
        navigate("/bank-accounts");
        return;
      }

      try {
        setFetchLoading(true);
        const bankAccountData = await topupsService.getPayinBankAccount(
          parseInt(id)
        );
        setBankAccount(bankAccountData);
        const paymentMethodsResponse = await topupsService.getPaymentMethods();
        setPaymentMethods(paymentMethodsResponse);
        const credentials = bankAccountData.credentials as Record<
          string,
          string
        >;
        form.reset({
          note: bankAccountData.note || "",
          start_time: bankAccountData.start_time || "00:00:00.000Z",
          end_time: bankAccountData.end_time || "23:59:59.999Z",
          min_amount: parseFloat(bankAccountData.min_amount) || 0,
          max_amount: parseFloat(bankAccountData.max_amount) || 0,
          receivable_amount: parseFloat(bankAccountData.receivable_amount) || 0,
          daily_receivable_amount:
            parseFloat(bankAccountData.daily_receivable_amount) || 0,
          shop_name: credentials?.shop_name || "",
          username: credentials?.username || "",
          password: credentials?.password || "",
          app_secret: credentials?.app_secret || "",
          app_key: credentials?.app_key || "",
          mid: credentials?.mid || "",
          public_key: credentials?.public_key || "",
          private_key: credentials?.private_key || "",
          qr_code_str: credentials?.qr_code_str || "",
          account_no: credentials?.account_no || "",
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to fetch bank account"
        );
        navigate("/bank-accounts");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, form]);

  const onSubmit = async (data: FormData) => {
    if (!id || !bankAccount) return;
    try {
      setLoading(true);
      const paymentMethod = paymentMethods.find(
        (m) => m.id === bankAccount.payment_method_id
      );
      let credentials: Record<string, unknown> = {};
      if (paymentMethod) {
        switch (paymentMethod.name) {
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
            credentials = { account_no: data.account_no };
            break;
        }
      }
      await topupsService.updatePayinBankAccount(parseInt(id), {
        note: data.note,
        start_time: data.start_time,
        end_time: data.end_time,
        min_amount: data.min_amount,
        max_amount: data.max_amount,
        receivable_amount: data.receivable_amount,
        daily_receivable_amount: data.daily_receivable_amount,
        credentials,
      });
      toast.success("Payin bank account updated successfully!");
      navigate("/bank-accounts");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update payin bank account"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
                Edit Payin Bank Account
              </h1>
              <p className="text-muted-foreground">
                Loading bank account details...
              </p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Payin Bank Account Details</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SideBarLayout>
    );
  }

  if (!bankAccount) {
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
                Edit Payin Bank Account
              </h1>
              <p className="text-muted-foreground">Bank account not found</p>
            </div>
          </div>
        </div>
      </SideBarLayout>
    );
  }

  const paymentMethodName =
    paymentMethods.find((m) => m.id === bankAccount.payment_method_id)?.name ||
    bankAccount.payment_method_name;

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
              Edit Payin Bank Account
            </h1>
            <p className="text-muted-foreground">
              Update payin bank account details
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Payin Bank Account Details</CardTitle>
            <CardDescription>
              Update the details of the payin bank account
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Payment Method
                    </label>
                    <Input
                      value={bankAccount.payment_method_name}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Payment method cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Vendor Wallet
                    </label>
                    <Input
                      value={bankAccount.vendor_wallet_name}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Vendor wallet cannot be changed
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>
                          Daily start time for this bank account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>
                          Daily end time for this bank account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="min_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="receivable_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receivable Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="daily_receivable_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Receivable Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter additional notes..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional information about this payin bank account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Payment Method Credentials
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Update the credential fields for {paymentMethodName}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {paymentMethodName !== "BKASH_P2P" && (
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
                    {paymentMethodName === "BKASH_P2C" && (
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
                    {paymentMethodName === "NAGAD_P2C" && (
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
                    {paymentMethodName === "BKASH_QR" && (
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
                    {loading ? "Updating..." : "Update Payin Bank Account"}
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
