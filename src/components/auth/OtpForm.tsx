
"use client";

import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Hash } from 'lucide-react';
import { useState, useEffect } from 'react';

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }).regex(/^\d+$/, { message: "OTP must be numeric."}),
});

type OtpFormValues = z.infer<typeof otpSchema>;

interface OtpFormProps {
  emailForDisplay?: string;
  redirectTo?: string; // Optional redirect path after successful OTP
}

export default function OtpForm({ emailForDisplay, redirectTo = '/verify-bvn' }: OtpFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: OtpFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("OTP Submitted:", data.otp);
    toast({
      title: "Email Verified Successfully!",
      description: `Proceeding to next step.`,
    });
    // On successful OTP verification:
    router.push(redirectTo);
  };

  const handleResendOtp = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "OTP Resent",
      description: `A new OTP has been sent to ${emailForDisplay || 'your email address'}.`,
    });
    setResendDisabled(true);
    setCountdown(60);
    form.resetField("otp");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {emailForDisplay && (
          <p className="text-center text-sm text-muted-foreground">
            An OTP has been sent to <strong>{emailForDisplay}</strong>.
          </p>
        )}
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter OTP</FormLabel>
               <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input 
                    placeholder="123456" 
                    {...field} 
                    maxLength={6}
                    className="pl-10 text-center tracking-[0.3em]"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
        </Button>
        <div className="mt-4 text-center text-sm">
          Didn&apos;t receive the code?{" "}
          <Button 
            type="button" 
            variant="link" 
            className="p-0 h-auto font-medium text-primary hover:underline"
            onClick={handleResendOtp}
            disabled={resendDisabled || form.formState.isSubmitting}
          >
            Resend OTP {resendDisabled && countdown > 0 ? `(${countdown}s)` : ""}
          </Button>
        </div>
         <div className="mt-4 text-center text-sm">
          <Link href="/login" legacyBehavior>
            <a className="font-medium text-primary hover:underline">Back to Login</a>
          </Link>
        </div>
      </form>
    </Form>
  );
}
