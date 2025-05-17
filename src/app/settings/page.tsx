
"use client"; // For Tabs and Form interaction

import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { User, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import KycStatusAlert from '@/components/dashboard/KycStatusAlert'; 
import type { UserProfile } from '@/lib/auth'; 
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Mock user data - in a real app, this would come from an auth context or API
const initialMockUser: UserProfile = {
  id: 'user-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  residentialAddress: '123 Main St, Anytown, USA, 12345',
  bvnVerified: true,
  kycStatus: 'approved', 
  ngnBalance: 0, 
  usdBalance: 0, 
  ngnWalletStatus: 'created',
  virtualAccountDetails: {
      bankName: "WEMA BANK",
      accountNumber: "0123456789",
      accountName: "John Doe - FeabsCopy",
      reference: "REF123"
  }
};


const ProfileForm = () => {
  const { toast } = useToast();
  // In a real app, you'd fetch user data or use a global state/context
  const [user, setUser] = useState<UserProfile>(initialMockUser); 

  // Simulate fetching and setting user data if needed
  // useEffect(() => { /* fetch user data and setUser(fetchedData) */ }, []);

  const handleSaveChanges = () => {
    // Here you would typically call an API to save changes
    // For now, just show a toast
    toast({
      title: "Profile Changes Saved (Mock)",
      description: "Your profile information has been updated.",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><User size={20} /> Personal Information</CardTitle>
        <CardDescription>Update your personal details. Email is not editable.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue={user.firstName} />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue={user.lastName} />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" defaultValue={user.email} readOnly className="bg-muted/50 cursor-not-allowed" />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" defaultValue={user.phone} />
        </div>
        <div>
          <Label htmlFor="address">Residential Address</Label>
          <Textarea id="address" defaultValue={user.residentialAddress} />
        </div>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};

const SecurityForm = () => {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = () => {
    // Here you would typically call an API to update the password
    // For now, just show a toast
    toast({
      title: "Password Updated (Mock)",
      description: "Your account password has been changed.",
    });
    // Potentially clear password fields after mock submission
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lock size={20} /> Change Password</CardTitle>
        <CardDescription>Update your account password for enhanced security.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} placeholder="••••••••" />
           <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-1 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
           </Button>
        </div>
        <div className="relative">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" type={showNewPassword ? "text" : "password"} placeholder="••••••••" />
          <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-1 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
           </Button>
        </div>
        <div className="relative">
          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
          <Input id="confirmNewPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" />
           <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-1 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
           </Button>
        </div>
        <Button onClick={handleUpdatePassword}>Update Password</Button>
      </CardContent>
    </Card>
  );
};

const KycTabContent = () => {
  // In a real app, this kycStatus would come from user data
  const [kycStatus, setKycStatus] = useState<UserProfile['kycStatus']>(initialMockUser.kycStatus); 

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck size={20} /> KYC Status</CardTitle>
        <CardDescription>View your current KYC verification status.</CardDescription>
      </CardHeader>
      <CardContent>
        <KycStatusAlert kycStatus={kycStatus} />
        {/* Optionally show uploaded documents if status is pending/approved/rejected */}
        {kycStatus !== 'none' && kycStatus !== 'approved' && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Uploaded Documents (Mock):</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>ID Document: id_document.pdf (Submitted)</li>
              <li>Proof of Address: utility_bill.png (Submitted)</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export default function SettingsPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';

  return (
    <AppLayout>
      <PageHeader 
        title="Account Settings"
        description="Manage your profile, security, and verification settings."
      />
      <Tabs defaultValue={tab} className="space-y-4">
         <TabsList className="grid grid-cols-3 w-full gap-1 rounded-md bg-transparent p-0 items-stretch border-b sm:inline-flex sm:w-auto sm:items-center sm:justify-center sm:space-x-1 sm:rounded-md sm:bg-muted sm:p-1 sm:border-none">
          <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground">Profile</TabsTrigger>
          <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground">Security</TabsTrigger>
          <TabsTrigger value="kyc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground">KYC</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden"><ProfileForm /></TabsContent>
        <TabsContent value="security" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden"><SecurityForm /></TabsContent>
        <TabsContent value="kyc" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden"><KycTabContent /></TabsContent>
      </Tabs>
    </AppLayout>
  );
}

    

    

