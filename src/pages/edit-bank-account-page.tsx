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
  shop_name: z.string().min(1, "Shop name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  email: z.string().email("Invalid email format").optional(),
  app_secret: z.string().min(1, "App secret is required"),
  app_key: z.string().min(1, "App key is required"),
  mid: z.string().min(1, "Merchant ID is required"),
  public_key: z.string().min(1, "Public key is required"),
  private_key: z.string().min(1, "Private key is required"),
  qr_code_str: z.string().min(1, "QR code string is required"),
  account_no: z
    .string()
    .min(11, "Account number must be at least 11 characters")
    .max(12, "Account number must be at most 12 characters")
    .min(1, "Account number is required"),
});

type FormData = z.infer<typeof updatePayinBankAccountSchema>;

export default function EditBankAccountPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [bankAccount, setBankAccount] = useState<PayinBankAccount | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(updatePayinBankAccountSchema),
    defaultValues: {
      shop_name: "",
      username: "",
      password: "",
      email: "",
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
          shop_name: credentials?.shop_name || "",
          username: credentials?.username || "",
          password: credentials?.password || "",
          email: credentials?.email || "",
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

  const handleEnableCredentialsEdit = () => {
    setIsEditingCredentials(true);
    // Clear all credential fields
    form.setValue("shop_name", "");
    form.setValue("username", "");
    form.setValue("password", "");
    form.setValue("email", "");
    form.setValue("app_secret", "");
    form.setValue("app_key", "");
    form.setValue("mid", "");
    form.setValue("public_key", "");
    form.setValue("private_key", "");
    form.setValue("qr_code_str", "");
    form.setValue("account_no", "");
  };

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
              email: data.email,
              password: data.password,
              qr_code_str: data.qr_code_str,
            };
            break;
          case "BKASH_P2P":
            credentials = { account_no: data.account_no };
            break;
        }
      }
      await topupsService.updatePayinBankAccount(parseInt(id), {
        credentials,
      });
      toast.success("Payin bank account credentials updated successfully!");
      navigate("/bank-accounts");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update payin bank account credentials"
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

  // Helper function to format time for HTML input
  const formatTimeForInput = (time: string) => {
    if (!time) return "";
    // Remove 'Z' and convert to HH:mm:ss format
    return time.replace("Z", "").substring(0, 8);
  };

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
              Update payment method credentials
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Payin Bank Account Details</CardTitle>
            <CardDescription>
              Update the credentials for the payin bank account
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Category
                    </label>
                    <Input
                      value={bankAccount.category || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      This field cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={formatTimeForInput(
                        bankAccount.start_time || "00:00:00"
                      )}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      This field cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={formatTimeForInput(
                        bankAccount.end_time || "23:59:59"
                      )}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      This field cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Minimum Amount
                    </label>
                    <Input
                      type="number"
                      value={bankAccount.min_amount}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      This field cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Maximum Amount
                    </label>
                    <Input
                      type="number"
                      value={bankAccount.max_amount}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      This field cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Receivable Amount
                    </label>
                    <Input
                      type="number"
                      value={bankAccount.receivable_amount}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      This field cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Daily Receivable Amount
                    </label>
                    <Input
                      type="number"
                      value={bankAccount.daily_receivable_amount}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      This field cannot be changed
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Note
                  </label>
                  <Textarea
                    value={bankAccount.note || ""}
                    disabled
                    className="bg-muted"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    This field cannot be changed
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        Payment Method Credentials
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isEditingCredentials
                          ? `Enter new credentials for ${paymentMethodName}`
                          : "Credentials are masked for security"}
                      </p>
                    </div>
                    {!isEditingCredentials && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleEnableCredentialsEdit}
                      >
                        Edit Credentials
                      </Button>
                    )}
                  </div>
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
                              disabled={!isEditingCredentials}
                              className={
                                !isEditingCredentials ? "bg-muted" : ""
                              }
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
                                disabled={!isEditingCredentials}
                                className={
                                  !isEditingCredentials ? "bg-muted" : ""
                                }
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
                                  disabled={!isEditingCredentials}
                                  className={
                                    !isEditingCredentials ? "bg-muted" : ""
                                  }
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
                                  disabled={!isEditingCredentials}
                                  className={
                                    !isEditingCredentials ? "bg-muted" : ""
                                  }
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
                                  disabled={!isEditingCredentials}
                                  className={
                                    !isEditingCredentials ? "bg-muted" : ""
                                  }
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
                                  disabled={!isEditingCredentials}
                                  className={
                                    !isEditingCredentials ? "bg-muted" : ""
                                  }
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
                                  disabled={!isEditingCredentials}
                                  className={
                                    !isEditingCredentials ? "bg-muted" : ""
                                  }
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
                                  disabled={!isEditingCredentials}
                                  className={
                                    !isEditingCredentials ? "bg-muted" : ""
                                  }
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
                                  disabled={!isEditingCredentials}
                                  className={
                                    !isEditingCredentials ? "bg-muted" : ""
                                  }
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
                      <>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter email address"
                                  autoComplete="off"
                                  disabled={!isEditingCredentials}
                                  className={
                                    !isEditingCredentials ? "bg-muted" : ""
                                  }
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
                                  disabled={!isEditingCredentials}
                                  className={
                                    !isEditingCredentials ? "bg-muted" : ""
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
                                  disabled={!isEditingCredentials}
                                  className={
                                    !isEditingCredentials ? "bg-muted" : ""
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading || !isEditingCredentials}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {loading ? "Updating..." : "Update Credentials"}
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
