
"use client";

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, BarChartBig, TrendingUp, AlertTriangle, History, Coins, PieChart, Filter, Users, Info } from 'lucide-react'; // Added Info
import { useState, useEffect, type ReactElement } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label"; // Added missing import
import type { UserProfile } from '@/lib/auth';
import { getMockUserFromStorage, updateMockUserInStorage } from '@/lib/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, parseISO, startOfMonth, endOfMonth, subYears, isToday, addDays, differenceInDays, isValid, startOfDay } from 'date-fns';
import { MOCK_LOGGED_TRADES_KEY } from '@/components/admin/LogTradeForm';


interface CopyPlanInterface {
  id: string;
  name: "Titan Shield" | "Fusion Edge" | "Blaze Mode";
  riskLevel: "Low" | "Moderate" | "High";
  copyFactor: 0.005 | 0.01 | 0.025; // 0.5%, 1%, 2.5% - Max loss exposure %
  icon: React.ElementType;
  colorClass: string;
}

const copyPlans: CopyPlanInterface[] = [
  { id: "titan", name: "Titan Shield", riskLevel: "Low", copyFactor: 0.005, icon: Shield, colorClass: "text-blue-500 dark:text-blue-400" },
  { id: "fusion", name: "Fusion Edge", riskLevel: "Moderate", copyFactor: 0.01, icon: BarChartBig, colorClass: "text-green-500 dark:text-green-400" },
  { id: "blaze", name: "Blaze Mode", riskLevel: "High", copyFactor: 0.025, icon: Zap, colorClass: "text-red-500 dark:text-red-400" },
];

export interface ActiveCopyAccountInterface {
  id: string;
  planName: string;
  investedAmount: number;
  currentCapital: number;
  profitOrLoss: number;
  maturityDate: string;
  status: "Active" | "Matured" | "Terminated";
  planCopyFactor: number; // e.g., 0.005 for 0.5%
  startDate: string;
}


const fixedInvestmentAmounts = [150, 500, 1500];

const MOCK_PLATFORM_SETTINGS_KEY = 'mock_platform_settings_admin_page';
const defaultPerformanceFee = 30;

