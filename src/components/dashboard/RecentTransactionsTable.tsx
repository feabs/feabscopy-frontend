import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type TransactionStatus = "completed" | "pending" | "failed";
interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  currency: "NGN" | "USDT";
  status: TransactionStatus;
}

const mockTransactions: Transaction[] = [
  { id: "txn1", date: "2024-07-28", type: "Deposit", amount: 500, currency: "USDT", status: "completed" },
  { id: "txn2", date: "2024-07-27", type: "Investment", amount: 250, currency: "USDT", status: "completed" },
  { id: "txn3", date: "2024-07-26", type: "Withdrawal", amount: 100000, currency: "NGN", status: "pending" },
  { id: "txn4", date: "2024-07-25", type: "Referral Bonus", amount: 25, currency: "USDT", status: "completed" },
  { id: "txn5", date: "2024-07-24", type: "Conversion", amount: 150000, currency: "NGN", status: "failed" },
];

interface RecentTransactionsTableProps {
  isLoading?: boolean;
}

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  if (status === "completed") variant = "default"; // default is often green-ish or primary based in themes
  else if (status === "pending") variant = "secondary"; // secondary might be yellow/orange or gray
  else if (status === "failed") variant = "destructive";

  let className = "";
   if (status === "completed") className = "bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
   else if (status === "pending") className = "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20";
   // destructive variant already handles red color

  return <Badge variant={variant} className={className}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};


export default function RecentTransactionsTable({ isLoading = false }: RecentTransactionsTableProps) {
  const transactions = isLoading ? Array(5).fill(null) : mockTransactions.slice(0, 5);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>A quick look at your latest financial activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={transaction?.id || index}>
                <TableCell>
                  {isLoading ? <Skeleton className="h-4 w-20" /> : new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {isLoading ? <Skeleton className="h-4 w-24" /> : transaction.type}
                </TableCell>
                <TableCell className="text-right">
                  {isLoading ? <Skeleton className="h-4 w-16 ml-auto" /> : `${transaction.amount.toLocaleString()} ${transaction.currency}`}
                </TableCell>
                <TableCell className="text-center">
                  {isLoading ? <Skeleton className="h-6 w-20 mx-auto" /> : <StatusBadge status={transaction.status} />}
                </TableCell>
                <TableCell className="text-right">
                  {isLoading ? <Skeleton className="h-8 w-8 ml-auto rounded-full" /> : (
                    <Button variant="ghost" size="icon" title="Download Receipt">
                      <Download size={16} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {transactions.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">No recent transactions.</p>
        )}
      </CardContent>
      <CardFooter className="justify-end pt-4">
        <Button variant="link" className="text-primary" asChild>
          <Link href="/transactions">
            View All Transactions <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
