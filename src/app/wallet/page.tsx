
"use client";

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { PlusCircle, Download, AlertTriangle, Landmark, Copy, Repeat, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { UserProfile, getMockUserFromStorage, updateMockUserInStorage } from "@/lib/auth";
import { useState, useEffect } from "react";
import { maskAccountNumber } from "@/lib/utils";
import { Separator } from '@/components/ui/separator';

const MOCK_PLATFORM_SETTINGS_KEY = 'mock_platform_settings_admin_page';

const defaultPlatformSettings = {
  ngnToUsd: 1450.50,
  usdToNgn: 1445.00,
  performanceFeePercent: 30.0,
};

const NGN_WITHDRAWAL_FEE = 100; // NGN

const depositOptionsUSD = [
  { usd: 150, label: "$150" },
  { usd: 500, label: "$500" },
  { usd: 1500, label: "$1500" },
];
const managementFeePercent = 0.05; // 5%

const conversionTargetUsdOptions = [
    { value: "150", label: "$150 USD" },
    { value: "500", label: "$500 USD" },
    { value: "1500", label: "$1500 USD" },
];


const NgnWalletTab = ({
  currentUser,
  adminNgnToUsdRate,
  onUserUpdate
}: {
  currentUser: UserProfile | null,
  adminNgnToUsdRate: number,
  onUserUpdate: () => void
}) => {
  const { toast } = useToast();
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [depositDialogData, setDepositDialogData] = useState<{ ngnAmount: number, reference?: string } | null>(null);
  const [showAccountNumber, setShowAccountNumber] = useState(false);


  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: `${fieldName} Copied`, description: `${text} copied to clipboard.` });
    }).catch(err => {
      toast({ title: `Copy Failed`, description: `Could not copy ${fieldName}.`, variant: "destructive" });
    });
  };

  const handleConfirmTransfer = () => {
    setIsDepositDialogOpen(false);
    toast({
      title: "Transfer Acknowledged",
      description: "Thank you. Your NGN wallet will be credited once the transfer is confirmed by our system (this is a mock confirmation).",
    });
  };

  if (!currentUser || currentUser.ngnWalletStatus !== 'created' || !currentUser.virtualAccountDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NGN Wallet Not Active</CardTitle>
          <CardDescription>Create your NGN wallet to enable NGN deposits and withdrawals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/create-ngn-wallet" passHref legacyBehavior>
            <Button className="w-full"><Landmark className="mr-2 h-4 w-4" /> Create Wallet</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const { virtualAccountDetails, ngnBalance } = currentUser;

  const handleShowDepositInstruction = (usdAmount: number) => {
    const ngnEquivalent = usdAmount * adminNgnToUsdRate;
    const totalNgnWithFee = ngnEquivalent * (1 + managementFeePercent);
    setDepositDialogData({ ngnAmount: totalNgnWithFee, reference: virtualAccountDetails.reference });
    setIsDepositDialogOpen(true);
  };

  const handleWithdrawRequest = () => {
    toast({ title: "Withdrawal Request (Mock)", description: "NGN withdrawal request submitted for review. This requires backend integration with AlatPay." });
  };

  return (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>NGN Balance</CardTitle>
        <CardDescription>Your Nigerian Naira wallet details.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold mb-4">{(ngnBalance ?? 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</p>

        <Card className="mb-6 shadow-md bg-secondary/30 dark:bg-secondary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Landmark size={18} /> Your NGN Virtual Account</CardTitle>
            <CardDescription>Use these details to fund your NGN wallet via bank transfer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">Bank Name:</span>
              <span>{virtualAccountDetails.bankName}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="font-medium">Account Number:</span>
                <div className="flex items-center gap-1">
                    <span>{showAccountNumber ? virtualAccountDetails.accountNumber : maskAccountNumber(virtualAccountDetails.accountNumber)}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAccountNumber(!showAccountNumber)}>
                        {showAccountNumber ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(virtualAccountDetails.accountNumber, "Account Number")}>
                        <Copy size={14} />
                    </Button>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-medium">Account Name:</span>
                <span>{virtualAccountDetails.accountName}</span>
            </div>
            {virtualAccountDetails.reference && (
               <div className="flex justify-between items-center">
                <span className="font-medium">Narration/Reference:</span>
                 <div className="flex items-center gap-2">
                    <span>{virtualAccountDetails.reference}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(virtualAccountDetails.reference!, "Reference")}>
                        <Copy size={14} />
                    </Button>
                </div>
            </div>
            )}
            <p className="text-xs text-muted-foreground pt-2">
                <AlertTriangle className="inline-block mr-1 h-3 w-3 text-yellow-500 dark:text-yellow-400" />
                Ensure the narration/reference is used if provided. Transfers can take a few minutes to reflect (backend dependent).
            </p>
          </CardContent>
        </Card>

        <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>NGN Deposit Instruction</DialogTitle>
                    <DialogDescription>
                        To fund your NGN wallet, please transfer the amount below to your virtual account.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                    <p>Amount to Transfer: <strong className="text-lg">{depositDialogData?.ngnAmount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</strong></p>
                    <Separator />
                    <p className="font-medium">Account Details:</p>
                    <p>Bank Name: {virtualAccountDetails.bankName}</p>
                    <p>Account Name: {virtualAccountDetails.accountName}</p>
                    <p>Account Number: {virtualAccountDetails.accountNumber}
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => handleCopyToClipboard(virtualAccountDetails.accountNumber, "Account Number")}>
                            <Copy size={12} />
                        </Button>
                    </p>
                    {depositDialogData?.reference && (
                        <p>Narration/Reference: {depositDialogData.reference}
                            <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => handleCopyToClipboard(depositDialogData.reference!, "Reference")}>
                                <Copy size={12} />
                            </Button>
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground pt-2">
                        Your NGN wallet will be credited once the transfer is confirmed (this requires backend integration).
                    </p>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <DialogClose asChild><Button type="button" variant="outline" className="w-full sm:w-auto">Close</Button></DialogClose>
                    <Button type="button" onClick={handleConfirmTransfer} className="w-full sm:w-auto">I have transferred</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PlusCircle size={20} /> Fund NGN Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose a deposit amount (USD equivalent). The NGN amount including a 5% management fee to transfer to your virtual account will be shown.</p>
              {depositOptionsUSD.map(option => {
                const ngnEquivalent = option.usd * adminNgnToUsdRate;
                const totalNgnWithFee = ngnEquivalent * (1 + managementFeePercent);
                return (
                  <Button
                    key={option.usd}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleShowDepositInstruction(option.usd)}
                  >
                    <span>Deposit {option.label}</span>
                    <span className="text-xs text-muted-foreground">Transfer ~{totalNgnWithFee.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Download size={20} /> Withdraw NGN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Withdraw to your local bank account via AlatPay.</p>
              <div>
                <Label htmlFor="ngn-withdraw-amount">Amount (NGN)</Label>
                <Input id="ngn-withdraw-amount" type="number" placeholder="e.g., 50000" />
              </div>
              <div>
                <Label htmlFor="ngn-bank-name">Bank Name</Label>
                <Select>
                  <SelectTrigger id="ngn-bank-name"><SelectValue placeholder="Select Bank" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alatpay-gtb">GTBank (via AlatPay)</SelectItem>
                    <SelectItem value="alatpay-access">Access Bank (via AlatPay)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ngn-account-number">Account Number</Label>
                <Input id="ngn-account-number" type="text" placeholder="0123456789" />
              </div>
              <Button className="w-full" onClick={handleWithdrawRequest}>Request Withdrawal</Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  </div>
  );
};

const UsdWalletTab = ({
  currentUser,
  adminNgnToUsdRate,
  adminUsdToNgnRate,
  onUserUpdate
}: {
  currentUser: UserProfile | null,
  adminNgnToUsdRate: number,
  adminUsdToNgnRate: number,
  onUserUpdate: () => void
}) => {
  const { toast } = useToast();
  const [selectedUsdToReceiveFromNgn, setSelectedUsdToReceiveFromNgn] = useState<string | undefined>(undefined);
  const [ngnRequiredForConversion, setNgnRequiredForConversion] = useState<number | null>(null);
  const [usdToWithdrawAsNgnInput, setUsdToWithdrawAsNgnInput] = useState<string>("");
  const [ngnToReceiveFromUsd, setNgnToReceiveFromUsd] = useState<number | null>(null);

  useEffect(() => {
    if (selectedUsdToReceiveFromNgn !== undefined && adminNgnToUsdRate > 0) {
      const usdAmount = parseFloat(selectedUsdToReceiveFromNgn);
      if (!isNaN(usdAmount)) {
        setNgnRequiredForConversion(usdAmount * adminNgnToUsdRate);
      } else {
        setNgnRequiredForConversion(null);
      }
    } else {
      setNgnRequiredForConversion(null);
    }
  }, [selectedUsdToReceiveFromNgn, adminNgnToUsdRate]);

  useEffect(() => {
    const amount = parseFloat(usdToWithdrawAsNgnInput);
    if (!isNaN(amount) && amount > 0 && adminUsdToNgnRate > 0) {
        const convertedNgn = amount * adminUsdToNgnRate;
        setNgnToReceiveFromUsd(convertedNgn - NGN_WITHDRAWAL_FEE);
    } else {
        setNgnToReceiveFromUsd(null);
    }
  }, [usdToWithdrawAsNgnInput, adminUsdToNgnRate]);


  const handleNowPaymentsDeposit = () => {
     toast({ title: "Deposit Action (Mock)", description: "Redirecting to NowPayments for USDT deposit (5% fee applies). Funds will be credited as USD. Requires backend." });
  };

  const handleNgnToUsdConversion = () => {
    if (!currentUser || selectedUsdToReceiveFromNgn === undefined || ngnRequiredForConversion === null) {
      toast({ title: "Invalid Selection or Rate", description: "Please select a USD amount and ensure rates are set.", variant: "destructive" });
      return;
    }
    const targetUsd = parseFloat(selectedUsdToReceiveFromNgn);
     if (isNaN(targetUsd) || targetUsd <= 0) {
      toast({ title: "Invalid USD Amount", description: "Please select a valid USD amount.", variant: "destructive" });
      return;
    }

    if (ngnRequiredForConversion <= 0) {
        toast({ title: "Calculation Error", description: "NGN required for conversion is zero or less.", variant: "destructive" });
        return;
    }
    if (ngnRequiredForConversion > (currentUser.ngnBalance ?? 0)) {
      toast({ title: "Insufficient NGN Balance", description: `Required: ${ngnRequiredForConversion.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}, Available: ${(currentUser.ngnBalance ?? 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}.`, variant: "destructive", duration: 7000 });
      return;
    }

    const updatedNgnBalance = (currentUser.ngnBalance ?? 0) - ngnRequiredForConversion;
    const updatedUsdBalance = (currentUser.usdBalance ?? 0) + targetUsd;

    updateMockUserInStorage({
        ngnBalance: updatedNgnBalance,
        usdBalance: updatedUsdBalance
    });
    onUserUpdate();

    toast({
      title: "NGN to USD Conversion Successful!",
      description: `${ngnRequiredForConversion.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })} converted to ${targetUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}. Balances updated.`,
    });
    setSelectedUsdToReceiveFromNgn(undefined);
  };

  const handleUsdToNgnWithdrawalRequest = () => {
    if (!currentUser) return;
    const amountToConvert = parseFloat(usdToWithdrawAsNgnInput);
    if (isNaN(amountToConvert) || amountToConvert <= 0) {
        toast({ title: "Invalid Amount", description: "Please enter a valid USD amount to convert.", variant: "destructive" });
        return;
    }
    if (amountToConvert > (currentUser.usdBalance ?? 0)) {
        toast({ title: "Insufficient USD Balance", description: `Convert amount $${amountToConvert.toFixed(2)} exceeds your USD balance of $${(currentUser.usdBalance ?? 0).toFixed(2)}.`, variant: "destructive" });
        return;
    }
    if (ngnToReceiveFromUsd === null || ngnToReceiveFromUsd <= 0) {
        toast({ title: "Conversion Error", description: "Calculated NGN amount is zero or less. Check rates and input.", variant: "destructive" });
        return;
    }

    const updatedUsdBalance = (currentUser.usdBalance ?? 0) - amountToConvert;
    updateMockUserInStorage({ usdBalance: updatedUsdBalance });
    onUserUpdate();

     toast({
        title: "NGN Withdrawal from USD Initiated (Mock)",
        description: `$${amountToConvert.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} converted. Approx. ${ngnToReceiveFromUsd.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })} (after ${NGN_WITHDRAWAL_FEE.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })} fee) requested for withdrawal to bank. Requires backend.`
     });
     setUsdToWithdrawAsNgnInput("");
  };

  const handleUsdtWithdrawRequest = () => {
    toast({ title: "Withdrawal Request (Mock)", description: "USD withdrawal (as USDT) request submitted for admin approval. Requires backend integration." });
  };

  const usdBalance = currentUser?.usdBalance ?? 0;
  const ngnBalance = currentUser?.ngnBalance ?? 0;

 return (
 <div className="space-y-6">
    <Card>
        <CardHeader>
            <CardTitle>USD Balance</CardTitle>
            <CardDescription>Your US Dollar wallet. Deposits can be made via USDT or by converting NGN.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold mb-6">{usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
        </CardContent>
    </Card>

    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusCircle size={20} /> Deposit USD</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Option 1: Deposit via NowPayments (USDT)</h3>
                <p className="text-sm text-muted-foreground mb-3">Deposit USDT using NowPayments. Your wallet will be credited in USD. A 5% fee applies (handled by payment gateway or backend).</p>
                <Button variant="outline" className="w-full sm:w-auto" onClick={handleNowPaymentsDeposit}>
                    Deposit via NowPayments (USDT)
                </Button>
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-semibold mb-2">Option 2: Convert NGN from your Wallet</h3>
                <p className="text-sm text-muted-foreground mb-3">
                    Choose a USD amount to convert your NGN balance to. No additional fees for this internal conversion.
                    Rate: 1 USD = {adminNgnToUsdRate.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="space-y-1">
                        <Label htmlFor="convert-usd-amount-select" className="flex items-center gap-1"><Repeat size={14}/>Select USD Amount to Receive</Label>
                        <Select value={selectedUsdToReceiveFromNgn} onValueChange={setSelectedUsdToReceiveFromNgn}>
                            <SelectTrigger id="convert-usd-amount-select">
                                <SelectValue placeholder="Select USD amount" />
                            </SelectTrigger>
                            <SelectContent>
                                {conversionTargetUsdOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <Button
                        className="w-full sm:w-auto"
                        onClick={handleNgnToUsdConversion}
                        disabled={!selectedUsdToReceiveFromNgn || ngnRequiredForConversion === null || ngnRequiredForConversion <= 0 || ngnRequiredForConversion > ngnBalance}
                    >
                        Convert NGN to USD
                    </Button>
                </div>
                 <p className="text-xs text-muted-foreground mt-2">Available NGN: {ngnBalance.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</p>
                {selectedUsdToReceiveFromNgn && ngnRequiredForConversion !== null && (
                    <p className="text-sm mt-1">NGN to be debited: <span className="font-medium">{ngnRequiredForConversion.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</span></p>
                )}
            </div>
        </CardContent>
    </Card>

    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download size={20} /> Withdraw USD</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Option 1: Withdraw USD (as USDT)</h3>
                <p className="text-sm text-muted-foreground mb-3">Withdraw to an external TRC20 or ArbitrumOne wallet (processed as USDT). Subject to admin approval.</p>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="usd-withdraw-amount">Amount (USD)</Label>
                        <Input id="usd-withdraw-amount" type="number" placeholder="e.g., 100" />
                    </div>
                    <div>
                        <Label htmlFor="usd-wallet-address">Wallet Address (USDT compatible)</Label>
                        <Input id="usd-wallet-address" type="text" placeholder="External Wallet Address" />
                    </div>
                    <div>
                        <Label htmlFor="usd-network">Network</Label>
                        <Select>
                        <SelectTrigger id="usd-network"><SelectValue placeholder="Select Network" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="trc20">TRC20 (Tron - for USDT)</SelectItem>
                            <SelectItem value="arbitrum">Arbitrum One (for USDT)</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full sm:w-auto" onClick={handleUsdtWithdrawRequest}>Request USDT Withdrawal</Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        <AlertTriangle className="inline-block mr-1 h-3 w-3 text-yellow-500 dark:text-yellow-400" />
                        USD withdrawals are processed manually as USDT after admin approval. Requires backend.
                    </p>
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-semibold mb-2">Option 2: Convert USD to NGN & Withdraw to Bank</h3>
                <p className="text-sm text-muted-foreground mb-3">Convert your USD balance to NGN and withdraw to your local bank account via AlatPay. A {NGN_WITHDRAWAL_FEE.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })} fee applies.
                <br/>Rate: 1 USD = {adminUsdToNgnRate.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
                </p>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="usd-to-ngn-withdraw-amount">Amount (USD) to Convert &amp; Withdraw</Label>
                        <Input
                            id="usd-to-ngn-withdraw-amount"
                            type="number"
                            placeholder="e.g., 100"
                            value={usdToWithdrawAsNgnInput}
                            onChange={(e) => setUsdToWithdrawAsNgnInput(e.target.value)}
                        />
                         <p className="text-xs text-muted-foreground mt-1">Available USD: {usdBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                    {ngnToReceiveFromUsd !== null && parseFloat(usdToWithdrawAsNgnInput) > 0 && (
                         <div className="text-sm space-y-1 border-t pt-3 mt-3">
                            <p>Net NGN to receive (after fee): <span className="font-medium">{ngnToReceiveFromUsd.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</span></p>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="ngn-bank-name-for-usd-withdrawal">Bank Name</Label>
                        <Select>
                        <SelectTrigger id="ngn-bank-name-for-usd-withdrawal"><SelectValue placeholder="Select Bank" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="alatpay-gtb">GTBank (via AlatPay)</SelectItem>
                            <SelectItem value="alatpay-access">Access Bank (via AlatPay)</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="ngn-account-number-for-usd-withdrawal">Account Number</Label>
                        <Input id="ngn-account-number-for-usd-withdrawal" type="text" placeholder="0123456789" />
                    </div>
                    <Button
                        className="w-full sm:w-auto"
                        onClick={handleUsdToNgnWithdrawalRequest}
                        disabled={!usdToWithdrawAsNgnInput || parseFloat(usdToWithdrawAsNgnInput) <= 0 || parseFloat(usdToWithdrawAsNgnInput) > usdBalance || (ngnToReceiveFromUsd !== null && ngnToReceiveFromUsd <=0)}
                    >
                        Request NGN Withdrawal from USD
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
  </div>
 );
};


export default function WalletPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [platformSettings, setPlatformSettings] = useState(defaultPlatformSettings);

  const fetchUserAndSettings = () => {
    const user = getMockUserFromStorage();
    setCurrentUser(user);

    const storedSettingsString = localStorage.getItem(MOCK_PLATFORM_SETTINGS_KEY);
    if (storedSettingsString) {
        try {
            const stored = JSON.parse(storedSettingsString);
            if (stored.platformSettings) {
              setPlatformSettings({
                ngnToUsd: stored.platformSettings.ngnToUsd ?? defaultPlatformSettings.ngnToUsd,
                usdToNgn: stored.platformSettings.usdToNgn ?? defaultPlatformSettings.usdToNgn,
                performanceFeePercent: stored.platformSettings.performanceFeePercent ?? defaultPlatformSettings.performanceFeePercent,
              });
            } else {
               setPlatformSettings(defaultPlatformSettings);
            }
        } catch (e) {
            console.error("Error parsing platform settings from localStorage", e);
            setPlatformSettings(defaultPlatformSettings);
        }
    } else {
      setPlatformSettings(defaultPlatformSettings);
    }
  };

  useEffect(() => {
    fetchUserAndSettings();

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'mockUser' || event.key === MOCK_PLATFORM_SETTINGS_KEY) {
           fetchUserAndSettings();
        }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }
  }, []);

  const handleUserUpdate = () => {
    fetchUserAndSettings();
  };


  return (
    <AppLayout>
      <PageHeader
        title="My Wallet"
        description="Manage your funds, make deposits, and withdrawals."
      />
      <Tabs defaultValue="ngn" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full gap-1 rounded-md bg-transparent p-0 items-stretch border-b sm:inline-flex sm:w-auto sm:items-center sm:justify-center sm:space-x-1 sm:rounded-md sm:bg-muted sm:p-1 sm:border-none">
          <TabsTrigger value="ngn" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground flex items-center gap-2">NGN Wallet</TabsTrigger>
          <TabsTrigger value="usd" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground flex items-center gap-2">USD Wallet</TabsTrigger>
        </TabsList>
        <TabsContent value="ngn" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden">
          <NgnWalletTab
            currentUser={currentUser}
            adminNgnToUsdRate={platformSettings.ngnToUsd}
            onUserUpdate={handleUserUpdate}
          />
        </TabsContent>
        <TabsContent value="usd" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden">
          <UsdWalletTab
            currentUser={currentUser}
            adminNgnToUsdRate={platformSettings.ngnToUsd}
            adminUsdToNgnRate={platformSettings.usdToNgn}
            onUserUpdate={handleUserUpdate}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
