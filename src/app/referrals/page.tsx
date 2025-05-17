
"use client"; // Add this for useState, useEffect, and event handlers

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Copy, Gift, Award, TrendingUp, Coins } from 'lucide-react'; // Added Coins
import Image from 'next/image';
import CopyLinkButton from '@/components/referrals/CopyLinkButton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { getMockUserFromStorage, updateMockUserInStorage, UserProfile } from '@/lib/auth';


// Mock Data - this data is static for display
const referralStatsDisplay = {
  totalReferrals: 25,
  level1Commissions: 125.50, // USD
  level2Commissions: 45.80,  // USD
  matchingBonuses: 75.00,    // USD
  totalTeamInvestment: 85600.00, // USD
  currentLevel: 4,
  milestoneTarget: 100000, // USD
};

interface DownlineMember {
  id: string;
  name: string;
  dateJoined: string;
  capitalInvested: number; // USD
  bonusesEarned: number; // USD (This is for display, not what's necessarily withdrawable as a lump sum)
  level: number;
}

const mockDownline: DownlineMember[] = [
  { id: "ref1", name: "Alice Wonderland", dateJoined: "2024-06-15", capitalInvested: 1500, bonusesEarned: 75, level: 1 },
  { id: "ref2", name: "Bob The Builder", dateJoined: "2024-06-20", capitalInvested: 500, bonusesEarned: 25, level: 1 },
  { id: "ref3", name: "Charlie Brown", dateJoined: "2024-07-01", capitalInvested: 2000, bonusesEarned: 10, level: 2 },
  { id: "ref4", name: "Diana Prince", dateJoined: "2024-07-05", capitalInvested: 800, bonusesEarned: 4, level: 2 },
  { id: "ref5", name: "Edward Scissorhands", dateJoined: "2024-07-10", capitalInvested: 3000, bonusesEarned: 0, level: 3 },
];

const ReferralStatCard = ({ title, value, icon, unit, isLoading }: { title: string, value: string | number, icon: React.ElementType, unit?: string, isLoading?: boolean }) => {
    const Icon = icon;
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {isLoading ? "..." : value} {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
                </div>
            </CardContent>
        </Card>
    );
};


export default function ReferralsPage() {
  const referralLink = "https://feabscopy.com/register?ref=YOUR_CODE_HERE"; // Replace with dynamic link eventually
  const milestoneProgress = (referralStatsDisplay.totalTeamInvestment / referralStatsDisplay.milestoneTarget) * 100;
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(getMockUserFromStorage());
  }, []);

  const handleWithdrawCommissions = () => {
    if (!currentUser) {
        toast({ title: "Error", description: "User not loaded.", variant: "destructive"});
        return;
    }
    // These commission amounts are from the static display mock.
    // In a real app, withdrawable commissions would be stored in the user's profile.
    const totalCommissionToWithdraw = 
        referralStatsDisplay.level1Commissions + 
        referralStatsDisplay.level2Commissions + 
        referralStatsDisplay.matchingBonuses;

    if (totalCommissionToWithdraw <= 0) {
        toast({ title: "No Commissions", description: "No referral commissions to withdraw.", variant: "default"});
        return;
    }
    
    const updatedUsdBalance = (currentUser.usdBalance ?? 0) + totalCommissionToWithdraw;
    updateMockUserInStorage({ usdBalance: updatedUsdBalance });
    setCurrentUser(getMockUserFromStorage()); // Refresh current user state

    toast({
      title: "Commissions Withdrawn (Mock)",
      description: `$${totalCommissionToWithdraw.toFixed(2)} has been added to your USD wallet. Displayed referral stats will not reset in this mock.`,
    });
  };


  return (
    <AppLayout>
      <PageHeader
        title="Referral Program"
        description="Grow your network and earn commissions. Track your downline and milestone progress (amounts in USD)."
      />

      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Copy size={20} /> Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <input type="text" readOnly value={referralLink} className="flex-grow p-2 border rounded-md bg-muted text-sm" />
            <CopyLinkButton referralLink={referralLink} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ReferralStatCard title="Total Referrals" value={referralStatsDisplay.totalReferrals} icon={Users} />
            <ReferralStatCard title="Level 1 Commissions" value={referralStatsDisplay.level1Commissions.toFixed(2)} icon={DollarSign} unit="USD" />
            <ReferralStatCard title="Level 2 Commissions" value={referralStatsDisplay.level2Commissions.toFixed(2)} icon={DollarSign} unit="USD" />
            <ReferralStatCard title="Matching Bonuses" value={referralStatsDisplay.matchingBonuses.toFixed(2)} icon={Gift} unit="USD" />
        </div>
        
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Withdraw Commissions</CardTitle>
                <CardDescription>Transfer your earned referral commissions to your USD wallet.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleWithdrawCommissions} className="w-full sm:w-auto">
                    <Coins className="mr-2 h-4 w-4" /> Withdraw All Commissions to USD Wallet
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    Total displayed commissions: $
                    {(referralStatsDisplay.level1Commissions + referralStatsDisplay.level2Commissions + referralStatsDisplay.matchingBonuses).toFixed(2)}.
                    In a real system, withdrawable commissions would be tracked dynamically.
                </p>
            </CardContent>
        </Card>


        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award size={20} /> Milestone Bonus Progress</CardTitle>
            <CardDescription>
              Reach 5 levels AND $100K in total team investment to earn $2500 USD + $1500 event fund.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Team Investment: ${referralStatsDisplay.totalTeamInvestment.toLocaleString()} / ${referralStatsDisplay.milestoneTarget.toLocaleString()}</span>
                <span>Current Level: {referralStatsDisplay.currentLevel} / 5</span>
              </div>
              <Progress value={milestoneProgress} className="w-full h-3" />
              <p className="text-xs text-muted-foreground">
                {milestoneProgress.toFixed(1)}% towards investment volume target.
                {referralStatsDisplay.currentLevel < 5 && ` ${5 - referralStatsDisplay.currentLevel} more level(s) to reach.`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users size={20} /> Referral Tree Visualization (Binary)</CardTitle>
                <CardDescription>Your downline structure. Showing available slots.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80 w-full bg-muted rounded-md flex items-center justify-center p-4 overflow-auto" >
                     <Image
                        src="https://placehold.co/800x400.png?text=Binary+Tree%0AYou%0A%2F+%5C%0A(L)+Empty+---+(R)+Empty%0A%2F%5C+%2F%5C%0AE+E+E+E"
                        alt="Binary Referral Tree Visualization"
                        width={800}
                        height={400}
                        className="max-w-full h-auto"
                        data-ai-hint="binary tree" />
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp size={20} /> Downline Statistics</CardTitle>
            <CardDescription>Details of your referred members (amounts in USD).</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead className="text-right">Capital Invested (USD)</TableHead>
                  <TableHead className="text-right">Bonuses Earned (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDownline.map(member => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell><Badge variant="secondary">Lvl {member.level}</Badge></TableCell>
                    <TableCell>{new Date(member.dateJoined).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{member.capitalInvested.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">{member.bonusesEarned.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                  </TableRow>
                ))}
                {mockDownline.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            You have no downline members yet. Start referring to earn!
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
