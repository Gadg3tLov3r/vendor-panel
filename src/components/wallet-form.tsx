import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminService } from "@/services/adminService";
import type {
  CreateWalletRequest,
  WalletResponse,
  UpdateWalletRequest,
} from "@/types/wallet";

const walletSchema = z.object({
  name: z.string().min(1, "Wallet name is required"),
  currency_id: z.string().min(1, "Currency ID is required"),
  is_active: z.boolean(),
  enable_payment: z.boolean(),
  enable_disbursement: z.boolean(),
  vendor_id: z.string().min(1, "Vendor ID is required"),
  payment_commission_rate_percent: z.string(),
  disbursement_commission_rate_percent: z.string(),
  settlement_commission_rate_percent: z.string(),
  topup_commission_rate_percent: z.string(),
  payment_commission_rate_fixed: z.string(),
  disbursement_commission_rate_fixed: z.string(),
  settlement_commission_rate_fixed: z.string(),
  topup_commission_rate_fixed: z.string(),
  min_payment_amount: z.string(),
  max_payment_amount: z.string(),
  min_disbursement_amount: z.string(),
  max_disbursement_amount: z.string(),
  can_balance_go_negative: z.boolean(),
});

type WalletFormValues = z.infer<typeof walletSchema>;

interface WalletFormProps {
  onSuccess?: (data: WalletResponse) => void;
  onError?: (error: Error) => void;
  editableWallet?: WalletResponse;
  onUpdate?: (data: WalletResponse) => void;
}

export function WalletForm({
  onSuccess,
  onError,
  editableWallet,
  onUpdate,
}: WalletFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!editableWallet;

  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: editableWallet
      ? {
          name: editableWallet.name,
          currency_id: editableWallet.currency_id.toString(),
          is_active: editableWallet.is_active,
          enable_payment: editableWallet.enable_payment,
          enable_disbursement: editableWallet.enable_disbursement,
          vendor_id: editableWallet.vendor_id.toString(),
          payment_commission_rate_percent:
            editableWallet.payment_commission_rate_percent.toString(),
          disbursement_commission_rate_percent:
            editableWallet.disbursement_commission_rate_percent.toString(),
          settlement_commission_rate_percent:
            editableWallet.settlement_commission_rate_percent.toString(),
          topup_commission_rate_percent:
            editableWallet.topup_commission_rate_percent.toString(),
          payment_commission_rate_fixed:
            editableWallet.payment_commission_rate_fixed.toString(),
          disbursement_commission_rate_fixed:
            editableWallet.disbursement_commission_rate_fixed.toString(),
          settlement_commission_rate_fixed:
            editableWallet.settlement_commission_rate_fixed.toString(),
          topup_commission_rate_fixed:
            editableWallet.topup_commission_rate_fixed.toString(),
          min_payment_amount: editableWallet.min_payment_amount.toString(),
          max_payment_amount: editableWallet.max_payment_amount.toString(),
          min_disbursement_amount:
            editableWallet.min_disbursement_amount.toString(),
          max_disbursement_amount:
            editableWallet.max_disbursement_amount.toString(),
          can_balance_go_negative: editableWallet.can_balance_go_negative,
        }
      : {
          name: "",
          currency_id: "",
          is_active: true,
          enable_payment: true,
          enable_disbursement: true,
          vendor_id: "",
          payment_commission_rate_percent: "0",
          disbursement_commission_rate_percent: "0",
          settlement_commission_rate_percent: "0",
          topup_commission_rate_percent: "0",
          payment_commission_rate_fixed: "0",
          disbursement_commission_rate_fixed: "0",
          settlement_commission_rate_fixed: "0",
          topup_commission_rate_fixed: "0",
          min_payment_amount: "0",
          max_payment_amount: "0",
          min_disbursement_amount: "0",
          max_disbursement_amount: "0",
          can_balance_go_negative: false,
        },
  });

  const onSubmit = async (values: WalletFormValues) => {
    setIsLoading(true);
    try {
      const walletData: CreateWalletRequest = {
        name: values.name,
        currency_id: Number(values.currency_id),
        is_active: values.is_active,
        enable_payment: values.enable_payment,
        enable_disbursement: values.enable_disbursement,
        vendor_id: Number(values.vendor_id),
        payment_commission_rate_percent: Number(
          values.payment_commission_rate_percent
        ),
        disbursement_commission_rate_percent: Number(
          values.disbursement_commission_rate_percent
        ),
        settlement_commission_rate_percent: Number(
          values.settlement_commission_rate_percent
        ),
        topup_commission_rate_percent: Number(
          values.topup_commission_rate_percent
        ),
        payment_commission_rate_fixed: Number(
          values.payment_commission_rate_fixed
        ),
        disbursement_commission_rate_fixed: Number(
          values.disbursement_commission_rate_fixed
        ),
        settlement_commission_rate_fixed: Number(
          values.settlement_commission_rate_fixed
        ),
        topup_commission_rate_fixed: Number(values.topup_commission_rate_fixed),
        min_payment_amount: Number(values.min_payment_amount),
        max_payment_amount: Number(values.max_payment_amount),
        min_disbursement_amount: Number(values.min_disbursement_amount),
        max_disbursement_amount: Number(values.max_disbursement_amount),
        can_balance_go_negative: values.can_balance_go_negative,
      };

      if (isEditing && editableWallet) {
        const updateData: UpdateWalletRequest = {
          id: editableWallet.id,
          ...walletData,
        };
        const result = await AdminService.updateWallet(updateData);
        onUpdate?.(result);
      } else {
        const result = await AdminService.createWallet(walletData);
        onSuccess?.(result);
      }

      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Update Wallet" : "Create Wallet"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modify existing wallet configuration"
            : "Create a new wallet for vendor management"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormLabel>Currency ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter currency ID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter vendor ID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Enabled Features Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Enabled Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <FormLabel>Active Status</FormLabel>
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
                        <FormLabel>Enable Payments</FormLabel>
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
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Commission Rates Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Commission Rates (%)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="payment_commission_rate_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Commission (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disbursement_commission_rate_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disbursement Commission (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settlement_commission_rate_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Settlement Commission (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topup_commission_rate_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topup Commission (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Fixed Commission Rates Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fixed Commission Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="payment_commission_rate_fixed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Commission (Fixed)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disbursement_commission_rate_fixed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disbursement Commission (Fixed)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settlement_commission_rate_fixed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Settlement Commission (Fixed)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topup_commission_rate_fixed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topup Commission (Fixed)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Amount Limits Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Amount Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="min_payment_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Payment Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_payment_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Payment Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_disbursement_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Disbursement Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_disbursement_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Disbursement Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading
                ? isEditing
                  ? "Updating Wallet..."
                  : "Creating Wallet..."
                : isEditing
                ? "Update Wallet"
                : "Create Wallet"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
