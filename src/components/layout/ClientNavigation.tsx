
"use client";

import type { ElementType, ReactNode } from 'react';
import NavLink from '@/components/shared/NavLink';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { 
    Settings, 
    ChevronDown, 
    LayoutDashboard, 
    Wallet, 
    TrendingUp, 
    Users, 
    List, 
    UserCircle, 
    ShieldCheck as ShieldCheckIcon,
    Computer // Added for Admin Panel
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface NavItemConfig {
  href: string;
  label: string;
  iconName: string;
}

interface ClientNavigationProps {
  navItems: NavItemConfig[];
  settingsSubItems: NavItemConfig[];
  isAdmin: boolean; // New prop
}

const iconMap: { [key: string]: ElementType } = {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Users,
  List,
  UserCircle,
  ShieldCheckIcon,
  Computer, // Added Computer icon
};

export default function ClientNavigation({ navItems, settingsSubItems, isAdmin }: ClientNavigationProps) {
  const { state: sidebarState, isMobile } = useSidebar(); 

  const renderNavItem = (item: NavItemConfig) => {
    const IconComponent = iconMap[item.iconName];
    const menuButtonContent = (
      <NavLink href={item.href}>
        {(isActive) => (
          <SidebarMenuButton isActive={isActive}>
            {IconComponent && <IconComponent />}
            <span>{item.label}</span>
          </SidebarMenuButton>
        )}
      </NavLink>
    );

    if (item.label && sidebarState === 'collapsed' && !isMobile) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            {menuButtonContent}
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }
    
    return menuButtonContent;
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          {renderNavItem(item)}
        </SidebarMenuItem>
      ))}
      
      {/* Settings with Submenu */}
      <SidebarMenuItem>
        <SidebarMenuButton> 
          <Settings />
          <span>Settings</span>
          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </SidebarMenuButton>
        <SidebarMenuSub>
          {settingsSubItems.map((item) => {
            const IconComponent = iconMap[item.iconName];
            return (
              <SidebarMenuItem key={item.href}>
                <NavLink href={item.href}>
                  {(isActive) => (
                    <SidebarMenuSubButton isActive={isActive}>
                      {IconComponent && <IconComponent />}
                      <span>{item.label}</span>
                    </SidebarMenuSubButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenuSub>
      </SidebarMenuItem>

      {/* Admin Panel Link */}
      {isAdmin && (
         <SidebarMenuItem>
           {renderNavItem({ href: '/admin', label: 'Admin Panel', iconName: 'Computer' })}
         </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}

