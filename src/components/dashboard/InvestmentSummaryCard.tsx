import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Briefcase } from "lucide-react"; // Removed BarChart
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface InvestmentSummaryCardProps {
  activeInvestments: number | null;
  totalInvested: number | null; // Assumed to be in USD
  overallReturn: number | null; // Assumed to be in USD
  isLoading?: boolean;
}

export default function InvestmentSummaryCard({ activeInvestments, totalInvested, overallReturn, isLoading = false }: InvestmentSummaryCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase size={20} className="text-primary" />
          <span>Investment Overview</span>
        </CardTitle>
        <CardDescription>Summary of your investment activities.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Active Plans</p>
          {isLoading ? <Skeleton className="h-6 w-12 mt-1" /> : <p className="text-xl font-semibold">{activeInvestments ?? 'N/A'}</p>}
        </div>
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Total Invested (USD)</p>
          {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : <p className="text-xl font-semibold">{totalInvested?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }) ?? 'N/A'}</p>}
        </div>
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Overall P/L (USD)</p>
          {isLoading ? <Skeleton className="h-6 w-20 mt-1" /> : 
            <p className={`text-xl font-semibold ${overallReturn !== null ? (overallReturn >= 0 ? 'text-green-600' : 'text-destructive') : ''}`}>
              {overallReturn?.toLocaleString('en-US', { style: 'currency', currency: 'USD', signDisplay: 'always', minimumFractionDigits: 2 }) ?? 'N/A'}
            </p>
          }
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button variant="default" className="w-full sm:w-auto" asChild>
          <Link href="/investments">
            <TrendingUp className="mr-2 h-4 w-4" /> View Investments
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
