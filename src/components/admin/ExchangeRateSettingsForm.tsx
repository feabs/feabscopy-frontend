
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Repeat, Percent } from 'lucide-react';
import { useEffect } from "react";

const settingsSchema = z.object({
  ngnToUsd: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().positive("Rate must be positive.")
  ),
  usdToNgn: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().positive("Rate must be positive.")
  ),
  performanceFeePercent: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Fee cannot be negative.").max(100, "Fee cannot exceed 100%.")
  ),
});

export type AdminSettingsFormValues = z.infer<typeof settingsSchema>;

interface AdminSettingsFormProps {
  currentSettings: AdminSettingsFormValues;
  onSave: (data: AdminSettingsFormValues) => void;
}

export default function AdminSettingsForm({ currentSettings, onSave }: AdminSettingsFormProps) {
  const { toast } = useToast();
  const form = useForm<AdminSettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: currentSettings,
  });

  useEffect(() => {
    form.reset(currentSettings);
  }, [currentSettings, form]);

  const onSubmit = async (data: AdminSettingsFormValues) => {
    onSave(data);
    toast({
      title: "Settings Updated",
      description: "Exchange rates and performance fee have been updated in this session.",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Repeat size={20} /> Platform Settings</CardTitle>
        <CardDescription>
          Set internal exchange rates for NGN/USD conversions and the profit performance fee.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="ngnToUsd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NGN to USD Rate (1 USD = X NGN)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 1450.50" {...field} />
                  </FormControl>
                  <FormDescription>Rate at which users buy USD with NGN.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="usdToNgn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>USD to NGN Rate (1 USD = X NGN)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 1445.00" {...field} />
                  </FormControl>
                  <FormDescription>Rate at which users sell USD for NGN.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="performanceFeePercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Percent size={16}/> Performance Fee (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 30 for 30%" {...field} />
                  </FormControl>
                  <FormDescription>Percentage fee charged on withdrawn profits.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <p className="text-xs text-muted-foreground pt-2">
                These settings are used for internal calculations on the platform.
                Changes take effect immediately for new actions.
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Updating..." : "Update Settings"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