const CopyPlanCard = ({ plan, onPlanActivated }: { plan: CopyPlanInterface, onPlanActivated: () => void }) => {
  const [selectedInvestmentAmount, setSelectedInvestmentAmount] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const displayCopyFactorPercent = (plan.copyFactor * 100).toFixed(1);
  const userInvestmentExample = 1000; // Example investment for dialog description
  const adminProfitExamplePercent = 10; // Example admin profit for dialog description

  let planHeaderDescriptionText: string;
  let dialogDescriptionWithExampleText: string;

  if (plan.name === "Titan Shield") {
    planHeaderDescriptionText = `This plan copies trades using ${displayCopyFactorPercent}% of your investment as maximum risk on losses, while capturing the admin's full profit % on wins.`;
    dialogDescriptionWithExampleText = `With Titan Shield, if an admin's trade results in a loss, your loss is capped at ${displayCopyFactorPercent}% of your total invested amount for that trade. If the admin's trade is a profit (e.g., +${adminProfitExamplePercent}%), your investment receives the full +${adminProfitExamplePercent}% profit on your total invested amount. For example, on a $${userInvestmentExample} investment: an admin's winning trade of +${adminProfitExamplePercent}% would result in a $${(userInvestmentExample * adminProfitExamplePercent / 100).toFixed(2)} profit for you. An admin's losing trade means your loss for that trade would be capped at $${(userInvestmentExample * plan.copyFactor).toFixed(2)} (${displayCopyFactorPercent}% of $${userInvestmentExample}). Select the amount of USD you want to invest. Your capital will be locked during the investment period.`;
  } else if (plan.name === "Fusion Edge") {
    planHeaderDescriptionText = `This plan copies trades using ${displayCopyFactorPercent}% of your investment as maximum risk on losses, while capturing the admin's full profit % on wins.`;
    dialogDescriptionWithExampleText = `With Fusion Edge, if an admin's trade results in a loss, your loss is capped at ${displayCopyFactorPercent}% of your total invested amount for that trade. If the admin's trade is a profit (e.g., +${adminProfitExamplePercent}%), your investment receives the full +${adminProfitExamplePercent}% profit on your total invested amount. For example, on a $${userInvestmentExample} investment: an admin's winning trade of +${adminProfitExamplePercent}% would result in a $${(userInvestmentExample * adminProfitExamplePercent / 100).toFixed(2)} profit for you. An admin's losing trade means your loss for that trade would be capped at $${(userInvestmentExample * plan.copyFactor).toFixed(2)} (${displayCopyFactorPercent}% of $${userInvestmentExample}). Select the amount of USD you want to invest. Your capital will be locked during the investment period.`;
  } else if (plan.name === "Blaze Mode") {
     planHeaderDescriptionText = `This plan copies trades using ${displayCopyFactorPercent}% of your investment as maximum risk on losses, while capturing the admin's full profit % on wins.`;
    dialogDescriptionWithExampleText = `With Blaze Mode, if an admin's trade results in a loss, your loss is capped at ${displayCopyFactorPercent}% of your total invested amount for that trade. If the admin's trade is a profit (e.g., +${adminProfitExamplePercent}%), your investment receives the full +${adminProfitExamplePercent}% profit on your total invested amount. For example, on a $${userInvestmentExample} investment: an admin's winning trade of +${adminProfitExamplePercent}% would result in a $${(userInvestmentExample * adminProfitExamplePercent / 100).toFixed(2)} profit for you. An admin's losing trade means your loss for that trade would be capped at $${(userInvestmentExample * plan.copyFactor).toFixed(2)} (${displayCopyFactorPercent}% of $${userInvestmentExample}). Select the amount of USD you want to invest. Your capital will be locked during the investment period.`;
  } else { // Fallback
    planHeaderDescriptionText = `Copies trades using ${displayCopyFactorPercent}% of your capital as max risk on losses, while capturing admin's full profit % on wins.`;
    dialogDescriptionWithExampleText = `Your investment strategy involves risking a maximum of ${displayCopyFactorPercent}% of your capital on losing trades, while aiming to achieve the admin's full profit percentage on winning trades. Select the amount of USD you want to invest. Your capital will be locked during the investment period.`;
  }


  const handleConfirmInvestment = () => {
    if (selectedInvestmentAmount === undefined) {
      toast({
        title: "Select Amount",
        description: "Please select an investment amount.",
        variant: "destructive",
      });
      return;
    }

    const currentUser = getMockUserFromStorage();
    if (!currentUser) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }

    if ((currentUser.usdBalance ?? 0) < selectedInvestmentAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${selectedInvestmentAmount.toFixed(2)} USD, but have $${(currentUser.usdBalance ?? 0).toFixed(2)}.`,
        variant: "destructive",
      });
      return;
    }

    const newActiveAccount: ActiveCopyAccountInterface = {
      id: `copy_acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      planName: plan.name,
      investedAmount: selectedInvestmentAmount,
      currentCapital: selectedInvestmentAmount, // Initial capital is the invested amount
      profitOrLoss: 0, // Starts with zero P/L
      maturityDate: addDays(new Date(), 30).toISOString(), // Example: 30-day maturity
      status: "Active",
      planCopyFactor: plan.copyFactor,
      startDate: new Date().toISOString(),
    };

    const updatedActiveAccounts = [...(currentUser.activeCopyAccounts || []), newActiveAccount];
    const updatedUsdBalance = (currentUser.usdBalance ?? 0) - selectedInvestmentAmount;

    updateMockUserInStorage({
      usdBalance: updatedUsdBalance,
      activeCopyAccounts: updatedActiveAccounts,
    });

    toast({
      title: "Copy Plan Activated!",
      description: `Successfully invested $${selectedInvestmentAmount.toFixed(2)} in ${plan.name}.`,
    });
    setIsDialogOpen(false);
    setSelectedInvestmentAmount(undefined);
    if (onPlanActivated) onPlanActivated();
  };


  return (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
    <CardHeader>
      <div className="flex items-center gap-3 mb-2">
        <plan.icon size={32} className={plan.colorClass} />
        <CardTitle className="text-xl">{plan.name}</CardTitle>
      </div>
      <Badge variant={plan.riskLevel === 'Low' ? 'default' : plan.riskLevel === 'Moderate' ? 'secondary' : 'destructive'} className={
        plan.riskLevel === 'Low' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/20 dark:text-blue-300 dark:border-blue-700/30' :
        plan.riskLevel === 'Moderate' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-300 dark:border-green-700/30' :
        'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/20 dark:text-red-300 dark:border-red-700/30'
      }>
        {plan.riskLevel} Risk
      </Badge>
      <CardDescription className="pt-2 text-sm">{planHeaderDescriptionText}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="text-3xl font-bold text-center my-4">
        {displayCopyFactorPercent}%
        <span className="block text-sm font-normal text-muted-foreground">Max Risk per Trade (on Losses)</span>
      </div>
       <p className="text-xs text-muted-foreground text-center px-2">
        On winning trades, you receive the admin's full profit percentage on your total investment.
      </p>
    </CardContent>
    <CardFooter>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedInvestmentAmount(undefined); // Reset selection when dialog closes
      }}>
        <DialogTrigger asChild>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Activate {plan.name}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Activate Copy Plan: {plan.name}</DialogTitle>
            <DialogDescription>
              {dialogDescriptionWithExampleText}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label>Choose Investment Amount (USD)</Label>
            <RadioGroup
              value={selectedInvestmentAmount?.toString()}
              onValueChange={(value) => setSelectedInvestmentAmount(Number(value))}
              className="space-y-2"
            >
              {fixedInvestmentAmounts.map(amount => (
                <div key={amount} className="flex items-center space-x-2">
                  <RadioGroupItem value={amount.toString()} id={`amount-${plan.id}-${amount}`} />
                  <Label htmlFor={`amount-${plan.id}-${amount}`} className="font-normal">
                    ${amount.toLocaleString()} USD
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleConfirmInvestment} disabled={selectedInvestmentAmount === undefined}>Confirm Activation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardFooter>
  </Card>
  );
};

