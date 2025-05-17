
"use client";

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from 'lucide-react';
import { format } from "date-fns"; 
import TransactionFilters from '@/components/transactions/TransactionFilters'; 
import { useToast } from "@/hooks/use-toast"; // Import useToast

type TransactionStatus = "completed" | "pending" | "failed" | "processing";
interface Transaction {
  id: string;
  date: string; // ISO String
  type: "Deposit" | "Withdrawal" | "Conversion" | "Investment" | "Referral Bonus" | "Profit/Loss";
  amount: number;
  currency: "NGN" | "USD"; 
  status: TransactionStatus;
  details: string; 
  entryPrice?: number;
  exitPrice?: number;
  tradeDirection?: "buy" | "sell";
}

const mockTransactions: Transaction[] = [
  { id: "txn001", date: "2024-07-28T10:30:00Z", type: "Deposit", amount: 500, currency: "USD", status: "completed", details: "Via NowPayments (USDT)" },
  { id: "txn002", date: "2024-07-27T14:15:00Z", type: "Investment", amount: 250, currency: "USD", status: "completed", details: "To Plan: Fusion Edge" },
  { id: "txn003", date: "2024-07-26T09:00:00Z", type: "Withdrawal", amount: 100000, currency: "NGN", status: "pending", details: "To GTBank ending 1234" },
  { id: "txn004", date: "2024-07-25T18:45:00Z", type: "Referral Bonus", amount: 25, currency: "USD", status: "completed", details: "From Level 1: Alice" },
  { id: "txn005", date: "2024-07-24T11:20:00Z", type: "Conversion", amount: 150000, currency: "NGN", status: "completed", details: "NGN to USD" }, 
  { id: "txn006", date: "2024-07-23T16:05:00Z", type: "Profit/Loss", amount: -15.50, currency: "USD", status: "completed", details: "Blaze Mode Trade on XAUUSD", entryPrice: 1950.25, exitPrice: 1945.75, tradeDirection: "sell" },
  { id: "txn007", date: "2024-07-22T08:55:00Z", type: "Deposit", amount: 725000, currency: "NGN", status: "failed", details: "Bank Transfer Issue" },
  { id: "txn008", date: "2024-07-21T12:10:00Z", type: "Withdrawal", amount: 200, currency: "USD", status: "processing", details: "To TRC20: T...XYZ (USDT)" },
  { id: "txn009", date: "2024-07-20T10:00:00Z", type: "Profit/Loss", amount: 30.75, currency: "USD", status: "completed", details: "Titan Shield Trade on EURUSD", entryPrice: 1.0850, exitPrice: 1.0910, tradeDirection: "buy" },
];

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  let badgeClass = "";
  switch (status) {
    case "completed": badgeClass = "bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-300 dark:border-green-700/30"; break;
    case "pending": badgeClass = "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/20 dark:text-yellow-300 dark:border-yellow-700/30"; break;
    case "failed": badgeClass = "bg-red-100 text-red-700 border-red-300 dark:bg-red-700/20 dark:text-red-300 dark:border-red-700/30"; break;
    case "processing": badgeClass = "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/20 dark:text-blue-300 dark:border-blue-700/30"; break;
    default: badgeClass = "bg-gray-100 text-gray-700 border-gray-300";
  }
  return <Badge variant="outline" className={`capitalize ${badgeClass}`}>{status}</Badge>;
};

export default function TransactionsPage() {
  const { toast } = useToast(); // Initialize useToast

  const handleDownloadReceipt = (transactionId: string) => {
    // In a real app, this would trigger a PDF download or navigate to a receipt page
    toast({
      title: "Download Receipt (Mock)",
      description: `Receipt for transaction ${transactionId} would be downloaded.`,
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Transaction History"
        description="View all your financial activities on the FeabsCopy platform."
      />
      
      <TransactionFilters />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A comprehensive list of your deposits, withdrawals, investments, and earnings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map(txn => {
                let displayDetails = txn.details;
                if (txn.type === "Profit/Loss") {
                  if (txn.tradeDirection) {
                    displayDetails += ` (${txn.tradeDirection.charAt(0).toUpperCase() + txn.tradeDirection.slice(1)})`;
                  }
                  if (txn.entryPrice || txn.exitPrice) {
                    let priceInfo = "";
                    if (txn.entryPrice) priceInfo += `E: ${txn.entryPrice.toFixed(4)}`;
                    if (txn.entryPrice && txn.exitPrice) priceInfo += ", ";
                    if (txn.exitPrice) priceInfo += `X: ${txn.exitPrice.toFixed(4)}`;
                    if (priceInfo) displayDetails += ` (${priceInfo})`;
                  }
                }
                return (
                  <TableRow key={txn.id}>
                    <TableCell>{format(new Date(txn.date), "PPp")}</TableCell>
                    <TableCell className="font-medium">{txn.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{displayDetails}</TableCell>
                    <TableCell className={`text-right font-semibold ${txn.type === "Profit/Loss" && txn.amount < 0 ? 'text-destructive' : txn.type === "Profit/Loss" && txn.amount > 0 ? 'text-green-600' : ''}`}>
                      {txn.type === "Profit/Loss" && txn.amount > 0 ? '+' : ''}
                      {txn.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </TableCell>
                    <TableCell>{txn.currency}</TableCell>
                    <TableCell className="text-center"><StatusBadge status={txn.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" title="Download Receipt" onClick={() => handleDownloadReceipt(txn.id)}>
                        <Download size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {mockTransactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No transactions found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

