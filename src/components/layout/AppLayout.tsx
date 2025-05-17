
"use client"; 

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from '@/components/ui/sidebar'; 
import Logo from '@/components/icons/Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut } from 'lucide-react'; 
import type { UserProfile } from '@/lib/auth'; 
import ClientNavigation from './ClientNavigation'; 
import LogoutButton from './LogoutButton';
import NotificationButton from './NotificationButton'; 
import { useToast } from "@/hooks/use-toast"; 
import { useState, useEffect } from 'react'; 
import { getMockUserFromStorage } from '@/lib/auth'; 

const navItems = [
  { href: '/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
  { href: '/wallet', label: 'Wallet', iconName: 'Wallet' },
  { href: '/investments', label: 'Investments', iconName: 'TrendingUp' },
  { href: '/referrals', label: 'Referrals', iconName: 'Users' },
  { href: '/transactions', label: 'Transactions', iconName: 'List' },
];

const settingsSubItems = [
  { href: '/settings?tab=profile', label: 'Profile', iconName: 'UserCircle' },
  { href: '/settings?tab=security', label: 'Security', iconName: 'ShieldCheckIcon' },
  { href: '/settings?tab=kyc', label: 'KYC Status', iconName: 'ShieldCheckIcon' },
];


interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { toast } = useToast(); 
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedUser = getMockUserFromStorage();
    setUser(storedUser);

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'mockUser') {
            const updatedUser = getMockUserFromStorage();
            setUser(updatedUser);
        }
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }
  }, []);


  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="group block flex items-center gap-2">
            <Logo />
          </Link>
        </SidebarHeader>
        <ScrollArea className="flex-1">
          <SidebarContent className="p-2">
            <ClientNavigation 
              navItems={navItems} 
              settingsSubItems={settingsSubItems} 
              isAdmin={user?.isAdmin ?? false} 
            />
          </SidebarContent>
        </ScrollArea>
        <SidebarSeparator />
        <SidebarFooter className="p-4">
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            {/* Breadcrumbs or page title can go here */}
          </div>
          <div className="flex items-center gap-4">
            <NotificationButton /> 
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://placehold.co/100x100.png?text=${user.firstName?.[0] || 'U'}${user.lastName?.[0] || 'S'}`} alt={`${user.firstName} ${user.lastName}`} data-ai-hint="avatar person"/>
                      <AvatarFallback>{user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'S'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings?tab=profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wallet">Wallet</Link>
                  </DropdownMenuItem>
                   {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                        const logoutBtn = document.querySelector('[data-sidebar="footer"] button') as HTMLElement | null;
                        if (logoutBtn) {
                           logoutBtn.click();
                        } else {
                            toast({title: "Logout Failed", description: "Could not find logout button.", variant: "destructive"})
                        }
                    }}
                  >
                     <LogOut className="mr-2 h-4 w-4" />
                     <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
