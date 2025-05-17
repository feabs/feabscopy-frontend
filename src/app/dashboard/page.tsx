
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import WalletSummaryCard from '@/components/dashboard/WalletSummaryCard';
import InvestmentSummaryCard from '@/components/dashboard/InvestmentSummaryCard';
import RecentTransactionsTable from '@/components/dashboard/RecentTransactionsTable';
import KycStatusAlert from '@/components/dashboard/KycStatusAlert';
import { getCurrentUser, UserProfile } from '@/lib/auth'; 
import { Wallet, TrendingUp, Activity, ListChecks } from 'lucide-react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import GoldChart from '@/components/dashboard/GoldChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

// Mock data fetching or server-side props
async function getDashboardData() {
  const user = await getCurrentUser();
  // Simulate fetching other data
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return {
    user,
    ngnBalance: user?.ngnBalance ?? 0,
    usdBalance: user?.usdBalance ?? 0,
    activeInvestments: user ? 3 : 0, 
    totalInvested: user ? 2500.00 : 0, 
    overallReturn: user ? 150.75 : 0, 
    isLoading: !user, 
  };
}

interface DashboardTradeLog {
  id: string;
  asset: string;
  outcome: "Profit" | "Loss";
  resultDisplay: string; 
  date: string;
}

const mockPlatformTrades: DashboardTradeLog[] = [
  { id: "pt1", asset: "XAUUSD", outcome: "Profit", resultDisplay: "+2.8%", date: "2024-07-30T10:00:00Z" },
  { id: "pt2", asset: "EURUSD", outcome: "Loss", resultDisplay: "-1.1%", date: "2024-07-29T14:30:00Z" },
  { id: "pt3", asset: "BTC/USD", outcome: "Profit", resultDisplay: "+5.2%", date: "2024-07-29T09:15:00Z" },
  { id: "pt4", asset: "GBP/JPY", outcome: "Profit", resultDisplay: "+1.5%", date: "2024-07-28T11:45:00Z" },
];


export default async function DashboardPage() {
  const { user, ngnBalance, usdBalance, activeInvestments, totalInvested, overallReturn, isLoading } = await getDashboardData();

  if (!user) {
    // redirect('/login'); 
  }
  
  const kycStatus = user?.kycStatus || 'none';


  return (
    <AppLayout>
      <PageHeader 
        title={`Welcome back, ${user?.firstName || 'User'}!`}
        description="Here's an overview of your FeabsCopy account." 
      />

      <div className="space-y-6">
        <KycStatusAlert kycStatus={kycStatus} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <WalletSummaryCard 
            title="NGN Wallet" 
            balance={ngnBalance} 
            currency="NGN" 
            icon={<Wallet size={20} className="text-primary" />}
            isLoading={isLoading}
          />
          <WalletSummaryCard 
            title="USD Wallet" 
            balance={usdBalance} 
            currency="USD" 
            icon={<TrendingUp size={20} className="text-accent" />}
            isLoading={isLoading}
          />
        </div>
        
        <InvestmentSummaryCard 
          activeInvestments={activeInvestments}
          totalInvested={totalInvested} 
          overallReturn={overallReturn} 
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Activity size={20} className="text-primary" /> Market Activity (XAUUSD)</CardTitle>
                    <CardDescription>Live Gold vs US Dollar chart.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 md:p-2"> 
                    <GoldChart />
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListChecks size={20} /> Platform Trade Highlights</CardTitle>
                    <CardDescription>A quick look at recent platform trade outcomes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {mockPlatformTrades.slice(0, 4).map(trade => (
                        <div key={trade.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-secondary/30 dark:bg-secondary/20 hover:bg-secondary/50 transition-colors">
                            <div>
                                <span className="font-medium">{trade.asset}</span>
                                <span className="block text-xs text-muted-foreground">{format(new Date(trade.date), "MMM dd, HH:mm")}</span>
                            </div>
                            <div className="text-right">
                                <Badge variant={trade.outcome === 'Profit' ? 'default' : 'destructive'} className={
                                    trade.outcome === 'Profit' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-300 dark:border-green-700/30' 
                                                                : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/20 dark:text-red-300 dark:border-red-700/30'
                                }>
                                    {trade.outcome}
                                </Badge>
                                <span className={`block text-xs font-semibold ${trade.outcome === 'Profit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {trade.resultDisplay}
                                </span>
                            </div>
                        </div>
                    ))}
                     {mockPlatformTrades.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent platform trades to display.</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/investments?tab=performance">
                            View Detailed Performance
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>

        <RecentTransactionsTable isLoading={isLoading} />
      </div>
    </AppLayout>
  );
}
