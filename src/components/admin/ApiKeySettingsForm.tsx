
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
import { KeyRound, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const apiKeySchema = z.object({
  klashaApiKey: z.string().min(1, "Klasha API Key is required."),
  alatPayApiKey: z.string().min(1, "AlatPay API Key is required."),
  nowPaymentsApiKey: z.string().min(1, "NowPayments API Key is required."), // Added
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

interface ApiKeySettingsFormProps {
  currentApiKeys: ApiKeyFormValues;
  onSave: (data: ApiKeyFormValues) => void;
}

export default function ApiKeySettingsForm({ currentApiKeys, onSave }: ApiKeySettingsFormProps) {
  const { toast } = useToast();
  const [showKlashaKey, setShowKlashaKey] = useState(false);
  const [showAlatPayKey, setShowAlatPayKey] = useState(false);
  const [showNowPaymentsKey, setShowNowPaymentsKey] = useState(false); // Added

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: currentApiKeys, 
  });

  useEffect(() => {
    form.reset(currentApiKeys);
  }, [currentApiKeys, form]);

  const onSubmit = async (data: ApiKeyFormValues) => {
    onSave(data); 
    toast({
      title: "API Keys Updated",
      description: "Your API keys have been updated in this session.",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><KeyRound size={20} /> API Key Management</CardTitle>
        <CardDescription>
          Manage API keys for Klasha (BVN Verification), AlatPay (NGN Withdrawals), and NowPayments (USD Deposits via USDT).
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-700/10 dark:border-yellow-700/30 dark:text-yellow-300">
              <AlertTriangle className="h-4 w-4 !text-yellow-500 dark:!text-yellow-400" />
              <AlertTitle>Security Warning</AlertTitle>
              <AlertDescription>
                API keys are sensitive. Handle with extreme care. In a production environment, these should be stored securely on the server and never exposed client-side. This interface is for demonstration.
              </AlertDescription>
            </Alert>
            <FormField
              control={form.control}
              name="klashaApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klasha API Key (Secret)</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input type={showKlashaKey ? "text" : "password"} placeholder="Enter Klasha API Secret Key" {...field} className="pr-10" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowKlashaKey(!showKlashaKey)}
                    >
                      {showKlashaKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <FormDescription>Used for BVN verification services.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alatPayApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AlatPay API Key (Secret)</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input type={showAlatPayKey ? "text" : "password"} placeholder="Enter AlatPay API Secret Key" {...field} className="pr-10" />
                    </FormControl>
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowAlatPayKey(!showAlatPayKey)}
                    >
                      {showAlatPayKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <FormDescription>Used for NGN withdrawal processing.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nowPaymentsApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NowPayments API Key (Secret)</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input type={showNowPaymentsKey ? "text" : "password"} placeholder="Enter NowPayments API Secret Key" {...field} className="pr-10" />
                    </FormControl>
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNowPaymentsKey(!showNowPaymentsKey)}
                    >
                      {showNowPaymentsKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <FormDescription>Used for USD deposits (via USDT).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save API Keys"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
