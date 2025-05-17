
"use client"; // Required for useSearchParams

import AuthLayout from '@/components/layout/AuthLayout';
import OtpForm from '@/components/auth/OtpForm';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  // The OTP form will now handle redirecting to /create-ngn-wallet
  return (
    <AuthLayout 
      title="Verify Your Email"
      description="Enter the One-Time Password (OTP) sent to your email address."
    >
      <OtpForm emailForDisplay={email || undefined} redirectTo="/create-ngn-wallet" />
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  // Wrap with Suspense because useSearchParams() needs it during SSR or static rendering
  return (
    <Suspense fallback={<div>Loading...</div>}> 
      <VerifyOtpContent />
    </Suspense>
  );
}