const ActiveCopyAccountsTable = ({ activeAccounts, onAccountsUpdate }: { activeAccounts: ActiveCopyAccountInterface[], onAccountsUpdate: () => void }) => {
  const { toast } = useToast();

  const handleEarlyTermination = (accountId: string) => {
    const currentUser = getMockUserFromStorage();
    if (!currentUser || !currentUser.activeCopyAccounts) return;

    const accountToTerminate = currentUser.activeCopyAccounts.find(acc => acc.id === accountId);
    if (!accountToTerminate) return;

    // For simulation, refund 90% of *current capital*
    const refundAmount = (accountToTerminate.currentCapital ?? accountToTerminate.investedAmount) * 0.90;
    const updatedUsdBalance = (currentUser.usdBalance ?? 0) + refundAmount;

    // Filter out the terminated account
    const remainingAccounts = currentUser.activeCopyAccounts.filter(acc => acc.id !== accountId);
    
    // Recalculate accumulatedProfit based on remaining accounts
    const newAccumulatedProfit = remainingAccounts.reduce((sum, acc) => sum + (acc.profitOrLoss ?? 0), 0);

    updateMockUserInStorage({
        activeCopyAccounts: remainingAccounts,
        usdBalance: updatedUsdBalance,
        accumulatedProfit: newAccumulatedProfit
    });

    toast({
      title: "Early Termination (Mock)",
      description: `Account ${accountToTerminate.planName} (#${accountId.slice(-4)}) terminated. $${refundAmount.toFixed(2)} refunded to USD wallet. Accumulated profit adjusted.`,
    });
    onAccountsUpdate(); // Trigger parent to re-fetch user state
  };

  const canEarlyTerminate = (accountStartDateString: string): boolean => {
    if (!accountStartDateString) return false;
    const accountStartDate = parseISO(accountStartDateString);
    if (!isValid(accountStartDate)) return false;
    return differenceInDays(new Date(), accountStartDate) >= 30;
  };


  return (
  <Card className="mt-8 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Users size={22}/> Active Copy Accounts</CardTitle>
      <CardDescription>Monitor your ongoing copy accounts and their performance (amounts in USD).</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Name</TableHead>
            <TableHead>Invested (USD)</TableHead>
            <TableHead>Current Capital (USD)</TableHead>
            <TableHead>P/L (USD)</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Maturity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(activeAccounts || []).map((acc) => {
            const startDate = acc.startDate ? parseISO(acc.startDate) : null;
            const maturityDate = acc.maturityDate ? parseISO(acc.maturityDate) : null;
            return (
            <TableRow key={acc.id}>
              <TableCell className="font-medium">{acc.planName}</TableCell>
              <TableCell>{(acc.investedAmount ?? 0).toFixed(2)}</TableCell>
              <TableCell>{(acc.currentCapital ?? 0).toFixed(2)}</TableCell>
              <TableCell className={(acc.profitOrLoss ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {(acc.profitOrLoss ?? 0) >= 0 ? '+' : ''}{(acc.profitOrLoss ?? 0).toFixed(2)}
              </TableCell>
              <TableCell>{startDate && isValid(startDate) ? format(startDate, "PP") : 'N/A'}</TableCell>
              <TableCell>{maturityDate && isValid(maturityDate) ? format(maturityDate, "PP") : 'N/A'}</TableCell>
              <TableCell><Badge variant={acc.status === "Active" ? "default" : "outline"}>{acc.status}</Badge></TableCell>
              <TableCell className="text-right">
                {acc.status === "Active" && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={!canEarlyTerminate(acc.startDate)}>Early Terminate</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Early Termination Request</DialogTitle>
                                <DialogDescription>
                                    Requesting early termination may incur a penalty (e.g., you might only receive 90% of current capital back). Are you sure you want to proceed? This option is available after 30 days of investment.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button variant="destructive" onClick={() => handleEarlyTermination(acc.id)}>Confirm Termination</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
              </TableCell>
            </TableRow>
          )})}
           {(activeAccounts || []).length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                You have no active copy accounts.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
  );
};

export interface LoggedAdminTrade {
  id: string;
  date: string; // ISO string from admin log time
  asset: string;
  direction: "Buy" | "Sell";
  entryPrice?: number;
  exitPrice?: number;
  outcome: "Profit" | "Loss"; // Admin's trade outcome
  adminPercentageChange: number; // e.g., 3 for +3%, -2 for -2%
}


type PerformancePeriod = "today" | "7days" | "30days" | "yearly" | "all";


const InvestmentPerformanceLog = ({ user, onUserUpdate }: { user: UserProfile | null, onUserUpdate: () => void }) => {
  const { toast } = useToast();
  const [performanceFee, setPerformanceFee] = useState(defaultPerformanceFee);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PerformancePeriod>("all");

  const [allAdminTrades, setAllAdminTrades] = useState<LoggedAdminTrade[]>([]);
  const [filteredAdminTradesForDisplay, setFilteredAdminTradesForDisplay] = useState<LoggedAdminTrade[]>([]);
  const [currentAccumulatedProfit, setCurrentAccumulatedProfit] = useState<number>(user?.accumulatedProfit ?? 0);
  const [totalProfitLossForPeriod, setTotalProfitLossForPeriod] = useState<number>(0);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedSettingsString = localStorage.getItem(MOCK_PLATFORM_SETTINGS_KEY);
        if (storedSettingsString) {
            try {
                const stored = JSON.parse(storedSettingsString);
                if (stored.platformSettings && typeof stored.platformSettings.performanceFeePercent === 'number') {
                    setPerformanceFee(stored.platformSettings.performanceFeePercent);
                }
            } catch (e) { console.error("Error parsing performance fee", e); }
        }

        const adminLoggedTradesString = localStorage.getItem(MOCK_LOGGED_TRADES_KEY);
        if (adminLoggedTradesString) {
            try {
                const parsedTrades = JSON.parse(adminLoggedTradesString) as LoggedAdminTrade[];
                if (Array.isArray(parsedTrades)) {
                     setAllAdminTrades(parsedTrades.map(trade => ({
                        id: trade.id || `admin_trade_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                        date: trade.date || new Date().toISOString(),
                        asset: trade.asset || "Unknown Asset",
                        direction: trade.direction === "Buy" || trade.direction === "Sell" ? trade.direction : "Buy",
                        entryPrice: typeof trade.entryPrice === 'number' ? trade.entryPrice : undefined,
                        exitPrice: typeof trade.exitPrice === 'number' ? trade.exitPrice : undefined,
                        outcome: trade.outcome === "Profit" || trade.outcome === "Loss" ? trade.outcome : "Profit",
                        adminPercentageChange: typeof trade.adminPercentageChange === 'number' ? trade.adminPercentageChange : 0,
                    })));
                } else {
                    setAllAdminTrades([]);
                }
            } catch (e) {
                console.error("Error parsing admin trades from localStorage", e);
                setAllAdminTrades([]);
            }
        } else {
            setAllAdminTrades([]);
        }
    }
  }, []);

 useEffect(() => {
    if (!user || !user.activeCopyAccounts || user.activeCopyAccounts.length === 0) {
        const currentStoredProfit = user?.accumulatedProfit ?? 0;
        if (currentAccumulatedProfit !== currentStoredProfit) {
            setCurrentAccumulatedProfit(currentStoredProfit);
        }
        return;
    }

    // Deep clone active accounts for modification
    const updatedActiveAccountsFromProcessing = JSON.parse(JSON.stringify(user.activeCopyAccounts)) as ActiveCopyAccountInterface[];

    // Reset P/L and capital for each account before recalculating based on ALL admin trades
    updatedActiveAccountsFromProcessing.forEach(account => {
        account.profitOrLoss = 0;
        account.currentCapital = account.investedAmount;
    });

    allAdminTrades.forEach(adminTrade => {
        const adminOutcomePercent = adminTrade.adminPercentageChange;

        updatedActiveAccountsFromProcessing.forEach(account => {
            let pnlAmountForThisTrade = 0;
            if (adminOutcomePercent > 0) { // Admin Profit
                pnlAmountForThisTrade = account.investedAmount * (adminOutcomePercent / 100);
            } else { // Admin Loss (capped by plan's copy factor)
                // adminOutcomePercent is negative here, so direct multiplication works for loss
                pnlAmountForThisTrade = account.investedAmount * account.planCopyFactor * -1; // Loss is planCopyFactor of investedAmount
            }
            account.profitOrLoss += pnlAmountForThisTrade;
            account.currentCapital += pnlAmountForThisTrade;
        });
    });
    
    // Round final values for each account
    updatedActiveAccountsFromProcessing.forEach(account => {
        account.profitOrLoss = parseFloat(account.profitOrLoss.toFixed(2));
        account.currentCapital = parseFloat(account.currentCapital.toFixed(2));
    });

    const newOverallAccumulatedProfit = updatedActiveAccountsFromProcessing.reduce((sum, acc) => sum + acc.profitOrLoss, 0);
    const finalAccumulatedProfit = parseFloat(newOverallAccumulatedProfit.toFixed(2));

    const userAccumulatedProfit = user.accumulatedProfit ?? 0;
    const accountsDataChanged = JSON.stringify(user.activeCopyAccounts.map(a => ({ id:a.id, pl: (a.profitOrLoss??0).toFixed(2), cap: (a.currentCapital??a.investedAmount).toFixed(2) }))) !==
                              JSON.stringify(updatedActiveAccountsFromProcessing.map(a => ({ id:a.id, pl: (a.profitOrLoss??0).toFixed(2), cap: (a.currentCapital??a.investedAmount).toFixed(2) })));

    if (userAccumulatedProfit !== finalAccumulatedProfit || accountsDataChanged) {
        updateMockUserInStorage({
            accumulatedProfit: finalAccumulatedProfit,
            activeCopyAccounts: updatedActiveAccountsFromProcessing
        });
        setCurrentAccumulatedProfit(finalAccumulatedProfit); // Update local state for display
        if(onUserUpdate) onUserUpdate(); // Notify parent to re-fetch/re-render
    } else if (currentAccumulatedProfit !== userAccumulatedProfit) { // Sync local state if only that diverged
        setCurrentAccumulatedProfit(userAccumulatedProfit);
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [user?.activeCopyAccounts, user?.accumulatedProfit, allAdminTrades, onUserUpdate]); // Note: `user` itself is not a dep to avoid loops if onUserUpdate changes it.


  useEffect(() => { // For displaying filtered trades
    const now = new Date();
    let startDateBoundary: Date | null = null;

    switch (selectedPeriod) {
      case 'today': startDateBoundary = startOfDay(now); break;
      case '7days': startDateBoundary = subDays(now, 7); break;
      case '30days': startDateBoundary = subDays(now, 30); break;
      case 'yearly': startDateBoundary = subYears(now, 1); break;
      case 'all': default: break;
    }

    const tradesInPeriod = allAdminTrades.filter(adminTrade => {
        const tradeDate = parseISO(adminTrade.date);
        if (!isValid(tradeDate)) return false;
        if (selectedPeriod === 'today') return isToday(tradeDate);
        return startDateBoundary ? tradeDate >= startDateBoundary && tradeDate <= now : true;
    }).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()); // Sort by newest first
    setFilteredAdminTradesForDisplay(tradesInPeriod);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, allAdminTrades]);


  useEffect(() => { // For calculating P/L of *displayed* filtered trades for the summary
    if (!user || !user.activeCopyAccounts || user.activeCopyAccounts.length === 0 || filteredAdminTradesForDisplay.length === 0) {
        setTotalProfitLossForPeriod(0);
        return;
    }

    let periodPnlSum = 0;
    // Calculate the sum of P/L generated by the *filteredAdminTradesForDisplay* across all active accounts
    filteredAdminTradesForDisplay.forEach(adminTrade => {
        const adminOutcomePercent = adminTrade.adminPercentageChange;
        user.activeCopyAccounts?.forEach(account => {
            let pnlForThisAccountThisTrade = 0;
            if (adminOutcomePercent > 0) {
                pnlForThisAccountThisTrade = account.investedAmount * (adminOutcomePercent / 100);
            } else {
                pnlForThisAccountThisTrade = account.investedAmount * account.planCopyFactor * -1;
            }
            periodPnlSum += pnlForThisAccountThisTrade;
        });
    });
    setTotalProfitLossForPeriod(parseFloat(periodPnlSum.toFixed(2)));
  }, [filteredAdminTradesForDisplay, user]); // Recalculate if filtered trades or user (accounts) change


  const netWithdrawableProfit = currentAccumulatedProfit - (currentAccumulatedProfit * (performanceFee / 100));

  const canWithdrawProfit = (): boolean => {
    if (!user || !user.activeCopyAccounts || user.activeCopyAccounts.length === 0) return false;

    const oldestAccount = user.activeCopyAccounts.reduce((oldest, current) => {
        if (!oldest.startDate && !current.startDate) return oldest;
        if (!oldest.startDate) return current;
        if (!current.startDate) return oldest;
        const oldestDate = parseISO(oldest.startDate);
        const currentDate = parseISO(current.startDate);
        if (!isValid(oldestDate) && !isValid(currentDate)) return oldest;
        if (!isValid(oldestDate)) return current;
        if (!isValid(currentDate)) return oldest;
        return oldestDate < currentDate ? oldest : current;
    });

    if (!oldestAccount.startDate) return false;
    const oldestAccountStartDate = parseISO(oldestAccount.startDate);
    if (!isValid(oldestAccountStartDate)) return false;

    return differenceInDays(new Date(), oldestAccountStartDate) >= 15;
  };


  const handleWithdrawProfit = () => {
    if (!user) return;
    if (currentAccumulatedProfit <= 0) {
        toast({ title: "No Profits to Withdraw", description: "Your net withdrawable profit is zero or less.", variant: "destructive" });
        setIsWithdrawDialogOpen(false);
        return;
    }
    if (!canWithdrawProfit()) {
        toast({ title: "Withdrawal Not Available", description: "Profit withdrawal is available 15 days after your first copy plan activation.", variant: "destructive" });
        setIsWithdrawDialogOpen(false);
        return;
    }

    const updatedUsdBalance = (user.usdBalance ?? 0) + netWithdrawableProfit;
    // Reset profitOrLoss for each active account as profits are now "realized" to main balance
    const updatedActiveAccountsAfterWithdrawal = (user.activeCopyAccounts || []).map(acc => ({
      ...acc,
      profitOrLoss: 0
      // currentCapital should remain, representing invested + P/L (which is now 0 for this cycle)
    }));

    updateMockUserInStorage({
        accumulatedProfit: 0, // Reset overall accumulated profit
        usdBalance: updatedUsdBalance,
        activeCopyAccounts: updatedActiveAccountsAfterWithdrawal
    });

    setCurrentAccumulatedProfit(0); // Reflect in local state
    if(onUserUpdate) onUserUpdate();

    toast({
      title: "Profit Withdrawal Successful",
      description: `$${netWithdrawableProfit.toFixed(2)} (after ${performanceFee}% fee) has been added to your USD wallet. Your accumulated investment profit and individual account P/Ls are now reset.`,
    });
    setIsWithdrawDialogOpen(false);
  };


  const periodOptions: { value: PerformancePeriod; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "7days", label: "7 Days" },
    { value: "30days", label: "30 Days" },
    { value: "yearly", label: "Yearly" },
    { value: "all", label: "All Time" },
  ];


  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><PieChart size={22} /> Copy Trading Performance & Profits</CardTitle>
        <CardDescription>
            Track admin trades and manage your accumulated profits.
            "Total Accumulated Profit" reflects the sum of P/L from all your active copy accounts based on admin trades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-secondary/30 dark:bg-secondary/10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Accumulated Profit (All Accounts)</p>
              <p className="text-2xl font-bold text-primary">
                ${(currentAccumulatedProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button
                    disabled={(currentAccumulatedProfit ?? 0) <= 0 || !canWithdrawProfit()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Coins className="mr-2 h-4 w-4"/> Withdraw Profit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Accumulated Profit</DialogTitle>
                  <DialogDescription>
                    Review your profit withdrawal details. Profits will be transferred to your USD wallet.
                    This option is available 15 days after your first copy plan activation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 my-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Profit:</span>
                    <span className="font-medium">${(currentAccumulatedProfit ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Performance Fee ({performanceFee}%):</span>
                    <span className="font-medium text-destructive">-${((currentAccumulatedProfit ?? 0) * (performanceFee / 100)).toFixed(2)}</span>
                  </div>
                  <hr/>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net to USD Wallet:</span>
                    <span className="font-bold text-lg text-primary">${netWithdrawableProfit.toFixed(2)}</span>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleWithdrawProfit} disabled={netWithdrawableProfit <= 0}>Confirm Withdrawal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
           <p className="text-xs text-muted-foreground mt-1">
              Performance fee of {performanceFee}% applies to withdrawn profits. Withdrawal is available 15 days after your first active copy plan starts.
            </p>
        </div>

        <div className="mb-6 p-4 border rounded-lg bg-secondary/30 dark:bg-secondary/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-muted-foreground" />
                    <Label htmlFor="performance-period-select" className="text-sm font-medium">View Admin Trades For:</Label>
                    <Select value={selectedPeriod} onValueChange={(value: PerformancePeriod) => setSelectedPeriod(value)}>
                        <SelectTrigger id="performance-period-select" className="w-auto sm:w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            {periodOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground text-right">Total P/L from Displayed Admin Trades <br/>(Simulated impact across all your active accounts):</p>
                    <p className={`text-xl font-bold text-right ${totalProfitLossForPeriod >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {totalProfitLossForPeriod >= 0 ? '+' : ''}
                        {totalProfitLossForPeriod.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
            </div>
        </div>


        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><History size={18}/> Admin Trades Log</h3>
         <CardDescription className="mb-3">
            This table shows trades logged by the admin. Your "Total Accumulated Profit" (above) reflects the combined impact of these trades on all your active copy accounts.
        </CardDescription>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Entry Price</TableHead>
              <TableHead>Exit Price</TableHead>
              <TableHead className="text-right">Admin Outcome (% Change)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdminTradesForDisplay.map((trade) => {
              const tradeDate = trade.date ? parseISO(trade.date) : null;
              return (
              <TableRow key={trade.id}>
                <TableCell>{tradeDate && isValid(tradeDate) ? format(tradeDate, "MMM dd, yyyy HH:mm") : 'N/A'}</TableCell>
                <TableCell>{trade.asset}</TableCell>
                <TableCell>{trade.direction}</TableCell>
                <TableCell>{trade.entryPrice !== undefined ? trade.entryPrice.toFixed(trade.asset.toLowerCase().includes('jpy') ? 3: (trade.asset.toLowerCase().includes('btc') || trade.asset.toLowerCase().includes('eth')) ? 2 : 4) : 'N/A'}</TableCell>
                <TableCell>{trade.exitPrice !== undefined ? trade.exitPrice.toFixed(trade.asset.toLowerCase().includes('jpy') ? 3: (trade.asset.toLowerCase().includes('btc') || trade.asset.toLowerCase().includes('eth')) ? 2 : 4) : 'N/A'}</TableCell>
                <TableCell className={`text-right font-medium ${(trade.adminPercentageChange ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {(trade.adminPercentageChange ?? 0) > 0 ? '+' : ''}{(trade.adminPercentageChange ?? 0).toFixed(2)}%
                </TableCell>
              </TableRow>
            )})}
            {filteredAdminTradesForDisplay.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No admin trades found for the selected period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Main Page Component
export default function InvestmentsPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const fetchAndUpdateUser = () => {
    const user = getMockUserFromStorage();
    setCurrentUser(user);
  };

  useEffect(() => {
    fetchAndUpdateUser(); // Initial fetch

    const handleStorageChange = (event: StorageEvent) => {
        // Listen for changes to mockUser (updated by various actions)
        // or MOCK_LOGGED_TRADES_KEY (updated by admin logging trades)
        // or MOCK_PLATFORM_SETTINGS_KEY (updated by admin changing performance fee)
        if (event.key === 'mockUser' || event.key === MOCK_LOGGED_TRADES_KEY || event.key === MOCK_PLATFORM_SETTINGS_KEY) {
            fetchAndUpdateUser();
        }
    };

    if (typeof window !== 'undefined') { // Ensure this only runs on client
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }
  }, []);


  return (
    <AppLayout>
      <PageHeader
        title="Copy Trading Center"
        description="Choose copy plans, monitor active copy accounts, and track your performance. (All monetary values are in USD)"
      />
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList className="grid grid-cols-[2.5fr_4.5fr_3fr] w-full gap-1 rounded-md bg-transparent p-0 items-stretch border-b sm:inline-flex sm:w-auto sm:items-center sm:justify-center sm:space-x-1 sm:rounded-md sm:bg-muted sm:p-1 sm:border-none">
          <TabsTrigger value="plans" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground">Copy Plans</TabsTrigger>
          <TabsTrigger value="active_copy_accounts" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground">Active Copy Accounts</TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copyPlans.map(plan => <CopyPlanCard key={plan.id} plan={plan} onPlanActivated={fetchAndUpdateUser} />)}
          </div>
        </TabsContent>

        <TabsContent value="active_copy_accounts" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden">
          <ActiveCopyAccountsTable activeAccounts={currentUser?.activeCopyAccounts || []} onAccountsUpdate={fetchAndUpdateUser}/>
        </TabsContent>

        <TabsContent value="performance" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden">
          <InvestmentPerformanceLog user={currentUser} onUserUpdate={fetchAndUpdateUser} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

    