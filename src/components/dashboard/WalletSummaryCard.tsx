
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface WalletSummaryCardProps {
  title: string;
  balance: number | null;
  currency: "NGN" | "USD"; // Changed from USDT
  icon: React.ReactNode;
  isLoading?: boolean;
}

export default function WalletSummaryCard({ title, balance, currency, icon, isLoading = false }: WalletSummaryCardProps) {
  const [currentBalance, setCurrentBalance] = useState<string | null>(null);

  useEffect(() => {
    if (balance !== null) {
      const formattedBalance = new Intl.NumberFormat('en-US', { // Using en-US for consistent USD formatting
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(balance);
      setCurrentBalance(formattedBalance);
    } else {
      setCurrentBalance(null);
    }
  }, [balance]);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold flex items-center">
              <span>{currentBalance ?? "N/A"}</span>
              <span className="text-xs text-muted-foreground ml-1">{currency}</span>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Available Balance
            </CardDescription>
          </>
        )}
      </CardContent>
       <CardFooter className="flex justify-between gap-2 pt-4">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/wallet?tab=${currency.toLowerCase()}&action=deposit`}>
              <PlusCircle className="mr-2 h-4 w-4" /> Deposit
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
             <Link href={`/wallet?tab=${currency.toLowerCase()}&action=withdraw`}>
              <Download className="mr-2 h-4 w-4" /> Withdraw
            </Link>
          </Button>
        </CardFooter>
    </Card>
  );
}
