
"use client";

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
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone as PhoneIcon, ShieldCheck, Landmark } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import { updateMockUserInStorage, getMockUserFromStorage, UserProfile, VirtualAccount } from "@/lib/auth";
import { Suspense, useEffect, useState } from "react";

const createNgnWalletSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  bvn: z.string().length(11, { message: "BVN must be 11 digits." }).regex(/^\d+$/, { message: "BVN must be numeric." }),
  bvnPhoneNumber: z.string().min(10, { message: "BVN-linked phone number is required." }).regex(/^\+?\d+$/, { message: "Phone number must be numeric."}),
});

type CreateNgnWalletFormValues = z.infer<typeof createNgnWalletSchema>;

function CreateNgnWalletForm() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [initialEmail, setInitialEmail] = useState('');

  // Attempt to get email from query params or localStorage
  useEffect(() => {
    const queryEmail = searchParams.get('email');
    if (queryEmail) {
      setInitialEmail(queryEmail);
      return;
    }
    const storedUser = getMockUserFromStorage();
    if (storedUser?.email) {
      setInitialEmail(storedUser.email);
    }
  }, [searchParams]);


  const form = useForm<CreateNgnWalletFormValues>({
    resolver: zodResolver(createNgnWalletSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      bvn: "",
      bvnPhoneNumber: "",
    },
  });

  // Populate form with stored user data if available
   useEffect(() => {
    const storedUser = getMockUserFromStorage();
    if (storedUser) {
      form.reset({
        firstName: storedUser.firstName || "",
        lastName: storedUser.lastName || "",
        email: initialEmail || storedUser.email || "", // Prioritize query email, then stored email
        bvn: storedUser.bvn || "",
        bvnPhoneNumber: storedUser.bvnPhoneNumber || "",
      });
    } else if (initialEmail) {
         form.setValue("email", initialEmail);
    }
  }, [form, initialEmail]);


  const onSubmit = async (data: CreateNgnWalletFormValues) => {
    // Simulate API call to backend, which then calls Klasha
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("NGN Wallet Creation Data Submitted:", data);

    // Mock Klasha API success and virtual account details
    const mockVirtualAccount: VirtualAccount = {
      bankName: "WEMA BANK",
      accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 10), // Random 10-digit
      accountName: `${data.firstName} ${data.lastName} - FeabsCopy`,
      reference: `URF_FC_${Date.now()}`
    };
    
    // Update mock user profile
    const userUpdates: Partial<UserProfile> = { 
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email, // ensure email is also updated if changed.
        bvn: data.bvn, 
        bvnPhoneNumber: data.bvnPhoneNumber,
        ngnWalletStatus: 'created', 
        virtualAccountDetails: mockVirtualAccount 
    };
    updateMockUserInStorage(userUpdates);

    toast({
      title: "NGN Virtual Account Created!",
      description: "Your NGN wallet is ready. Details will be shown in your wallet.",
    });
    router.push('/wallet?tab=ngn');
  };

  return (
    <AuthLayout 
      title="Create NGN Wallet"
      description="Provide your details to create your secure NGN virtual account via Klasha."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="John" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="Doe" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} className="pl-10" readOnly={!!initialEmail && initialEmail === field.value} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bvn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Verification Number (BVN)</FormLabel>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input 
                      placeholder="Enter your 11-digit BVN" 
                      {...field} 
                      maxLength={11}
                      className="pl-10"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bvnPhoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BVN-linked Phone Number</FormLabel>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input type="tel" placeholder="e.g. 08012345678 or +2348012345678" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-xs text-muted-foreground">
            By submitting, you consent to BVN verification and virtual account creation with Klasha. An OTP may be sent to your BVN-linked phone number by Klasha/their service provider.
          </p>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating Account..." : "Submit & Create NGN Wallet"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}


export default function CreateNgnWalletPage() {
  return (
    // Suspense is needed because CreateNgnWalletForm uses useSearchParams
    <Suspense fallback={<div>Loading...</div>}>
      <CreateNgnWalletForm />
    </Suspense>
  );
}
