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
import { VendorService } from "@/services/vendorService";
import { TOPUP_CHANNELS, type CreateTopupRequest } from "@/types/topup";

const topupSchema = z.object({
  vendor_wallet_id: z.string().min(1, "Vendor wallet ID is required"),
  channel: z.string().min(1, "Channel is required"),
  requested_amount: z.string().min(1, "Requested amount is required"),
  channel_note: z.string().min(1, "Channel note is required"),
  idempotency_key: z.string().min(1, "Idempotency key is required"),
});

type TopupFormValues = z.infer<typeof topupSchema>;

interface TopupFormProps {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export function TopupForm({ onSuccess, onError }: TopupFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TopupFormValues>({
    resolver: zodResolver(topupSchema),
    defaultValues: {
      vendor_wallet_id: "",
      channel: "",
      requested_amount: "",
      channel_note: "",
      idempotency_key: `topup_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    },
  });

  const onSubmit = async (values: TopupFormValues) => {
    setIsLoading(true);
    try {
      const topupData: CreateTopupRequest = {
        vendor_wallet_id: Number(values.vendor_wallet_id),
        channel: values.channel as CreateTopupRequest["channel"],
        requested_amount: Number(values.requested_amount),
        channel_note: values.channel_note,
        idempotency_key: values.idempotency_key,
      };

      const result = await VendorService.createTopup(topupData);
      onSuccess?.(result);
      form.reset();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateIdempotencyKey = () => {
    const key = `topup_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    form.setValue("idempotency_key", key);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Topup Request</CardTitle>
        <CardDescription>
          Submit a topup request to add funds to your vendor wallet
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="vendor_wallet_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Wallet ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter vendor wallet ID"
                      {...field}
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Channel</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment channel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TOPUP_CHANNELS.map((channel) => (
                        <SelectItem key={channel.value} value={channel.value}>
                          {channel.label}
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
              name="requested_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requested Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter amount to topup"
                      {...field}
                      type="number"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channel_note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Note</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Provide details about the topup method, reference, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idempotency_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idempotency Key</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Generate unique key to prevent duplicate transactions"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateIdempotencyKey}
                      disabled={isLoading}
                    >
                      Generate
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating Topup..." : "Create Topup Request"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
