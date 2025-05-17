
"use client";

import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeySettingsForm from '@/components/admin/ApiKeySettingsForm';
import AdminSettingsForm, { type AdminSettingsFormValues } from '@/components/admin/ExchangeRateSettingsForm'; // Renamed for clarity
import LogTradeForm from '@/components/admin/LogTradeForm';
import { KeyRound, Settings as SettingsIcon, BarChartHorizontalBig, AlertTriangle } from 'lucide-react'; // Renamed Settings to SettingsIcon
import { useState, useEffect } from 'react';
import { getMockUserFromStorage, UserProfile } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ApiKeyFormValues {
  klashaApiKey: string;
  alatPayApiKey: string;
  nowPaymentsApiKey: string;
}

const MOCK_PLATFORM_SETTINGS_KEY = 'mock_platform_settings_admin_page';

const initialApiKeys: ApiKeyFormValues = {
  klashaApiKey: "kl_sk_test_xxxxxxxxxxxxxxx",
  alatPayApiKey: "ap_sk_test_xxxxxxxxxxxxxxx",
  nowPaymentsApiKey: "np_sk_test_xxxxxxxxxxxxxxx",
};

const initialPlatformSettings: AdminSettingsFormValues = {
  ngnToUsd: 1450.50,
  usdToNgn: 1445.00,
  performanceFeePercent: 30.0,
};

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKeyFormValues>(initialApiKeys);
  const [platformSettings, setPlatformSettings] = useState<AdminSettingsFormValues>(initialPlatformSettings);

  useEffect(() => {
    const user = getMockUserFromStorage();
    setCurrentUser(user);
    setIsLoadingUser(false);

    const storedSettingsString = localStorage.getItem(MOCK_PLATFORM_SETTINGS_KEY);
    if (storedSettingsString) {
      try {
        const storedSettings = JSON.parse(storedSettingsString);
        if (storedSettings.apiKeys) setApiKeys(storedSettings.apiKeys);
        if (storedSettings.platformSettings) setPlatformSettings(storedSettings.platformSettings);
      } catch (e) {
        console.error("Error parsing admin settings from localStorage", e);
      }
    }
  }, []);

  const handleApiKeySave = (newApiKeys: ApiKeyFormValues) => {
    setApiKeys(newApiKeys);
    const currentSettings = {
      apiKeys: newApiKeys,
      platformSettings: platformSettings,
    };
    localStorage.setItem(MOCK_PLATFORM_SETTINGS_KEY, JSON.stringify(currentSettings));
  };

  const handlePlatformSettingsSave = (newSettings: AdminSettingsFormValues) => {
    setPlatformSettings(newSettings);
     const currentSettings = {
      apiKeys: apiKeys,
      platformSettings: newSettings,
    };
    localStorage.setItem(MOCK_PLATFORM_SETTINGS_KEY, JSON.stringify(currentSettings));
  };

  if (isLoadingUser) {
    return (
      <AppLayout>
        <PageHeader title="Admin Panel" description="Verifying access..." />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <AppLayout>
        <PageHeader title="Access Denied" description="You do not have permission to view this page." />
        <Card className="max-w-md mx-auto mt-8 shadow-lg border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              Permission Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">
              This area is restricted to administrators only.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Admin Panel"
        description="Manage platform settings, API keys, and log trades."
      />
      <Tabs defaultValue="api_keys" className="space-y-6">
        <TabsList className="grid grid-cols-[3fr_4fr_3fr] w-full gap-1 rounded-md bg-transparent p-0 items-stretch border-b sm:inline-flex sm:w-auto sm:items-center sm:justify-center sm:space-x-1 sm:rounded-md sm:bg-muted sm:p-1 sm:border-none">
          <TabsTrigger value="api_keys" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground">
            <KeyRound size={16} /> API Keys
          </TabsTrigger>
          <TabsTrigger value="platform_settings" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground">
            <SettingsIcon size={16} /> Platform Settings
          </TabsTrigger>
          <TabsTrigger value="log_trade" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:font-semibold sm:rounded-sm sm:border-b-0 sm:data-[state=active]:border-b-0 sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground">
            <BarChartHorizontalBig size={16} /> Log Trade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api_keys" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden">
          <ApiKeySettingsForm
            currentApiKeys={apiKeys}
            onSave={handleApiKeySave}
          />
        </TabsContent>
        <TabsContent value="platform_settings" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden">
          <AdminSettingsForm
            currentSettings={platformSettings}
            onSave={handlePlatformSettingsSave}
          />
        </TabsContent>
        <TabsContent value="log_trade" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[calc(100vh-20rem)] overflow-x-hidden">
          <LogTradeForm />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
