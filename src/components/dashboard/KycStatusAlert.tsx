import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX } from "lucide-react";
import type { UserProfile } from "@/lib/auth";

interface KycStatusAlertProps {
  kycStatus: UserProfile['kycStatus'];
}

export default function KycStatusAlert({ kycStatus }: KycStatusAlertProps) {
  if (kycStatus === "approved") {
    return (
      <Alert variant="default" className="bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400">
        <ShieldCheck className="h-5 w-5" />
        <AlertTitle>KYC Approved</AlertTitle>
        <AlertDescription>
          Your identity has been verified. All platform features are available.
        </AlertDescription>
      </Alert>
    );
  }

  if (kycStatus === "pending") {
    return (
      <Alert variant="default" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-500">
        <ShieldQuestion className="h-5 w-5" />
        <AlertTitle>KYC Pending Review</AlertTitle>
        <AlertDescription>
          Your documents are currently under review. We'll notify you once the process is complete. Some features might be limited.
        </AlertDescription>
      </Alert>
    );
  }

  if (kycStatus === "rejected") {
    return (
      <Alert variant="destructive">
        <ShieldX className="h-5 w-5" />
        <AlertTitle>KYC Rejected</AlertTitle>
        <AlertDescription>
          Your KYC verification was not successful. Please check your email for details or{" "}
          <Link href="/kyc" legacyBehavior><a className="font-semibold underline">resubmit your documents</a></Link>.
        </AlertDescription>
      </Alert>
    );
  }

  // kycStatus === 'none' or default
  return (
    <Alert variant="default" className="bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400">
      <ShieldAlert className="h-5 w-5" />
      <AlertTitle>Complete KYC Verification</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between">
        <span>To access all platform features, please complete your KYC verification.</span>
        <Button asChild size="sm" className="mt-2 sm:mt-0 sm:ml-4">
          <Link href="/kyc">Start KYC</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
