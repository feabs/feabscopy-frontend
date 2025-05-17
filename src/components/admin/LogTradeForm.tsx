
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BarChartHorizontalBig, TrendingUp, TrendingDown } from 'lucide-react'; // Removed ArrowRightLeft
import type { CopiedTrade } from "@/app/investments/page"; // Assuming CopiedTrade can be reused or a similar type

export const MOCK_LOGGED_TRADES_KEY = 'mock_logged_trades_admin';

const logTradeSchema = z.object({
  asset: z.string().min(1, "Asset symbol is required (e.g., XAUUSD, BTCUSDT)."),
  tradeDirection: z.enum(["buy", "sell"], { required_error: "Trade direction is required."}),
  tradeType: z.enum(["profit", "loss"], { required_error: "Trade outcome is required."}),
  percentageChange: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().positive("Percentage change must be a positive number.")
                   .max(1000, "Percentage change seems too high (max 1000%).") 
  ),
  entryPrice: z.preprocess(
    (val) => val === "" ? undefined : parseFloat(String(val)),
    z.number().positive("Entry price must be a positive number.").optional()
  ),
  exitPrice: z.preprocess(
    (val) => val === "" ? undefined : parseFloat(String(val)),
    z.number().positive("Exit price must be a positive number.").optional()
  ),
});

type LogTradeFormValues = z.infer<typeof logTradeSchema>;

export default function LogTradeForm() {
  const { toast } = useToast();
  const form = useForm<LogTradeFormValues>({
    resolver: zodResolver(logTradeSchema),
    defaultValues: {
      asset: "",
      tradeDirection: undefined,
      tradeType: undefined,
      percentageChange: 0,
      entryPrice: undefined,
      exitPrice: undefined,
    },
  });

  const onSubmit = async (data: LogTradeFormValues) => {
    console.log("Logging Trade:", data);
    
    const newLoggedTrade: Omit<CopiedTrade, 'id' | 'userProfitLoss'> & { adminPercentageChange: number } = {
        date: new Date().toISOString(),
        asset: data.asset,
        direction: data.tradeDirection === "buy" ? "Buy" : "Sell",
        outcome: data.tradeType === "profit" ? "Profit" : "Loss",
        adminPercentageChange: data.tradeType === "profit" ? data.percentageChange : -data.percentageChange,
        entryPrice: data.entryPrice,
        exitPrice: data.exitPrice,
    };

    try {
        const existingTradesString = localStorage.getItem(MOCK_LOGGED_TRADES_KEY);
        const existingTrades: CopiedTrade[] = existingTradesString ? JSON.parse(existingTradesString) : [];
        
        // For simplicity, new trade ID will be based on length. In real app, use UUID.
        const newTradeForUserLog: CopiedTrade = {
            ...newLoggedTrade,
            id: `logged_trade_${existingTrades.length + 1}`,
            // userProfitLoss will be calculated by the user's component for simulation
            userProfitLoss: 0, // Placeholder, will be simulated on user side
        };

        existingTrades.push(newTradeForUserLog);
        localStorage.setItem(MOCK_LOGGED_TRADES_KEY, JSON.stringify(existingTrades));

        let description = `A ${data.tradeDirection} trade resulting in ${data.tradeType} of ${data.percentageChange}% on ${data.asset}`;
        if (data.entryPrice) description += ` (Entry: ${data.entryPrice}`;
        if (data.exitPrice) description += data.entryPrice ? `, Exit: ${data.exitPrice})` : ` (Exit: ${data.exitPrice})`;
        else if (data.entryPrice) description += `)`;
        description += ` has been recorded and will reflect on user performance logs (simulated).`;

        toast({
        title: "Trade Logged Successfully",
        description: description,
        variant: data.tradeType === "profit" ? "default" : "destructive",
        className: data.tradeType === "profit" ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700" : "",
        });
        form.reset({ asset: "", tradeDirection: undefined, tradeType: undefined, percentageChange: 0, entryPrice: undefined, exitPrice: undefined });

    } catch (error) {
        console.error("Failed to save trade to localStorage:", error);
        toast({
            title: "Error Logging Trade",
            description: "Could not save trade details locally. Check console.",
            variant: "destructive",
        });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BarChartHorizontalBig size={20} /> Log Manual Trade Outcome</CardTitle>
        <CardDescription>
          Manually log the outcome of a trade. This will (simulated) affect user investments based on their copy settings and the trade's performance.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="asset"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Asset / Trading Pair</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., XAUUSD, BTC/USDT, EUR/USD" {...field} />
                    </FormControl>
                    <FormDescription>The financial instrument that was traded.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="tradeDirection"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Trade Direction</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select trade direction (Buy/Sell)" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="buy">
                                <span className="flex items-center"><TrendingUp className="mr-2 h-4 w-4 text-green-500" /> Buy / Long</span>
                            </SelectItem>
                            <SelectItem value="sell">
                                <span className="flex items-center"><TrendingDown className="mr-2 h-4 w-4 text-red-500" /> Sell / Short</span>
                            </SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>The direction of the trade.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g., 1.2345" {...field} 
                             onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>The price at which the trade was entered.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g., 1.2380" {...field} 
                             onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>The price at which the trade was exited.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="tradeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Outcome</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trade outcome (Profit/Loss)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="profit">
                        <span className="flex items-center"><TrendingUp className="mr-2 h-4 w-4 text-green-500" /> Profit</span>
                      </SelectItem>
                      <SelectItem value="loss">
                        <span className="flex items-center"><TrendingDown className="mr-2 h-4 w-4 text-red-500" /> Loss</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Was the trade a profit or a loss for the admin's master trade?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="percentageChange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage Change (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., for 5% profit enter 5, for 2% loss enter 2" {...field} 
                           onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormDescription>
                    Enter the positive percentage change. For a 5% profit, enter 5. For a 2% loss, enter 2 (type is selected above).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground pt-2">
              <strong>Important:</strong> Logging this trade will simulate its effect on all users copying the strategy. Ensure accuracy. Profits are added to user's profit balance. Losses affect profit balance first, then capital. This is a simplified model for demonstration.
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Logging Trade..." : "Log Trade Outcome"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    